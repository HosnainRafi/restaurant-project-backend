import express from "express";
import auth from "../../middlewares/auth";
import { CustomerController } from "./customer.controller";

const router = express.Router();

// Get the logged-in customer's orders
router.get("/my-orders", auth("customer"), CustomerController.getMyOrders);

// Get the logged-in customer's profile
router.get("/my-profile", auth("customer"), CustomerController.getMe);

// Update the logged-in customer's profile
router.put("/my-profile", auth("customer"), CustomerController.updateMe);

export const CustomerRoutes = router;
