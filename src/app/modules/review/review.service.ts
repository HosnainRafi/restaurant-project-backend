import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError";
import { Order } from "../order/order.model";
import { IReview } from "./review.interface";
import { Review } from "./review.model";
import { User } from "../user/user.model";

// CREATE a new review
const createReviewInDB = async (
  payload: IReview,
  userId: string
): Promise<IReview> => {
  const order = await Order.findOne({
    _id: payload.orderId,
    "customer.uid": userId,
  });
  if (!order) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Order not found or you are not authorized to review it."
    );
  }
  if (order.status !== "completed") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can only review completed orders."
    );
  }
  const existingReview = await Review.findOne({ orderId: payload.orderId });
  if (existingReview) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This order has already been reviewed."
    );
  }
  const reviewData = { ...payload, userId };
  const newReview = await Review.create(reviewData);
  return newReview;
};

// READ all reviews (for an admin)
const getAllReviewsFromDB = async (): Promise<IReview[]> => {
  return Review.find({})
    .sort({ createdAt: -1 })
    .populate("orderId", "orderNumber");
};

// READ all reviews for a specific customer
const getMyReviewsFromDB = async (userId: string): Promise<IReview[]> => {
  return Review.find({ userId })
    .sort({ createdAt: -1 })
    .populate("orderId", "orderNumber");
};

// UPDATE a review
const updateReviewInDB = async (
  reviewId: string,
  userId: string,
  payload: Partial<IReview>
): Promise<IReview | null> => {
  const review = await Review.findOne({ _id: reviewId, userId });
  if (!review) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Review not found or you do not have permission to edit it."
    );
  }
  Object.assign(review, payload);
  await review.save();
  return review;
};

// DELETE a review
const deleteReviewFromDB = async (
  reviewId: string,
  userId: string
): Promise<void> => {
  const review = await Review.findOne({ _id: reviewId, userId });
  if (!review) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Review not found or you do not have permission to delete it."
    );
  }
  await review.deleteOne();
};

export const ReviewService = {
  createReviewInDB,
  getAllReviewsFromDB,
  getMyReviewsFromDB,
  updateReviewInDB,
  deleteReviewFromDB,
};
