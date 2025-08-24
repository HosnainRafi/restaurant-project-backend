import ApiError from "../../../utils/ApiError";
import { IOrder } from "../order/order.interface";
import { Order } from "../order/order.model";
import { IReservation } from "../reservation/reservation.interface";
import { Reservation } from "../reservation/reservation.model";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status";
import { getIO } from "../../../socket/index";

// This new service finds a user by UID or creates them if they don't exist.
const syncUser = async (payload: {
  uid: string;
  email: string;
}): Promise<IUser> => {
  const { uid, email } = payload;
  let user = await User.findOne({ uid });

  if (!user) {
    user = await User.create({
      uid,
      email,
      role: "customer", // Changed default role to 'customer'
    });
  }

  return user;
};

const getUserByUid = async (uid: string): Promise<IUser | null> => {
  const user = await User.findOne({ uid });
  return user;
};

const getMyOrdersFromDB = async (uid: string): Promise<IOrder[]> => {
  const result = await Order.find({ "customer.uid": uid }).sort({
    createdAt: -1,
  });
  return result;
};

// --- NEW FUNCTION for reservations ---
const getMyReservationsFromDB = async (
  uid: string
): Promise<IReservation[]> => {
  const result = await Reservation.find({ "customer.uid": uid }).sort({
    date: -1,
  });
  return result;
};

const getMyOrderDetailsFromDB = async (
  uid: string,
  orderId: string
): Promise<IOrder> => {
  const order = await Order.findOne({ _id: orderId, "customer.uid": uid });
  if (!order) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Order not found or you do not have permission to view it."
    );
  }
  return order;
};

const cancelMyOrderInDB = async (
  uid: string,
  orderId: string
): Promise<IOrder> => {
  const order = await Order.findOne({ _id: orderId, "customer.uid": uid });

  if (!order) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Order not found or you do not have permission to modify it."
    );
  }

  if (order.paymentStatus === "paid") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Paid orders cannot be cancelled via the API. Please contact support."
    );
  }

  if (order.status !== "pending" && order.status !== "confirmed") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `This order cannot be cancelled as it is already ${order.status}.`
    );
  }

  order.status = "cancelled";
  await order.save();

  // Notify the admin dashboard
  getIO().to(order.restaurantId.toString()).emit("order:updated", order);

  return order;
};

export const UserService = {
  syncUser,
  getUserByUid,
  getMyOrdersFromDB,
  getMyReservationsFromDB,
  getMyOrderDetailsFromDB,
  cancelMyOrderInDB,
};
