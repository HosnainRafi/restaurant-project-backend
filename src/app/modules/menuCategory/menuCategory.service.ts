// src/app/modules/menuCategory/menuCategory.service.ts
import { IMenuCategory } from "./menuCategory.interface";
import { MenuCategory } from "./menuCategory.model";

const createCategoryIntoDB = async (
  payload: Omit<IMenuCategory, "restaurantId">,
  restaurantId: string
): Promise<IMenuCategory> => {
  const categoryData = { ...payload, restaurantId };
  const result = await MenuCategory.create(categoryData);
  return result;
};

const getAllCategoriesFromDB = async (
  restaurantId: string
): Promise<IMenuCategory[]> => {
  const result = await MenuCategory.find({ restaurantId }).sort({
    displayOrder: 1,
  });
  return result;
};
// For delete
const deleteCategoryFromDB = async (categoryId: string) => {
  return await MenuCategory.findByIdAndDelete(categoryId);
};



export const MenuCategoryService = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  deleteCategoryFromDB
};
