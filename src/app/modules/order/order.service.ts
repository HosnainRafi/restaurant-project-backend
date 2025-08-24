import httpStatus from "http-status";
import mongoose from "mongoose";
import Stripe from "stripe"; // Your import is correct
import { getIO } from "../../../socket";
import ApiError from "../../../utils/ApiError";
import { MenuItem } from "../menuItem/menuItem.model";
import { TUserRole } from "../user/user.interface";
import { IOrder, IOrderItem } from "./order.interface";
import { Order } from "./order.model";
import { User } from "../user/user.model";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { NotificationService } from "../notification/notification.service";

// --- FIX: Instantiate the Stripe object ---
// Create a new instance of the Stripe class with your secret key.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const TAX_RATE = 0.08;

const allowedTransitions: Partial<
  Record<IOrder["status"], IOrder["status"][]>
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

// --- FIX #1: Provide the second argument to Omit ---
const createOrderIntoDB = async (
  payload: Omit<
    IOrder,
    | "restaurantId"
    | "orderNumber"
    | "subtotal"
    | "tax"
    | "total"
    | "status"
    | "paymentStatus"
  >,
  restaurantId: string,
  user: DecodedIdToken | null
): Promise<IOrder> => {
  const customerData = {
    ...payload.customer,
    uid: user?.uid,
  };

  // --- FIX #3: Explicitly type the 'item' parameter ---
  const menuItemIds = payload.items.map((item: IOrderItem) => item.menuItemId);
  const availableItems = await MenuItem.find({
    _id: { $in: menuItemIds },
    isAvailable: true,
  });

  if (menuItemIds.length !== availableItems.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "One or more menu items are invalid or unavailable."
    );
  }

  let subtotal = 0;
  const processedItems: IOrderItem[] = [];
  // --- FIX #3: Explicitly type the 'requestedItem' parameter ---
  for (const requestedItem of payload.items as IOrderItem[]) {
    const dbItem = availableItems.find(
      (item) => item._id.toString() === requestedItem.menuItemId.toString()
    );
    if (!dbItem) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Error processing order items."
      );
    }
    const itemTotal = dbItem.price * requestedItem.quantity;
    subtotal += itemTotal;
    processedItems.push({
      menuItemId: dbItem._id,
      name: dbItem.name,
      quantity: requestedItem.quantity,
      price: dbItem.price,
    });
  }

  const tax = Math.round(subtotal * TAX_RATE);
  const tip = payload.tip || 0;
  const total = subtotal + tax + tip;
  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const orderData = {
    ...payload,
    items: processedItems,
    restaurantId: new mongoose.Types.ObjectId(restaurantId),
    customer: customerData,
    orderNumber,
    subtotal,
    tax,
    total,
    status: "pending",
    paymentStatus: "unpaid",
  } as IOrder;

  const result = await Order.create(orderData);
  const admins = await User.find({ role: { $in: ["admin", "manager"] } });
  for (const admin of admins) {
    await NotificationService.createNotification({
      recipientId: admin._id,
      message: `New order #${result.orderNumber} has been placed.`,
      link: `/admin/dashboard/orders`,
    });
  }

  // Notify Customer (if they are logged in)
  if (result.customer.uid) {
    const customer = await User.findOne({ uid: result.customer.uid });
    if (customer) {
      await NotificationService.createNotification({
        recipientId: customer._id,
        message: `Your order #${result.orderNumber} has been placed successfully.`,
        link: `/customer/dashboard/my-orders`,
      });
    }
  }
  return result;
};

const getOrdersFromDB = async (
  restaurantId: string,
  query: { page?: string; status?: string; limit?: string }
): Promise<IOrder[]> => {
  // This function is correct and does not need changes.
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 15;
  const skip = (page - 1) * limit;
  const filter: { restaurantId: mongoose.Types.ObjectId; status?: string } = {
    restaurantId: new mongoose.Types.ObjectId(restaurantId),
  };
  if (query.status) {
    filter.status = query.status;
  }
  const result = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return result;
};

const refundStripePayment = async (paymentIntentId: string) => {
  try {
    // Both calls now correctly use the lowercase 'stripe' instance
    const existingRefunds = await stripe.refunds.list({
      payment_intent: paymentIntentId,
      limit: 1,
    });

    if (existingRefunds.data.length > 0) {
      console.log(
        `Refund already exists for Payment Intent ${paymentIntentId}. Skipping.`
      );
      return;
    }

    await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    console.log(
      `Stripe refund initiated for Payment Intent ${paymentIntentId}.`
    );
  } catch (error: any) {
    console.error(
      `Stripe refund failed for Payment Intent ${paymentIntentId}:`,
      error.message
    );
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Stripe refund failed. Please check the Stripe dashboard to process it manually."
    );
  }
};

const updateOrderStatusInDB = async (
  orderId: string,
  newStatus: IOrder["status"],
  userRole: TUserRole
): Promise<IOrder | null> => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  const currentStatus = order.status;

  if (currentStatus === "completed" || currentStatus === "cancelled") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Order is already in a final state ('${currentStatus}') and cannot be changed.`
    );
  }

  if (newStatus === "cancelled") {
    if (
      (currentStatus === "preparing" || currentStatus === "ready") &&
      userRole !== "manager" &&
      userRole !== "admin"
    ) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Manager permission is required to cancel an order that is being prepared."
      );
    }

    if (order.paymentStatus === "paid" && order.paymentIntentId) {
      await refundStripePayment(order.paymentIntentId);
    }
  } else {
    const validNextStatuses = allowedTransitions[currentStatus];
    if (!validNextStatuses || !validNextStatuses.includes(newStatus)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Invalid status transition from '${currentStatus}' to '${newStatus}'.`
      );
    }
  }

  order.status = newStatus;
  const updatedOrder = await order.save();

  // 1. Notify all Admins and Managers
  const adminsToNotify = await User.find({
    role: { $in: ["admin", "manager"] },
  });

  for (const admin of adminsToNotify) {
    // This check prevents the person who changed the status from getting a notification about their own action.
    if (userRole !== admin.role) {
      await NotificationService.createNotification({
        recipientId: admin._id,
        message: `Order #${updatedOrder.orderNumber} is now ${newStatus}.`,
        link: `/admin/dashboard/orders`,
      });
    }
  }

  // 2. Notify the Customer
  if (updatedOrder.customer.uid) {
    const customerUser = await User.findOne({ uid: updatedOrder.customer.uid });
    if (customerUser) {
      await NotificationService.createNotification({
        recipientId: customerUser._id,
        message: `Your order #${updatedOrder.orderNumber} is now ${updatedOrder.status}.`,
        link: `/customer/dashboard/my-orders`,
      });
    }
  }
  // --- END: Consolidated Notification Logic ---

  return updatedOrder;
};

const handleSuccessfulPayment = async (orderId: string): Promise<void> => {
  // This function is correct and does not need changes.
  const order = await Order.findById(orderId);
  if (!order) {
    console.error(`Webhook Error: Could not find order with ID ${orderId}`);
    return;
  }
  order.paymentStatus = "paid";
  await order.save();
  getIO().to(order.restaurantId.toString()).emit("order:updated", order);
};

export const OrderService = {
  createOrderIntoDB,
  getOrdersFromDB,
  updateOrderStatusInDB,
  handleSuccessfulPayment,
};
