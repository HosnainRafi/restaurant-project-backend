import { Schema, model } from "mongoose";
import { IReview, ReviewModel } from "./review.interface";

const ReviewSchema = new Schema<IReview, ReviewModel>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // A user can only review an order once
    },
    userId: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

export const Review = model<IReview, ReviewModel>("Review", ReviewSchema);
