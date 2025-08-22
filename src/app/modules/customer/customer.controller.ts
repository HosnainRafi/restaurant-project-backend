import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CustomerService } from "./customer.service";

const getMyOrders = catchAsync(async (req, res) => {
  const customerId = req.user.uid; // Get UID from the authenticated user
  const result = await CustomerService.getMyOrdersFromDB(customerId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders retrieved successfully!",
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const customerId = req.user.uid; // Get UID from the authenticated user
  const result = await CustomerService.getMyProfileFromDB(customerId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully!",
    data: result,
  });
});

const updateMe = catchAsync(async (req, res) => {
  const customerId = req.user.uid; // Get UID from the authenticated user
  const updatedData = req.body;
  const result = await CustomerService.updateMyProfileInDB(
    customerId,
    updatedData
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully!",
    data: result,
  });
});

export const CustomerController = {
  getMyOrders,
  getMe,
  updateMe,
};
