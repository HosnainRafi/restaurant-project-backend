import { Model, Types } from "mongoose";

export type TReservationStatus =
  | "pending"
  | "approved"
  | "declined"
  | "cancelled";

export interface IReservation {
  restaurantId: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  partySize: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24-hour format)
  note?: string;
  status: TReservationStatus;
  source: "web" | "admin";
}

// Interface for static methods if needed in the future
export interface ReservationModel extends Model<IReservation> {}
