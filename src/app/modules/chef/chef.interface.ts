// src/app/modules/chef/chef.interface.ts
import { Model, Types } from "mongoose";

export interface IChef {
  restaurantId: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  description?: string;
  imageUrl?: string; // URL from imgbb
  isActive: boolean; // default true
  displayOrder: number; // for sorting
}

export interface ChefModel extends Model<IChef> {}
