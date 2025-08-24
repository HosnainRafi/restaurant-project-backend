import { Model, Types } from "mongoose";

export interface INotification {
  recipientId: Types.ObjectId; // The user who will receive the notification
  message: string;
  isRead: boolean;
  link?: string; // Optional link to navigate to (e.g., an order detail page)
}

export interface NotificationModel extends Model<INotification> {}
