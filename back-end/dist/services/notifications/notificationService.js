"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotificationService = exports.markAllAsReadService = exports.createNotification = void 0;
const Notification_1 = __importStar(require("../../models/Notification"));
// Tạo và gửi thông báo (Dùng trong Post/Comment/Like Controller)
const createNotification = async (data) => {
    // Logic nghiệp vụ: Không tự thông báo cho chính mình
    const isSelfNotify = data.recipientId?.toString() === data.senderId?.toString();
    // Cho phép tự thông báo nếu là duyệt/từ chối bài, các loại khác thì chặn
    const isModerationAction = data.type === Notification_1.NotificationType.POST_APPROVED ||
        data.type === Notification_1.NotificationType.POST_REJECTED;
    if (isSelfNotify && !isModerationAction)
        return; //
    return await Notification_1.default.create(data);
};
exports.createNotification = createNotification;
// Đánh dấu tất cả thông báo của 1 user là đã đọc
const markAllAsReadService = async (userId) => {
    return await Notification_1.default.updateMany({ recipientId: userId, is_read: false }, { is_read: true });
};
exports.markAllAsReadService = markAllAsReadService;
// Xóa thông báo Đảm bảo đúng chủ sở hữu mới được xóa
const deleteNotificationService = async (notificationId, userId) => {
    return await Notification_1.default.findOneAndDelete({
        _id: notificationId,
        recipientId: userId,
    });
};
exports.deleteNotificationService = deleteNotificationService;
//# sourceMappingURL=notificationService.js.map