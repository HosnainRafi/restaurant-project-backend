import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import config from "./config";

const app: Application = express();

// Middlewares
app.use(cors({ origin: config.client_origin, credentials: true }));
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
