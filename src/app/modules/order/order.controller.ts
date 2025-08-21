import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { OrderService } from "./order.service";

const createOrder = catchAsync(async (req, res) => {
  // ✅ Use the correct, dynamic restaurant ID
  const restaurantId = "68a6a96187ed6561f8380f53";
  const result = await OrderService.createOrderIntoDB(req.body, restaurantId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order placed successfully!",
    data: result,
  });
});

// ✅ New controller to get all orders
const getAllOrders = catchAsync(async (req, res) => {
  const restaurantId = "68a6a96187ed6561f8380f53"; // Use your correct restaurant ID
  const result = await OrderService.getOrdersFromDB(restaurantId);
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
