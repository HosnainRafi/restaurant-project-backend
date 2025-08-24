import { Schema, model } from "mongoose";
import { IUser, UserModel } from "./user.interface";

const UserSchema = new Schema<IUser, UserModel>(
  {
    uid: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      // --- Add 'manager' to the enum ---
      enum: ["admin", "manager", "staff", "customer"],
      default: "customer",
    },
  },
  { timestamps: true }
);

export const User = model<IUser, UserModel>("User", UserSchema);
