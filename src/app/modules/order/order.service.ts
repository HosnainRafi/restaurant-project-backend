import httpStatus from "http-status";
import mongoose, { Types } from "mongoose";
import Stripe from "stripe";
import { getIO } from "../../../socket";
import ApiError from "../../../utils/ApiError";
import { MenuItem } from "../menuItem/menuItem.model";
import { IUser, TUserRole } from "../user/user.interface";
import { IOrder, IOrderItem } from "./order.interface";
import { Order } from "./order.model";
import { User } from "../user/user.model";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { NotificationService } from "../notification/notification.service";

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
  const customerData = { ...payload.customer, uid: user?.uid };
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

  let customerInDb = null;
  if (user?.uid) {
    customerInDb = await User.findOne({ uid: user.uid });
  }

  const orderData: IOrder = {
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
    // This is the key: link the order to the user's MongoDB _id
    customerId: customerInDb?._id,
  };

  const result = await Order.create(orderData);
  const admins = await User.find({ role: { $in: ["admin", "manager"] } });

  for (const admin of admins) {
    await NotificationService.createNotification({
      recipientId: admin._id,
      message: `New order #${result.orderNumber} has been placed.`,
      link: `/admin/dashboard/orders/${result._id}`,
    });
  }

  getIO().to(restaurantId).emit("order:created", result);
  return result;
};

const getOrdersFromDB = async (
  restaurantId: string,
  query: { page?: string; status?: string; limit?: string }
): Promise<IOrder[]> => {
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
    await stripe.refunds.create({ payment_intent: paymentIntentId });
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
): Promise<IOrder> => {
  // --- FIX: Populate the customerId field ---
  const order = await Order.findById(orderId).populate<{
    customerId: IUser | null;
  }>("customerId");

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  const currentStatus = order.status;
  if (currentStatus === "completed" || currentStatus === "cancelled") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Order is already in a final state ('${currentStatus}')`
    );
  }

  if (newStatus === "cancelled") {
    if (
      (currentStatus === "preparing" || currentStatus === "ready") &&
      !["admin", "manager"].includes(userRole)
    ) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Manager permission is required to cancel this order."
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

  const populatedCustomer = order.customerId;

  if (order.isPopulated("customerId") && populatedCustomer) {
    order.customerId = populatedCustomer._id;
  }

  order.status = newStatus;
  const updatedOrder = await order.save();

  if (populatedCustomer) {
    await NotificationService.createNotification({
      recipientId: populatedCustomer._id,
      message: `Your order #${updatedOrder.orderNumber} is now ${updatedOrder.status}.`,
      link: `/dashboard/my-orders/${updatedOrder._id}`,
    });

    getIO()
      .to(populatedCustomer._id.toString())
      .emit("order:updated", updatedOrder);
  }

  getIO()
    .to(updatedOrder.restaurantId.toString())
    .emit("order:updated", updatedOrder);

  return updatedOrder;
};

const handleSuccessfulPayment = async (orderId: string): Promise<void> => {
  const order = await Order.findById(orderId).populate<{
    customerId: IUser | null;
  }>("customerId");
  if (!order) {
    console.error(`Webhook Error: Could not find order with ID ${orderId}`);
    return;
  }

  const populatedCustomer = order.customerId;

  if (order.isPopulated("customerId") && populatedCustomer) {
    order.customerId = populatedCustomer._id;
  }

  order.paymentStatus = "paid";
  await order.save();

  if (populatedCustomer) {
    await NotificationService.createNotification({
      recipientId: populatedCustomer._id,
      message: `Payment successful for order #${order.orderNumber}!`,
      link: `/dashboard/my-orders/${order._id}`,
    });
  }

  getIO().to(order.restaurantId.toString()).emit("order:updated", order);
};

export const OrderService = {
  createOrderIntoDB,
  getOrdersFromDB,
  updateOrderStatusInDB,
  handleSuccessfulPayment,
};
