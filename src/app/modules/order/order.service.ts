import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError";
import { MenuItem } from "../menuItem/menuItem.model";
import { IOrder, IOrderItem } from "./order.interface";
import { Order } from "./order.model";
import mongoose from "mongoose";
import { getIO } from "../../../socket";

const TAX_RATE = 0.08; // 8% sales tax
const allowedTransitions: Record<string, Array<IOrder["status"]>> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [], // Final state
  cancelled: [], // Final state
};

const createOrderIntoDB = async (
  payload: Omit<
    IOrder,
    "restaurantId" | "orderNumber" | "subtotal" | "tax" | "total" | "status"
  > & { customerId?: string },
  restaurantId: string
): Promise<IOrder> => {
  const menuItemIds = payload.items.map((item) => item.menuItemId);
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

  for (const requestedItem of payload.items) {
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

  const orderData: IOrder = {
    ...payload,
    items: processedItems,
    restaurantId: new mongoose.Types.ObjectId(restaurantId),
    orderNumber,
    subtotal,
    tax,
    total,
    status: "pending",
  };

  const result = await Order.create(orderData);
  getIO().to(restaurantId).emit("order:created", result);
  return result;
};

// ✅ New function to get all orders
const getOrdersFromDB = async (
  restaurantId: string,
  query: { page?: string; status?: string }
): Promise<IOrder[]> => {
  const page = Number(query.page) || 1;
  const limit = 10; // Or make this configurable
  const skip = (page - 1) * limit;

  const filter: { restaurantId: any; status?: string } = {
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

// ✅ New function to update an order's status
const updateOrderStatusInDB = async (
  orderId: string,
  status: IOrder["status"]
): Promise<IOrder> => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  // State transition validation
  const currentStatus = order.status;
  if (!allowedTransitions[currentStatus]?.includes(status)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot transition order from '${currentStatus}' to '${status}'`
    );
  }

  const result = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );

  if (!result) {
    // This case is unlikely if the first findById succeeds, but good for safety
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found during update");
  }

  // Your socket logic remains the same
  getIO().to(result.restaurantId.toString()).emit("order:updated", result);
  if (result.customerId) {
    getIO().to(result.customerId.toString()).emit("order:notification", result);
  }

  return result;
};

const handleSuccessfulPayment = async (orderId: string): Promise<void> => {
  const order = await Order.findById(orderId);
  if (!order) {
    console.error(`Webhook Error: Could not find order with ID ${orderId}`);
    return;
  }

  order.paymentStatus = "paid";
  await order.save();

  // Notify the admin dashboard that the payment status was updated
  getIO().to(order.restaurantId.toString()).emit("order:updated", order);
};

export const OrderService = {
  createOrderIntoDB,
  getOrdersFromDB,
  updateOrderStatusInDB,
  handleSuccessfulPayment,
};
