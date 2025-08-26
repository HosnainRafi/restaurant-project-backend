import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewController } from "./review.controller";
import {
  customerReviewValidationSchema,
  adminReviewUpdateValidationSchema,
} from "./review.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

// --- PUBLIC ROUTE ---
router.get("/featured", ReviewController.getFeaturedReviews);

// --- CUSTOMER ROUTES ---
router.post(
  "/",
  auth("customer"),
  validateRequest(customerReviewValidationSchema),
  ReviewController.createReview
);
router.get("/my-reviews", auth("customer"), ReviewController.getMyReviews);
router.patch(
  "/my-reviews/:reviewId",
  auth("customer"),
  validateRequest(customerReviewValidationSchema),
  ReviewController.updateMyReview
);

// --- ADMIN ROUTES ---
router.get("/", auth("admin"), ReviewController.getAllReviews);
router.patch(
  "/:reviewId",
  auth("admin"),
  validateRequest(adminReviewUpdateValidationSchema),
  ReviewController.updateReviewAsAdmin
);
router.delete(
  "/:reviewId",
  auth("admin"),
  ReviewController.deleteReviewAsAdmin
);

export const ReviewRoutes = router;
