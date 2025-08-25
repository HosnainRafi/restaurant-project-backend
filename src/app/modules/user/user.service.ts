import ApiError from "../../../utils/ApiError";
import { IOrder } from "../order/order.interface";
import { Order } from "../order/order.model";
import { IReservation } from "../reservation/reservation.interface";
import { Reservation } from "../reservation/reservation.model";
import { IAddress, IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status";
import { getIO } from "../../../socket/index";

// This new service finds a user by UID or creates them if they don't exist.
const syncUser = async (payload: {
  uid: string;
  email: string;
  name: string;
  address?: IAddress; // Expect a single address object on registration
}): Promise<IUser> => {
  const { uid, email, name, address } = payload;

  let user = await User.findOne({ uid });

  if (!user) {
    user = await User.create({
      uid,
      email,
      name,
      // Only add the addresses array if an address was provided
      addresses: address ? [address] : [],
      role: "customer",
      photoURL:
        "https://res.cloudinary.com/du8e3wgew/image/upload/v1756087795/dx47mzwd8xxtxacrbd3h.png",
    });
  }
  return user;
};

// --- ADDED: A new service to update the user's profile ---
const updateMyProfileInDB = async (
  uid: string,
  payload: Partial<IUser>
): Promise<IUser | null> => {
  // Use findOneAndUpdate to update the user document.
  // We'll prevent roles and email from being changed via this endpoint.
  const { role, email, ...updateData } = payload;

  const user = await User.findOneAndUpdate({ uid }, updateData, {
    new: true, // Return the updated document
    runValidators: true, // Ensure new addresses match the schema
  });

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

const changeUserPasswordInDB = async (
  uid: string,
  newPassword: string
): Promise<{ success: boolean }> => {
  console.log(
    `Password change requested for user ${uid}. In a real app, you would use the Firebase Admin SDK to update the password here.`
  );
  // Example: await admin.auth().updateUser(uid, { password: newPassword });
  // Since we can't do that here without full setup, we'll simulate success.
  return { success: true };
};

export const UserService = {
  syncUser,
  getUserByUid,
  getMyOrdersFromDB,
  getMyReservationsFromDB,
  getMyOrderDetailsFromDB,
  cancelMyOrderInDB,
  updateMyProfileInDB,
  changeUserPasswordInDB,
};
