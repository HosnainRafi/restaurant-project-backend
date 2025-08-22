import { Schema, model } from "mongoose";
import { IMenuCategory, MenuCategoryModel } from "./menuCategory.interface";

const MenuCategorySchema = new Schema<IMenuCategory, MenuCategoryModel>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
    imageUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

export const MenuCategory = model<IMenuCategory, MenuCategoryModel>(
  "MenuCategory",
  MenuCategorySchema
);
