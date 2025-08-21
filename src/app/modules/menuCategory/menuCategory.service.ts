import { IMenuCategory } from "./menuCategory.interface";
import { MenuCategory } from "./menuCategory.model";

// In a real app, restaurantId would be passed dynamically
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

export const MenuCategoryService = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
};
