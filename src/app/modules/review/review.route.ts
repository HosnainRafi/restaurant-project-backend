import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewController } from "./review.controller";
import { createReviewValidationSchema } from "./review.validation"; // You'll need to create an update schema too
import auth from "../../middlewares/auth";

const router = express.Router();

// Route for admins to get all reviews
router.get("/", auth("admin"), ReviewController.getAllReviews);

// Route for customers to get their own reviews
router.get("/my-reviews", auth("customer"), ReviewController.getMyReviews);

// Route for a customer to create a review
router.post(
  "/",
  auth("customer"),
  validateRequest(createReviewValidationSchema),
  ReviewController.createReview
);

// Route for a customer to update their own review
router.patch(
  "/:reviewId",
  auth("customer"),
  // Note: For a real app, you'd create an `updateReviewValidationSchema`
  // that makes fields optional. We'll skip it here for brevity.
  validateRequest(createReviewValidationSchema),
  ReviewController.updateReview
);

// Route for a customer to delete their own review
router.delete("/:reviewId", auth("customer"), ReviewController.deleteReview);

export const ReviewRoutes = router;
