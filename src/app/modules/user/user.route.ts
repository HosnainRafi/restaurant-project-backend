import express from "express";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth"; // The new Firebase auth middleware

const router = express.Router();

// This endpoint is called by the frontend after a successful Firebase login
// to ensure a user profile exists in our database.
router.post(
  "/sync",
  auth(), // We use auth() to ensure only valid Firebase users can sync
  UserController.syncUser // A new controller we need to create
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

export const UserRoutes = router;
