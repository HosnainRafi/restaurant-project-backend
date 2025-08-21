import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError";
import { IMenuItem } from "./menuItem.interface";
import { MenuItem } from "./menuItem.model";

const createMenuItemIntoDB = async (
  payload: Omit<IMenuItem, "restaurantId">,
  restaurantId: string
): Promise<IMenuItem> => {
  const itemData = { ...payload, restaurantId };
  const result = await MenuItem.create(itemData);
  return result;
};

const getMenuItemsFromDB = async (
  restaurantId: string
): Promise<IMenuItem[]> => {
  const result = await MenuItem.find({ restaurantId })
    .populate("categoryId")
    .sort({ displayOrder: 1 });
  return result;
};

const updateMenuItemInDB = async (
  id: string,
  payload: Partial<IMenuItem>
): Promise<IMenuItem | null> => {
  const result = await MenuItem.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Menu item not found with this ID"
    );
  }
  return result;
};

// ✅ New function to delete a menu item
const deleteMenuItemFromDB = async (id: string): Promise<IMenuItem | null> => {
  const result = await MenuItem.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Menu item not found with this ID"
    );
  }
  return result;
};

export const MenuItemService = {
  createMenuItemIntoDB,
  getMenuItemsFromDB,
  updateMenuItemInDB,
  deleteMenuItemFromDB, // ✅ Export the new function
};
