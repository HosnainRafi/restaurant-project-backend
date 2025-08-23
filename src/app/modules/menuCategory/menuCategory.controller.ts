import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { MenuCategoryService } from "./menuCategory.service";

const createMenuCategory = catchAsync(async (req, res) => {
  const restaurantId = "68a6a96187ed6561f8380f53"; // Placeholder
  const result = await MenuCategoryService.createCategoryIntoDB(
    req.body,
    restaurantId
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Menu category created successfully",
    data: result,
  });
});

const getAllMenuCategories = catchAsync(async (req, res) => {
  const restaurantId = "68a6a96187ed6561f8380f53"; // Placeholder
  const result = await MenuCategoryService.getAllCategoriesFromDB(restaurantId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Menu categories retrieved successfully",
    data: result,
  });
});
// Added for delete
const deleteMenuCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const restaurantId = "68a6a96187ed6561f8380f53"; // Placeholder

  const result = await MenuCategoryService.deleteCategoryFromDB(
    categoryId
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Menu category not found",
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Menu category deleted successfully",
    data: result,
  });
});


export const MenuCategoryController = {
  createMenuCategory,
  getAllMenuCategories,
  deleteMenuCategory
};
