import { IOrder } from "../order/order.interface";
import { Order } from "../order/order.model";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";

const getMyOrdersFromDB = async (customerId: string): Promise<IOrder[]> => {
  // Find orders where the customerId field matches the logged-in user's UID
  const result = await Order.find({ "customer.uid": customerId }).sort({
    createdAt: -1,
  });
  return result;
};

const getMyProfileFromDB = async (
  customerId: string
): Promise<IUser | null> => {
  const result = await User.findOne({ uid: customerId }).select("-password"); // Exclude password
  return result;
};

const updateMyProfileInDB = async (
  customerId: string,
  payload: Partial<IUser>
): Promise<IUser | null> => {
  // Ensure sensitive fields like 'role' or 'uid' cannot be changed by the user
  const { role, uid, ...updateData } = payload;

  const result = await User.findOneAndUpdate({ uid: customerId }, updateData, {
    new: true, // Return the updated document
  });
  return result;
};

export const CustomerService = {
  getMyOrdersFromDB,
  getMyProfileFromDB,
  updateMyProfileInDB,
};
