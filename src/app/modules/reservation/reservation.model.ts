import { Schema, model } from "mongoose";
import { IReservation } from "./reservation.interface";

const ReservationSchema = new Schema<IReservation>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    // --- UPDATED: Add the customer object to the schema ---
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
      uid: { type: String }, // This will store the Firebase UID
    },
    partySize: { type: Number, required: true, min: 1, max: 20 },
    date: { type: String, required: true },
    time: { type: String, required: true },
    note: { type: String, trim: true, maxlength: 250 },
    status: {
      type: String,
      enum: ["pending", "approved", "declined", "cancelled"],
      default: "pending",
    },
    source: { type: String, enum: ["web", "admin"], default: "web" },
  },
  { timestamps: true }
);

export const Reservation = model<IReservation>(
  "Reservation",
  ReservationSchema
);
