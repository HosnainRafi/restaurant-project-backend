import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserService } from "./user.service";

const syncUser = catchAsync(async (req, res) => {
  // The user's Firebase details are attached by the 'auth' middleware
  const { uid, email } = req.user;

  const result = await UserService.syncUser({ uid, email });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User synchronized successfully",
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const user = await UserService.getUserByUid(req.user.uid);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile retrieved successfully",
    data: user,
  });
});

const getMyOrders = catchAsync(async (req, res) => {
  const result = await UserService.getMyOrdersFromDB(req.user.uid);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders retrieved successfully!",
    data: result,
  });
});

// --- NEW CONTROLLER for reservations ---
const getMyReservations = catchAsync(async (req, res) => {
  const result = await UserService.getMyReservationsFromDB(req.user.uid);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reservations retrieved successfully!",
    data: result,
  });
});

const getMyOrderDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.getMyOrderDetailsFromDB(req.user.uid, id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order details retrieved successfully!",
    data: result,
  });
});

// --- NEW CONTROLLER for cancelling an order ---
const cancelMyOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.cancelMyOrderInDB(req.user.uid, id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order cancelled successfully!",
    data: result,
  });
});

export const UserController = {
  syncUser,
  getMe,
  getMyOrders,
  getMyReservations,
  getMyOrderDetails,
  cancelMyOrder,
};
