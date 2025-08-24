import { Schema, model } from "mongoose";
import { INotification, NotificationModel } from "./notification.interface";

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

export const Notification = model<INotification, NotificationModel>(
  "Notification",
  NotificationSchema
);
