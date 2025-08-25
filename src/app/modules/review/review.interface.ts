import { Model, Types } from "mongoose";

export interface IReview {
  orderId: Types.ObjectId;
  userId: string; // Firebase UID of the customer
  rating: number;
  comment: string;
}

export interface ReviewModel extends Model<IReview> {}
