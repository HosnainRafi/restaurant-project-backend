import express from "express";
import { ReservationController } from "./reservation.controller";
import validateRequest from "../../middlewares/validateRequest";
import {
  createReservationValidationSchema,
  updateReservationStatusValidationSchema,
} from "./reservation.validation";
import auth from "../../../app/middlewares/auth";
// import auth from '../../middlewares/auth'; // You would create an auth middleware

const router = express.Router();

// Public route for customers to create a reservation
router.post(
  "/",
  auth(),
  validateRequest(createReservationValidationSchema),
  ReservationController.createReservation
);

// Admin/Staff routes to manage reservations
router.get(
  "/",
  // auth('admin', 'staff'), // Protect this route
  ReservationController.getAllReservations
);

router.patch(
  "/:id",
  // auth('admin', 'staff'), // Protect this route
  validateRequest(updateReservationStatusValidationSchema),
  ReservationController.updateReservationStatus
);

export const ReservationRoutes = router;
