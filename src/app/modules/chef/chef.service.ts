// src/app/modules/chef/chef.service.ts
import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError";
import { IChef } from "./chef.interface";
import { Chef } from "./chef.model";

const createChefIntoDB = async (
  payload: Omit<IChef, "restaurantId">,
  restaurantId: string
): Promise<IChef> => {
  const data = { ...payload, restaurantId };
  const result = await Chef.create(data);
  return result;
};

const getChefsFromDB = async (restaurantId: string): Promise<IChef[]> => {
  const result = await Chef.find({ restaurantId }).sort({
    displayOrder: 1,
    createdAt: -1,
  });
  return result;
};

const updateChefInDB = async (
  id: string,
  payload: Partial<IChef>
): Promise<IChef> => {
  const result = await Chef.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chef not found with this ID");
  }
  return result;
};

const deleteChefFromDB = async (id: string): Promise<IChef> => {
  const result = await Chef.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chef not found with this ID");
  }
  return result;
};

export const ChefService = {
  createChefIntoDB,
  getChefsFromDB,
  updateChefInDB,
  deleteChefFromDB,
};
