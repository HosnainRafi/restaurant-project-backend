import { Schema, model } from "mongoose";
import { IReview, ReviewModel } from "./review.interface";

const ReviewSchema = new Schema<IReview, ReviewModel>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    // This field will store the Firebase UID string
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
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Ensure virtuals are included when converting to JSON
    toObject: { virtuals: true },
  }
);

// --- START: THE FIX ---
// Create a virtual property to define the relationship for population.
ReviewSchema.virtual("user", {
  ref: "User", // The model to use for population
  localField: "userId", // Find in Review where localField
  foreignField: "uid", // is equal to foreignField in User
  justOne: true, // We only expect one user per review
});
// --- END: THE FIX ---

export const Review = model<IReview>("Review", ReviewSchema);
