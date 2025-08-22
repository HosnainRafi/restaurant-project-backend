// src/app/modules/chef/chef.controller.ts
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ChefService } from "./chef.service";

const createChef = catchAsync(async (req, res) => {
  const restaurantId = "68a6a96187ed6561f8380f53"; // TODO: inject from auth/tenant
  const result = await ChefService.createChefIntoDB(req.body, restaurantId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Chef created successfully",
    data: result,
  });
});

const getChefs = catchAsync(async (req, res) => {
  const restaurantId = "68a6a96187ed6561f8380f53"; // TODO: inject from auth/tenant
  const result = await ChefService.getChefsFromDB(restaurantId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chefs retrieved successfully",
    data: result,
  });
});

const updateChef = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ChefService.updateChefInDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chef updated successfully",
    data: result,
  });
});

const deleteChef = catchAsync(async (req, res) => {
  const { id } = req.params;
  await ChefService.deleteChefFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chef deleted successfully",
    data: null,
  });
});

export const ChefController = {
  createChef,
  getChefs,
  updateChef,
  deleteChef,
};
