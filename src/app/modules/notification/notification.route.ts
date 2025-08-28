import express from "express";
import auth from "../../middlewares/auth";
import { NotificationController } from "./notification.controller";

const router = express.Router();
router.get("/", auth(), NotificationController.getMyNotifications);
router.patch("/mark-as-read", auth(), NotificationController.markAsRead);
router.patch('/:id/mark-as-read', auth(), NotificationController.markAsReadSingle);
export const NotificationRoutes = router;
