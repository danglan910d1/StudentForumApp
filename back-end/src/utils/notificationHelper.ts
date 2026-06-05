// src/utils/notificationHelper.ts
import { NotificationType } from "../models/Notification";

export const generateNotificationContent = (
  type: NotificationType,
  data: {
    title?: string | undefined;
    reason?: string | undefined;
    userName?: string | undefined;
    targetType?: "post" | "comment" | undefined;
  }
): string => {
  const { title, reason, userName, targetType } = data;

  switch (type) {
    case NotificationType.POST_SUBMITTED:
      return `Người dùng ${userName || "ai đó"} đã gửi bài viết mới: "${
        title || "Không tiêu đề"
      }" chờ duyệt.`;

    case NotificationType.POST_APPROVED:
      return reason
        ? `Bài viết "${title}" đã được duyệt. Ghi chú: ${reason}`
        : `Bài viết "${title}" của bạn đã được phê duyệt.`;

    case NotificationType.POST_REJECTED:
      return reason
        ? `Bài viết "${title}" bị từ chối. Lý do: ${reason}`
        : `Bài viết "${title}" bị từ chối do không phù hợp.`;

    case NotificationType.NEW_COMMENT:
      return `đã bình luận về bài viết của bạn.`;

    case NotificationType.NEW_REPLY:
      return `đã trả lời bình luận của bạn.`;

    case NotificationType.NEW_LIKE:
      return `đã thích ${
        targetType === "post" ? "bài viết" : "bình luận"
      } của bạn.`;

    default:
      return "Bạn có thông báo mới.";
  }
};
