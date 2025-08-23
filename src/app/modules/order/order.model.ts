import { Schema, model } from "mongoose";
import { IOrder, OrderModel } from "./order.interface";

const OrderItemSchema = new Schema(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder, OrderModel>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      address: { type: String },
      uid: { type: String },
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    tip: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: { type: String, enum: ["pickup", "delivery"], default: "pickup" },
    notes: { type: String },
    // --- NEW FIELDS ---
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
    paymentIntentId: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Order = model<IOrder, OrderModel>("Order", OrderSchema);
