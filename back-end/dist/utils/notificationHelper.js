"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNotificationContent = void 0;
// src/utils/notificationHelper.ts
const Notification_1 = require("../models/Notification");
const generateNotificationContent = (type, data) => {
    const { title, reason, userName, targetType } = data;
    switch (type) {
        case Notification_1.NotificationType.POST_SUBMITTED:
            return `Người dùng ${userName || "ai đó"} đã gửi bài viết mới: "${title || "Không tiêu đề"}" chờ duyệt.`;
        case Notification_1.NotificationType.POST_APPROVED:
            return reason
                ? `Bài viết "${title}" đã được duyệt. Ghi chú: ${reason}`
                : `Bài viết "${title}" của bạn đã được phê duyệt.`;
        case Notification_1.NotificationType.POST_REJECTED:
            return reason
                ? `Bài viết "${title}" bị từ chối. Lý do: ${reason}`
                : `Bài viết "${title}" bị từ chối do không phù hợp.`;
        case Notification_1.NotificationType.NEW_COMMENT:
            return `đã bình luận về bài viết của bạn.`;
        case Notification_1.NotificationType.NEW_REPLY:
            return `đã trả lời bình luận của bạn.`;
        case Notification_1.NotificationType.NEW_LIKE:
            return `đã thích ${targetType === "post" ? "bài viết" : "bình luận"} của bạn.`;
        default:
            return "Bạn có thông báo mới.";
    }
};
exports.generateNotificationContent = generateNotificationContent;
//# sourceMappingURL=notificationHelper.js.map