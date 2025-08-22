// src/app/modules/menuItem/menuItem.interface.ts
import { Model, Types } from "mongoose";

export type TMenuItemTag = "spicy" | "veg" | "vegan" | "gf" | "nut-free";

export interface IMenuItem {
  restaurantId: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  description: string;
  price: number; // in cents if your UI uses cents
  imageUrl?: string;
  tags: TMenuItemTag[];
  calories?: number;
  isAvailable: boolean;
  displayOrder: number;

  // Using boolean flags instead of single specialCategory string
  isFeatured?: boolean;
  isChefsRecommendation?: boolean;
  isTodaysSpecial?: boolean;
}

// You can extend Model<IMenuItem> if you need statics
export interface MenuItemModel extends Model<IMenuItem> {}
