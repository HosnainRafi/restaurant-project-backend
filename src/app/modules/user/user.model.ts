import { Schema, model } from "mongoose";
import { IUser } from "./user.interface";

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true }, // This is the new primary link
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: { type: String, enum: ["admin", "staff"], default: "staff" },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", UserSchema);
