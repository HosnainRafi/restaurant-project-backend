import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError";
import { IReservation } from "./reservation.interface";
import { Reservation } from "./reservation.model";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import mongoose from "mongoose";

const createReservationIntoDB = async (
  // Fix the Omit type to specify which keys to exclude
  payload: Omit<IReservation, "restaurantId" | "status" | "source">,
  restaurantId: string,
  user: DecodedIdToken | null
): Promise<IReservation> => {
  const customerData = {
    ...payload.customer,
    uid: user?.uid,
  };

  const reservationData = {
    ...payload,
    customer: customerData,
    // --- THIS IS THE FIX: Convert the string to a Mongoose ObjectId ---
    restaurantId: new mongoose.Types.ObjectId(restaurantId),
    status: "pending",
    source: "web",
  } as IReservation;

  const result = await Reservation.create(reservationData);
  return result;
};

const getAllReservationsFromDB = async (): Promise<IReservation[]> => {
  const result = await Reservation.find().sort({ createdAt: -1 });
  return result;
};

const updateReservationStatusInDB = async (
  id: string,
  status: IReservation["status"]
): Promise<IReservation> => {
  const result = await Reservation.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Reservation not found with this ID"
    );
  }
  return result;
};

export const ReservationService = {
  createReservationIntoDB,
  getAllReservationsFromDB,
  updateReservationStatusInDB,
};
