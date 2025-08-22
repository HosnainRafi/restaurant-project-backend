// src/app/modules/chef/chef.model.ts
import { Schema, model } from "mongoose";
import { IChef, ChefModel } from "./chef.interface";

const ChefSchema = new Schema<IChef>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    specialty: { type: String, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Chef = model<IChef, ChefModel>("Chef", ChefSchema);
