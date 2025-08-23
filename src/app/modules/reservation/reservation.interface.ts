import { Model, Types } from "mongoose";

export type TReservationStatus =
  | "pending"
  | "approved"
  | "declined"
  | "cancelled";

export interface IReservation {
  restaurantId: Types.ObjectId;
  // --- UPDATED: Add a nested customer object for consistency ---
  customer: {
    name: string;
    phone: string;
    email?: string;
    uid?: string; // This will link to the registered user
  };
  partySize: number;
  date: string;
  time: string;
  note?: string;
  status: TReservationStatus;
  source: "web" | "admin";
}

export interface ReservationModel extends Model<IReservation> {}
