import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserService } from "./user.service";
import ApiError from "../../../utils/ApiError";

const syncUser = catchAsync(async (req, res) => {
  const { uid, email } = req.user as {
    uid: string;
    email: string;
    name?: string;
    picture?: string;
  };
  const { name, address } = req.body;
  const result = await UserService.syncUser({ uid, email, name, address });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User synchronized successfully",
    data: result,
  });
});
// const getMe = catchAsync(async (req, res) => {
//   const user = await UserService.getUserByUid(req.user.uid);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "User profile retrieved successfully",
//     data: user,
//   });
// });

// user.controller.ts
const getMe = catchAsync(async (req, res) => {
  const {
    uid,
    email: maybeEmail,
    name,
  } = req.user as {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
  };

  // Assert email is defined
  if (!maybeEmail) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Email missing in token payload"
    );
  }

  const dbUser = await UserService.getOrCreateUser({
    uid,
    email: maybeEmail, // now strictly string
    name,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile retrieved successfully",
    data: dbUser,
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


// --- NEW: Controller to get all users ---
const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserService.getAllUsersFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully!',
    data: result,
  });
});

//  Controller to update user status ---
const updateUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await UserService.updateUserStatusInDB(id, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User status updated successfully!',
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
   getAllUsers,
  updateUserStatus,
};
