import express from "express";
import auth from "../../middlewares/auth";
import { NotificationController } from "./notification.controller";

const router = express.Router();
router.get("/", auth(), NotificationController.getMyNotifications);
router.patch("/mark-as-read", auth(), NotificationController.markAsRead);
export const NotificationRoutes = router;
