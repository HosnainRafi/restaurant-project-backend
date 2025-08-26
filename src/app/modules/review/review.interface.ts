import { Model, Types } from "mongoose";
import { IUser } from "../user/user.interface";

export interface IReview {
  orderId: Types.ObjectId;
  userId: Types.ObjectId | IUser; // Firebase UID of the customer
  rating: number;
  comment: string;
  isFeatured?: boolean; // ADDED: To mark a review for the homepage
}

export interface ReviewModel extends Model<IReview> {}
