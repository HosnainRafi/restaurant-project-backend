import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError";
import { MenuItem } from "../menuItem/menuItem.model";
import { IOrder, IOrderItem } from "./order.interface";
import { Order } from "./order.model";
import mongoose from "mongoose";
import { getIO } from "../../../socket";

const TAX_RATE = 0.08; // 8% sales tax

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
const getOrdersFromDB = async (restaurantId: string): Promise<IOrder[]> => {
  const result = await Order.find({ restaurantId }).sort({ createdAt: -1 });
  return result;
};

// ✅ New function to update an order's status
const updateOrderStatusInDB = async (
  orderId: string,
  status: IOrder["status"]
): Promise<IOrder> => {
  const result = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  // 1. Notify the admin dashboard (already done)
  getIO().to(result.restaurantId.toString()).emit("order:updated", result);

  // 2. NEW: Notify the specific customer
  if (result.customerId) {
    // We use the customer's MongoDB _id as their unique room name
    getIO().to(result.customerId.toString()).emit("order:notification", result);
  }

  return result;
};

export const OrderService = {
  createOrderIntoDB,
  getOrdersFromDB,
  updateOrderStatusInDB,
};
