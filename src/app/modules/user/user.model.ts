import { Schema, model } from "mongoose";
import { IUser, UserModel } from "./user.interface";

const UserSchema = new Schema<IUser>(
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
      enum: ["admin", "staff", "customer"], // Add 'customer'
      default: "customer", // Default new sign-ups to 'customer'
    },
  },
  { timestamps: true }
);

export const User = model<IUser, UserModel>("User", UserSchema);
