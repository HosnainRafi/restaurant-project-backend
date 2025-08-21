import { Schema, model } from "mongoose";
import { IRestaurant, RestaurantModel } from "./restaurant.interface";

const BranchSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const RestaurantSchema = new Schema<IRestaurant, RestaurantModel>(
  {
    name: { type: String, required: true },
    brand: {
      primaryColor: { type: String },
      logoUrl: { type: String, required: true },
      coverUrl: { type: String, required: true },
    },
    branches: [BranchSchema],
    social: {
      facebook: String,
      instagram: String,
      yelpUrl: String,
    },
    deliveryLinks: {
      doorDash: String,
      uberEats: String,
      grubHub: String,
    },
    features: {
      halal: { type: Boolean, default: false },
      vegFriendly: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
    },
    about: { type: String, required: true },
    seo: {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export const Restaurant = model<IRestaurant, RestaurantModel>(
  "Restaurant",
  RestaurantSchema
);
