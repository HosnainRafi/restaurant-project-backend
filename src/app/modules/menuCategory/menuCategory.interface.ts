import { Model, Types } from "mongoose";

export interface IMenuCategory {
  restaurantId: Types.ObjectId;
  name: string;
  description?: string;
  displayOrder: number;
  imageUrl?: string;
}

export interface MenuCategoryModel extends Model<IMenuCategory> {}
