import express from "express";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth"; // The new Firebase auth middleware
import validateRequest from "../../../app/middlewares/validateRequest";
import {
  changePasswordValidationSchema,
  updateUserStatusValidationSchema,
  updateUserValidationSchema,
  userSyncValidationSchema,
} from "./user.validation";

const router = express.Router();

// This endpoint is called by the frontend after a successful Firebase login
// to ensure a user profile exists in our database.
router.post(
  "/sync",
  auth(),
  validateRequest(userSyncValidationSchema), // Apply the new validation
  UserController.syncUser
);

router.get("/me", auth(), UserController.getMe);

router.get("/me/orders", auth("customer"), UserController.getMyOrders);

// --- ADDED: Endpoint for getting the user's reservations ---
router.get(
  "/me/reservations",
  auth("customer"),
  UserController.getMyReservations
);

router.get(
  "/me/orders/:id",
  auth("customer"),
  UserController.getMyOrderDetails
);

// --- NEW ROUTE for cancelling an order ---
router.patch(
  "/me/orders/:id/cancel",
  auth("customer"),
  UserController.cancelMyOrder
);

router.patch(
  "/me",
  auth(),
  validateRequest(updateUserValidationSchema), // Apply the update validation
  UserController.updateMe
);

// router.patch(
//   "/me/change-password",
//   auth(),
//   validateRequest(changePasswordValidationSchema),
//   UserController.changePassword
// );

router.get(
  '/', // Corresponds to GET /api/v1/users
  auth('admin'), // Only admins can access
  UserController.getAllUsers,
);

router.patch(
  '/:id/status', // Corresponds to PATCH /api/v1/users/:id/status
  auth('admin'), // Only admins can access
  validateRequest(updateUserStatusValidationSchema), // Validate the payload
  UserController.updateUserStatus,
);

export const UserRoutes = router;
