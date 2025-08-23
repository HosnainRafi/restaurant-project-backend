// import express from "express";
// import { PaymentController } from "./payment.controller";

// const router = express.Router();

// // This route needs the raw request body, so we apply the middleware here
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }), // 👈 Crucial middleware for Stripe
//   PaymentController.stripeWebhook
// );

// router.post("/create-payment-intent", PaymentController.createPaymentIntent);

// export const PaymentRoutes = router;
import { Router } from "express";
import { createPaymentIntent, PaymentController } from "./payment.controller";
import auth from "../../../app/middlewares/auth";

const router = Router();

router.post(
  "/retry-payment-intent",
  auth(), // Protect this route for all authenticated users
  PaymentController.createPaymentIntentForOrder
);

// POST /payment/create-payment-intent
router.post("/create-payment-intent", createPaymentIntent);

export const PaymentRoutes = router;
