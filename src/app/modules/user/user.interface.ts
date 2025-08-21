import { Model } from "mongoose";

export type TUserRole = "admin" | "staff";

export interface IUser {
  uid: string; // Firebase Unique ID
  email: string;
  role: TUserRole;
  // We no longer need password or needsPasswordChange
}

// For creating static methods on the model
export interface UserModel extends Model<IUser> {
  isUserExistingByEmail(email: string): Promise<boolean>;
}
