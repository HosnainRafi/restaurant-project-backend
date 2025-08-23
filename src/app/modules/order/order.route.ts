import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import {
  createOrderValidationSchema,
  updateOrderStatusValidationSchema,
} from "./order.validation";
import { OrderController } from "./order.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth(),
  validateRequest(createOrderValidationSchema),
  OrderController.createOrder
);

// ✅ New admin route to get all orders
router.get("/", auth("admin", "staff"), OrderController.getAllOrders);

// ✅ New admin route to update an order's status
router.patch(
  "/:id",
  auth("admin", "staff"),
  validateRequest(updateOrderStatusValidationSchema),
  OrderController.updateOrderStatus
);

export const OrderRoutes = router;
