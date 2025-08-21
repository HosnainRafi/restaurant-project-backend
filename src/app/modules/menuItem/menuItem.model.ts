import { Schema, model } from "mongoose";
import { IMenuItem, MenuItemModel } from "./menuItem.interface";

const MenuItemSchema = new Schema<IMenuItem, MenuItemModel>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    tags: [{ type: String, enum: ["spicy", "veg", "vegan", "gf", "nut-free"] }],
    calories: { type: Number },
    isAvailable: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const MenuItem = model<IMenuItem, MenuItemModel>(
  "MenuItem",
  MenuItemSchema
);
