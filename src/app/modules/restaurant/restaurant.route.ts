import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import {
  createRestaurantValidationSchema,
  updateRestaurantValidationSchema,
} from "./restaurant.validation";
import { RestaurantController } from "./restaurant.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// Public route to get the single restaurant's details
router.get("/", RestaurantController.getRestaurant);

// Admin-only route to create the restaurant profile
router.post(
  "/",
  auth("admin"),
  validateRequest(createRestaurantValidationSchema),
  RestaurantController.createRestaurant
);

// Admin-only route to update the restaurant profile
router.patch(
  // Using PATCH is more appropriate for partial updates
  "/",
  auth("admin"),
  validateRequest(updateRestaurantValidationSchema),
  RestaurantController.updateRestaurant
);

export const RestaurantRoutes = router;
