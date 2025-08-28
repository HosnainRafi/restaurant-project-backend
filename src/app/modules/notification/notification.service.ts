import { getIO } from "../../../socket";
import { User } from "../user/user.model";
import { INotification } from "./notification.interface";
import { Notification } from "./notification.model";

const createNotification = async (
  data: Omit<INotification, "isRead">
): Promise<void> => {
  const notification = await Notification.create(data);
  // Emit a real-time event to the specific user's room
  getIO()
    .to(data.recipientId.toString())
    .emit("notification:new", notification);
};

const getMyNotifications = async (userId: string): Promise<INotification[]> => {
  const user = await User.findOne({ uid: userId });
  if (!user) return [];
  return Notification.find({ recipientId: user._id })
    .sort({ createdAt: -1 })
    .limit(50);
};

const markNotificationsAsRead = async (userId: string): Promise<void> => {
  const user = await User.findOne({ uid: userId });
  if (!user) return;
  await Notification.updateMany(
    { recipientId: user._id, isRead: false },
    { isRead: true }
  );
};
const markNotificationAsReadSingle = async (
  notificationId: string
): Promise<void> => {
  await Notification.findByIdAndUpdate(notificationId, { isRead: true });
};
export const NotificationService = {
  createNotification,
  getMyNotifications,
  markNotificationsAsRead,
  markNotificationAsReadSingle,
};
