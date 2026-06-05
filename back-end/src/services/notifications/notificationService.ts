import { Types } from "mongoose";
import Notification, { NotificationType } from "../../models/Notification";

// Định nghĩa Interface rõ ràng cho dữ liệu đầu vào (Input)
export interface ICreateNotificationInput {
  recipientId: string | Types.ObjectId;
  senderId?: string | Types.ObjectId;
  type: NotificationType;
  entityId: string | Types.ObjectId;
  entityType: "post" | "comment";
  content: string;
}

// Tạo và gửi thông báo (Dùng trong Post/Comment/Like Controller)
export const createNotification = async (data: ICreateNotificationInput) => {
  // Logic nghiệp vụ: Không tự thông báo cho chính mình
  const isSelfNotify =
    data.recipientId?.toString() === data.senderId?.toString();

  // Cho phép tự thông báo nếu là duyệt/từ chối bài, các loại khác thì chặn
  const isModerationAction =
    data.type === NotificationType.POST_APPROVED ||
    data.type === NotificationType.POST_REJECTED;

  if (isSelfNotify && !isModerationAction) return; //

  return await Notification.create(data);
};

// Đánh dấu tất cả thông báo của 1 user là đã đọc
export const markAllAsReadService = async (userId: string | Types.ObjectId) => {
  return await Notification.updateMany(
    { recipientId: userId, is_read: false },
    { is_read: true }
  );
};

// Xóa thông báo Đảm bảo đúng chủ sở hữu mới được xóa
export const deleteNotificationService = async (
  notificationId: string,
  userId: string | Types.ObjectId
) => {
  return await Notification.findOneAndDelete({
    _id: notificationId,
    recipientId: userId,
  });
};
