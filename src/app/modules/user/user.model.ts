import { Schema, model } from "mongoose";
import { IAddress, IUser, UserModel } from "./user.interface";

// --- ADDED: A sub-schema for addresses ---
const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, required: true },
    details: { type: String, required: true },
  },
  { _id: false } // Don't create a separate _id for each address
);

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
      enum: ["admin", "manager", "staff", "customer"],
      default: "customer",
    },
    // --- ADDED: Schema definitions for new fields ---
    name: {
      type: String,
      required: true,
    },
    photoURL: {
      type: String,
      default: "", // Default to an empty string
    },
    addresses: {
      type: [AddressSchema], // Use the address sub-schema here
      default: [],
    },
  },
  { timestamps: true }
);

export const User = model<IUser, UserModel>("User", UserSchema);
