import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ReviewService } from "./review.service";
import ApiError from "../../../utils/ApiError";

const createReview = catchAsync(async (req, res) => {
  const result = await ReviewService.createReviewInDB(req.body, req.user.uid);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Thank you for your review!",
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

const getFeaturedReviews = catchAsync(async (req, res) => {
  const result = await ReviewService.getFeaturedReviewsFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Featured reviews retrieved successfully!",
    data: result,
  });
});

const getAllReviews = catchAsync(async (req, res) => {
  const result = await ReviewService.getAllReviewsForAdmin();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All reviews retrieved successfully for admin!",
    data: result,
  });
});

const updateMyReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  if (req.body.isFeatured !== undefined) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Customers cannot change the featured status."
    );
  }
  const result = await ReviewService.updateMyReviewInDB(
    reviewId,
    req.user.uid,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your review has been updated!",
    data: result,
  });
});

const updateReviewAsAdmin = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const result = await ReviewService.updateReviewByAdmin(reviewId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully by admin!",
    data: result,
  });
});

const deleteReviewAsAdmin = catchAsync(async (req, res) => {
  await ReviewService.deleteReviewByAdmin(req.params.reviewId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully by admin!",
    data: null,
  });
});

export const ReviewController = {
  createReview,
  getMyReviews,
  getFeaturedReviews,
  getAllReviews,
  updateMyReview,
  updateReviewAsAdmin,
  deleteReviewAsAdmin,
};
