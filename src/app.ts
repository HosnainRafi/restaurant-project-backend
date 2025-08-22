import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import config from "./config";
import { stripeWebhook } from "./app/modules/payment/payment.controller";

const app: Application = express();

// Middlewares
app.use(cors({ origin: config.client_origin, credentials: true }));
// for Stripe
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' https://js.stripe.com https://m.stripe.network 'unsafe-inline'; " +
    "worker-src 'self' blob:; " +
    "connect-src 'self' https://api.stripe.com https://m.stripe.network;"
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }), // raw body for Stripe
  stripeWebhook
);

// End code for stripe

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Application Routes
app.use("/api/v1", router);

// Health Check Route
app.get("/", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Welcome to the Restaurant API!",
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use(globalErrorHandler);

// Not Found Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API Not Found!",
    errorDetails: {
      path: req.originalUrl,
      method: req.method,
    },
  });
});

export default app;
