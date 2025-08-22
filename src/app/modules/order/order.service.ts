import httpStatus from "http-status";
import mongoose from "mongoose";
import { getIO } from "../../../socket";
import ApiError from "../../../utils/ApiError";
import { MenuItem } from "../menuItem/menuItem.model";
import { IOrder, IOrderItem } from "./order.interface";
import { Order } from "./order.model";

const TAX_RATE = 0.08;

// A state machine defining all valid status transitions
const allowedTransitions: Partial<
  Record<IOrder["status"], IOrder["status"][]>
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  // Final states have no available transitions
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
  > & { customerId?: string },
  restaurantId: string
): Promise<IOrder> => {
  // This function remains the same.
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
  const orderData = {
    ...payload,
    items: processedItems,
    restaurantId: new mongoose.Types.ObjectId(restaurantId),
    orderNumber,
    subtotal,
    tax,
    total,
    status: "pending",
    paymentStatus: "unpaid",
  } as IOrder;
  const result = await Order.create(orderData);
  getIO().to(restaurantId).emit("order:created", result);
  return result;
};

const getOrdersFromDB = async (
  restaurantId: string,
  query: { page?: string; status?: string; limit?: string }
): Promise<IOrder[]> => {
  // This function remains the same.
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

// --- THIS IS THE FUNCTION TO UPDATE ---
const updateOrderStatusInDB = async (
  orderId: string,
  newStatus: IOrder["status"]
): Promise<IOrder> => {
  // 1. Fetch the order from the database
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  const currentStatus = order.status;

  // 2. Lock final states: prevent updates if the order is already completed or cancelled
  if (currentStatus === "completed" || currentStatus === "cancelled") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Order is already in a final state ('${currentStatus}') and cannot be changed.`
    );
  }

  // 3. Validate the requested transition
  const validNextStatuses = allowedTransitions[currentStatus];
  if (!validNextStatuses || !validNextStatuses.includes(newStatus)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid status transition from '${currentStatus}' to '${newStatus}'.`
    );
  }

  // 4. If validation passes, update the document
  order.status = newStatus;
  const updatedOrder = await order.save();

  // 5. Notify clients via WebSocket
  getIO()
    .to(updatedOrder.restaurantId.toString())
    .emit("order:updated", updatedOrder);

  if (updatedOrder.customerId) {
    getIO()
      .to(updatedOrder.customerId.toString())
      .emit("order:notification", updatedOrder);
  }

  return updatedOrder;
};

const handleSuccessfulPayment = async (orderId: string): Promise<void> => {
  // This function remains the same.
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
