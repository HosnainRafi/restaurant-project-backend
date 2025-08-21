import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError";
import { IReservation } from "./reservation.interface";
import { Reservation } from "./reservation.model";

const createReservationIntoDB = async (
  payload: Omit<IReservation, "status" | "source">
): Promise<IReservation> => {
  // Add any business logic here, e.g., checking for available slots
  // For now, we'll directly create the reservation.

  const result = await Reservation.create(payload);
  return result;
};

const getAllReservationsFromDB = async (): Promise<IReservation[]> => {
  const result = await Reservation.find().sort({ createdAt: -1 });
  return result;
};

const updateReservationStatusInDB = async (
  id: string,
  status: IReservation["status"]
): Promise<IReservation | null> => {
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
