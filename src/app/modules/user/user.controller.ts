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

export const UserController = {
  syncUser,
  getMe,
};
