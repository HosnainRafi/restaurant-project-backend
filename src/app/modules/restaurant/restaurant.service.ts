import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError";
import { IRestaurant } from "./restaurant.interface";
import { Restaurant } from "./restaurant.model";

// Creates the restaurant profile, but only if one doesn't already exist.
const createRestaurantIntoDB = async (
  payload: IRestaurant
): Promise<IRestaurant> => {
  const count = await Restaurant.countDocuments();
  if (count > 0) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "A restaurant profile already exists. Use the update route instead."
    );
  }
  const result = await Restaurant.create(payload);
  return result;
};

// Gets the first (and only) restaurant document from the database.
const getRestaurantFromDB = async (): Promise<IRestaurant | null> => {
  const result = await Restaurant.findOne();
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Restaurant profile has not been created yet."
    );
  }
  return result;
};

// Finds the single restaurant profile and updates it.
const updateRestaurantInDB = async (
  payload: Partial<IRestaurant>
): Promise<IRestaurant | null> => {
  const restaurant = await Restaurant.findOne();
  if (!restaurant) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Restaurant profile not found. Cannot update."
    );
  }

  const result = await Restaurant.findByIdAndUpdate(restaurant._id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

export const RestaurantService = {
  createRestaurantIntoDB,
  getRestaurantFromDB, // Renamed for clarity
  updateRestaurantInDB,
};
