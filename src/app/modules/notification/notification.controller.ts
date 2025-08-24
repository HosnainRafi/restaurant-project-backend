import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import { NotificationService } from "./notification.service";
import { INotification } from "./notification.interface";
import httpStatus from "http-status";

const getMyNotifications = catchAsync(async (req, res) => {
  const notifications = await NotificationService.getMyNotifications(
    req.user.uid
  );
  sendResponse<INotification[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications retrieved successfully",
    data: notifications,
  });
});

const markAsRead = catchAsync(async (req, res) => {
  await NotificationService.markNotificationsAsRead(req.user.uid);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications marked as read successfully",
    data: null,
  });
});

export const NotificationController = { getMyNotifications, markAsRead };
