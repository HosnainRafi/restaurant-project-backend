import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserService } from "./user.service";

const syncUser = catchAsync(async (req, res) => {
  const { uid, email } = req.user;
  const { name, address } = req.body;
  const result = await UserService.syncUser({ uid, email, name, address });
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

const updateMe = catchAsync(async (req, res) => {
  const result = await UserService.updateMyProfileInDB(req.user.uid, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully!",
    data: result,
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

// The changePassword controller function has been removed.

export const UserController = {
  syncUser,
  getMe,
  updateMe,
  getMyOrders,
  getMyReservations,
  getMyOrderDetails,
  cancelMyOrder,
};
