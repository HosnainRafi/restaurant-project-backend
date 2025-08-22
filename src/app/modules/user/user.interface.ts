import { Model } from "mongoose";

export type TUserRole = "admin" | "staff" | "customer"; // Add 'customer'

export interface IUser {
  uid: string; // Firebase Unique ID
  email: string;
  role: TUserRole;
}

export interface UserModel extends Model<IUser> {
  isUserExistingByEmail(email: string): Promise<IUser | null>;
}
