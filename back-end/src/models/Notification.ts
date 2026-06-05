// src/models/Notification.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export enum NotificationType {
  // --- Luồng Admin -> User ---
  POST_APPROVED = "post_approved",
  POST_REJECTED = "post_rejected",

  // --- Luồng User -> Admin ---
  POST_SUBMITTED = "post_submitted", // Khi User gửi bài mới chờ duyệt

  // --- Luồng User -> User ---
  NEW_COMMENT = "new_comment",
  NEW_REPLY = "new_reply",
  NEW_LIKE = "new_like",

  // --- Hệ thống ---
  SYSTEM_ALERT = "system_alert",
}
export interface INotification extends Document {
  recipientId: Types.ObjectId; // Người nhận thông báo
  senderId?: Types.ObjectId; // Người gây ra hành động (vd: người like)
  type: NotificationType;
  entityId: Types.ObjectId; // ID của Post hoặc Comment liên quan
  entityType: "post" | "comment";
  content: string; // Nội dung tóm tắt
  is_read: boolean;
  createdAt: Date;
}

const transformFunc = (doc: Document, ret: any) => {
  ret.notificationId = ret._id;
  delete ret._id;
  delete ret.__v;
  return ret;
};

const NotificationSchema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId, required: true },
    entityType: { type: String, enum: ["post", "comment"], required: true },
    content: { type: String, required: true },
    is_read: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { transform: transformFunc },
    toObject: { transform: transformFunc },
  }
);

// Index để lấy thông báo mới nhất nhanh hơn
NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ entityId: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Tự xóa sau 30 ngày

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
