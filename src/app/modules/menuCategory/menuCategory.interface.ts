import { Model, Types } from "mongoose";

export interface IMenuCategory {
  restaurantId: Types.ObjectId;
  name: string;
  description?: string;
  displayOrder: number;
}

export interface MenuCategoryModel extends Model<IMenuCategory> {}
