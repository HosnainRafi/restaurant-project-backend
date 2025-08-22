import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { OrderService } from "./order.service";
import { Restaurant } from "../restaurant/restaurant.model";
import ApiError from "../../../utils/ApiError";

const createOrder = catchAsync(async (req, res) => {
  // Find the single restaurant document
  const restaurant = await Restaurant.findOne();
  if (!restaurant) {
    throw new ApiError(httpStatus.NOT_FOUND, "Restaurant profile not found.");
  }

  const result = await OrderService.createOrderIntoDB(
    req.body,
    restaurant._id.toString()
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order placed successfully!",
    data: result,
  });
});

// ✅ New controller to get all orders
const getAllOrders = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findOne();
  if (!restaurant) {
    throw new ApiError(httpStatus.NOT_FOUND, "Restaurant profile not found.");
  }

  const result = await OrderService.getOrdersFromDB(
    restaurant._id.toString(),
    req.query
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders retrieved successfully",
    data: result,
  });
});

// ✅ New controller to update an order's status
const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await OrderService.updateOrderStatusInDB(id, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getAllOrders,
  updateOrderStatus,
};
