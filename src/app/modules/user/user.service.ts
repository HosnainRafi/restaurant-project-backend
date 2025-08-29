import httpStatus from "http-status";
import { getIO } from "../../../socket/index";
import ApiError from "../../../utils/ApiError";
import { IOrder } from "../order/order.interface";
import { Order } from "../order/order.model";
import { IReservation } from "../reservation/reservation.interface";
import { Reservation } from "../reservation/reservation.model";
import { IAddress, IUser, TUserStatus } from "./user.interface";
import { User } from "./user.model";

const syncUser = async (payload: {
  uid: string;
  email: string;
  name: string;
  address?: IAddress;
}): Promise<IUser> => {
  const { uid, email, name, address } = payload;
  console.log("Sync payload:", payload);
  // Look up by uid OR email
  let user = await User.findOne({ $or: [{ uid }, { email }] });

  if (!user) {
    // If not found, create new
    user = await User.create({
      uid,
      email,
      name,
      addresses: address ? [address] : [],
      role: "customer",
      photoURL:
        "https://res.cloudinary.com/du8e3wgew/image/upload/v1756087795/dx47mzwd8xxtxacrbd3h.png",
    });
  } else {
    // If found by email but missing uid, sync it
    if (!user.uid) {
      user.uid = uid;
      await user.save();
    }
  }

  return user;
};

const updateMyProfileInDB = async (
  uid: string,
  payload: Partial<IUser>
): Promise<IUser | null> => {
  const { role, email, ...updateData } = payload;
  const user = await User.findOneAndUpdate({ uid }, updateData, {
    new: true,
    runValidators: true,
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
): Promise<IOrder | null> => {
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
  getIO().to(order.restaurantId.toString()).emit("order:updated", order);
  return order;
};

const getOrCreateUser = async (payload: {
  uid: string;
  email: string;
  name?: string;
}): Promise<IUser> => {
  const { uid, email, name } = payload;

  // Look up by uid OR email (same logic as syncUser)
  let user = await User.findOne({ $or: [{ uid }, { email }] });

  if (!user) {
    // Create new user if not found
    user = await User.create({
      uid,
      email,
      name: name || email.split("@")[0],
      role: "customer",
      photoURL:
        "https://res.cloudinary.com/du8e3wgew/image/upload/v1756087795/dx47mzwd8xxtxacrbd3h.png",
      addresses: [],
    });
  } else if (!user.uid) {
    // If found by email but missing uid, sync it
    user.uid = uid;
    await user.save();
  }

  return user;
};
// --- NEW: Function for admins to get all users ---
const getAllUsersFromDB = async (): Promise<IUser[]> => {
  const result = await User.find({}).sort({ createdAt: -1 });
  return result;
};

//Function for admins to update a user's status like block and active
const updateUserStatusInDB = async (
  userId: string,
  status: TUserStatus,
): Promise<IUser | null> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
  }
  // if (user.role === 'admin') {
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     'Admins cannot be blocked. This action is not permitted.',
  //   );
  // }

  user.status = status;
  await user.save();

  return user;
};

// The changeUserPasswordInDB function has been removed.

export const UserService = {
  syncUser,
  getUserByUid,
  getMyOrdersFromDB,
  getMyReservationsFromDB,
  getMyOrderDetailsFromDB,
  cancelMyOrderInDB,
  updateMyProfileInDB,
  getOrCreateUser,
  getAllUsersFromDB,
  updateUserStatusInDB,
};
