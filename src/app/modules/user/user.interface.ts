import { Model, Types } from "mongoose"; // 1. Import Types

export type TUserRole = "admin" | "manager" | "staff" | "customer";

export interface IUser {
  // 2. Add all properties that a user document can have
  _id: Types.ObjectId;
  uid: string; // Firebase Unique ID
  email: string;
  role: TUserRole;
  name?: string;
  phone?: string;
  address?: string;
  photoURL?: string;
  restaurantId?: Types.ObjectId;
}

export interface UserModel extends Model<IUser> {
  // You can leave this as is, or define the static method's return type more specifically
  isUserExistingByEmail(email: string): Promise<IUser | null>;
}
