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
      enum: ["admin", "manager", "staff", "customer"],
      default: "customer",
    },
    // --- ADDED: Optional fields for user profile ---
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    photoURL: { type: String },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant" },
  },
  { timestamps: true }
);

// Your existing static method can remain here if you use it
UserSchema.statics.isUserExistingByEmail = async function (email: string) {
  return await this.findOne({ email });
};

export const User = model<IUser, UserModel>("User", UserSchema);
