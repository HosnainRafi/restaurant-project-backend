import { Model, Types } from "mongoose";

export interface IBranch {
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

export interface IRestaurant {
  name: string;
  brand: {
    primaryColor: string;
    logoUrl: string;
    coverUrl: string;
  };
  branches: IBranch[];
  social: {
    facebook?: string;
    instagram?: string;
    yelpUrl?: string;
  };
  deliveryLinks: {
    doorDash?: string;
    uberEats?: string;
    grubHub?: string;
  };
  features: {
    halal: boolean;
    vegFriendly: boolean;
    parking: boolean;
    wifi: boolean;
  };
  about: string;
  seo: {
    title: string;
    description: string;
  };
}

export interface RestaurantModel extends Model<IRestaurant> {}
