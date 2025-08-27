import httpStatus from "http-status";
import ApiError from "../../../utils/ApiError";
import { IReview } from "./review.interface";
import { Review } from "./review.model";
import { Order } from "../order/order.model";

const createReviewInDB = async (
  payload: IReview,
  userId: string
): Promise<IReview> => {
  const order = await Order.findOne({
    _id: payload.orderId,
    "customer.uid": userId,
  });

  if (!order)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Order not found or you are not authorized to review it."
    );

  // UPDATED: Only allow reviews for completed orders
  if (order.status !== "completed")
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can only review completed/delivered orders."
    );

  const existingReview = await Review.findOne({ orderId: payload.orderId });
  if (existingReview)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This order has already been reviewed."
    );

  const reviewData = { ...payload, userId };
  const newReview = await Review.create(reviewData);

  // ADDED: Update the order to reference this review
  await Order.findByIdAndUpdate(payload.orderId, {
    reviewId: newReview._id,
  });

  return newReview;
};

const getMyReviewsFromDB = async (userId: string): Promise<IReview[]> => {
  return Review.find({ userId })
    .sort({ createdAt: -1 })
    .populate("orderId", "orderNumber")
    .populate("user");
};

const getFeaturedReviewsFromDB = async (): Promise<IReview[]> => {
  return Review.find({ isFeatured: true, rating: { $gte: 4 } })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("user");
};

const getAllReviewsForAdmin = async (): Promise<IReview[]> => {
  return Review.find({})
    .sort({ createdAt: -1 })
    .populate("orderId", "orderNumber")
    .populate("user");
};

const updateMyReviewInDB = async (
  reviewId: string,
  userId: string,
  payload: Partial<Pick<IReview, "rating" | "comment">>
): Promise<IReview | null> => {
  const review = await Review.findOneAndUpdate(
    { _id: reviewId, userId },
    payload,
    { new: true }
  );

  if (!review)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Review not found or you do not have permission to edit it."
    );
  return review;
};

const updateReviewByAdmin = async (
  reviewId: string,
  payload: Partial<IReview>
): Promise<IReview | null> => {
  const review = await Review.findByIdAndUpdate(reviewId, payload, {
    new: true,
  });
  if (!review) throw new ApiError(httpStatus.NOT_FOUND, "Review not found.");
  return review;
};

const deleteReviewByAdmin = async (reviewId: string): Promise<void> => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found.");
  }

  // ADDED: Remove review reference from order
  await Order.findOneAndUpdate(
    { reviewId: reviewId },
    { $unset: { reviewId: 1 } }
  );

  await Review.deleteOne({ _id: reviewId });
};

export const ReviewService = {
  createReviewInDB,
  getMyReviewsFromDB,
  getFeaturedReviewsFromDB,
  getAllReviewsForAdmin,
  updateMyReviewInDB,
  updateReviewByAdmin,
  deleteReviewByAdmin,
};
