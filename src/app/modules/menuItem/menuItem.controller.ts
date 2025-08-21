import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { MenuItemService } from "./menuItem.service";

const createMenuItem = catchAsync(async (req, res) => {
  const restaurantId = "68a6a96187ed6561f8380f53"; // Placeholder
  const result = await MenuItemService.createMenuItemIntoDB(
    req.body,
    restaurantId
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Menu item created successfully",
    data: result,
  });
});

const getMenuItems = catchAsync(async (req, res) => {
  const restaurantId = "68a6a96187ed6561f8380f53"; // Placeholder
  const result = await MenuItemService.getMenuItemsFromDB(restaurantId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Menu items retrieved successfully",
    data: result,
  });
});

const updateMenuItem = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await MenuItemService.updateMenuItemInDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Menu item updated successfully",
    data: result,
  });
});

// ✅ New controller to handle deletion
const deleteMenuItem = catchAsync(async (req, res) => {
  const { id } = req.params;
  await MenuItemService.deleteMenuItemFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Menu item deleted successfully",
    data: null, // No data to send back on successful deletion
  });
});

export const MenuItemController = {
  createMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem, // ✅ Export the new controller
};
