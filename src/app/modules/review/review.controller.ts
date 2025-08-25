import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req, res) => {
  const result = await ReviewService.createReviewInDB(req.body, req.user.uid);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Thank you for your review!",
    data: result,
  });
});

const getAllReviews = catchAsync(async (req, res) => {
  const result = await ReviewService.getAllReviewsFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All reviews retrieved successfully!",
    data: result,
  });
});

const getMyReviews = catchAsync(async (req, res) => {
  const result = await ReviewService.getMyReviewsFromDB(req.user.uid);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your reviews retrieved successfully!",
    data: result,
  });
});

const updateReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const result = await ReviewService.updateReviewInDB(
    reviewId,
    req.user.uid,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully!",
    data: result,
  });
});

const deleteReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  await ReviewService.deleteReviewFromDB(reviewId, req.user.uid);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully!",
    data: null,
  });
});

export const ReviewController = {
  createReview,
  getAllReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};
