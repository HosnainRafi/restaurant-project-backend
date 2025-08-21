import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { RestaurantService } from "./restaurant.service";

const createRestaurant = catchAsync(async (req, res) => {
  const result = await RestaurantService.createRestaurantIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Restaurant profile created successfully",
    data: result,
  });
});

const getRestaurant = catchAsync(async (req, res) => {
  const result = await RestaurantService.getRestaurantFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Restaurant data retrieved successfully",
    data: result,
  });
});

const updateRestaurant = catchAsync(async (req, res) => {
  const result = await RestaurantService.updateRestaurantInDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Restaurant profile updated successfully",
    data: result,
  });
});

export const RestaurantController = {
  createRestaurant,
  getRestaurant, // Renamed for clarity
  updateRestaurant,
};
