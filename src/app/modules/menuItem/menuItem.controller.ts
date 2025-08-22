// src/app/modules/menuItem/menuItem.controller.ts
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { MenuItemService } from "./menuItem.service";
import ApiError from "../../../utils/ApiError";

const normalizeBool = (v: any) =>
  v === true || v === "true" || v === 1 || v === "1";

const createMenuItem = catchAsync(async (req, res) => {
  const restaurantId = "68a6a96187ed6561f8380f53"; // TODO: inject from auth/tenant

  // Optional defensive normalization, safe to remove if always boolean on client
  const payload = {
    ...req.body,
    isAvailable: normalizeBool(req.body?.isAvailable),
    isFeatured: normalizeBool(req.body?.isFeatured),
    isChefsRecommendation: normalizeBool(req.body?.isChefsRecommendation),
    isTodaysSpecial: normalizeBool(req.body?.isTodaysSpecial),
  };

  const result = await MenuItemService.createMenuItemIntoDB(
    payload as any,
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
  const restaurantId = "68a6a96187ed6561f8380f53"; // TODO: inject from auth/tenant
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

  const payload = {
    ...req.body,
    isAvailable:
      req.body?.isAvailable === undefined
        ? undefined
        : normalizeBool(req.body?.isAvailable),
    isFeatured:
      req.body?.isFeatured === undefined
        ? undefined
        : normalizeBool(req.body?.isFeatured),
    isChefsRecommendation:
      req.body?.isChefsRecommendation === undefined
        ? undefined
        : normalizeBool(req.body?.isChefsRecommendation),
    isTodaysSpecial:
      req.body?.isTodaysSpecial === undefined
        ? undefined
        : normalizeBool(req.body?.isTodaysSpecial),
  };

  const result = await MenuItemService.updateMenuItemInDB(id, payload as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Menu item updated successfully",
    data: result,
  });
});

const deleteMenuItem = catchAsync(async (req, res) => {
  const { id } = req.params;
  await MenuItemService.deleteMenuItemFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Menu item deleted successfully",
    data: null,
  });
});

// GET /menu-items/special?flag=isFeatured | isChefsRecommendation | isTodaysSpecial
const getSpecialMenuItems = catchAsync(async (req, res) => {
  const restaurantId = "68a6a96187ed6561f8380f53"; // TODO: inject from auth/tenant
  const { flag } = req.query;

  const allowed = ["isFeatured", "isChefsRecommendation", "isTodaysSpecial"];
  if (!flag || !allowed.includes(String(flag))) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "flag must be one of isFeatured, isChefsRecommendation, isTodaysSpecial"
    );
  }

  const result = await MenuItemService.getSpecialMenuItemsFromDB(
    restaurantId,
    flag as any
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${flag} items retrieved successfully`,
    data: result,
  });
});

export const MenuItemController = {
  createMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
  getSpecialMenuItems,
};
