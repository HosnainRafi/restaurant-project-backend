import { Model, Types } from "mongoose";

export type TMenuItemTag = "spicy" | "veg" | "vegan" | "gf" | "nut-free";

export interface IMenuItem {
  restaurantId: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  description: string;
  price: number; // Stored in cents (e.g., $15.99 is 1599)
  imageUrl?: string;
  tags: TMenuItemTag[];
  calories?: number;
  isAvailable: boolean;
  displayOrder: number;
}

export interface MenuItemModel extends Model<IMenuItem> {}
