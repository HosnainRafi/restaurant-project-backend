import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ReservationService } from "./reservation.service";

const createReservation = catchAsync(async (req, res) => {
  // In a real app, restaurantId would come from req.params or a similar source
  const restaurantId = "60d0fe4f5311236168a109ca"; // Placeholder
  const reservationData = { ...req.body, restaurantId };

  const result =
    await ReservationService.createReservationIntoDB(reservationData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Reservation request sent successfully!",
    data: result,
  });
});

const getAllReservations = catchAsync(async (req, res) => {
  const result = await ReservationService.getAllReservationsFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reservations retrieved successfully",
    data: result,
  });
});

const updateReservationStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await ReservationService.updateReservationStatusInDB(
    id,
    status
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reservation status updated successfully",
    data: result,
  });
});

export const ReservationController = {
  createReservation,
  getAllReservations,
  updateReservationStatus,
};
