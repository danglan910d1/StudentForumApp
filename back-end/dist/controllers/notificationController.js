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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const notifyService = __importStar(require("../services/notifications/notificationService"));
const asyncHandler_1 = require("../utils/asyncHandler");
const notificationPipeline_1 = require("../services/notifications/notificationPipeline");
const mongoose_1 = require("mongoose");
const pagination_1 = require("../utils/pagination");
// 1. GET /api/notifications
// 1. Lấy danh sách (Dùng Pipeline để làm phẳng ID)
exports.getNotifications = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const query = req.query; // Bây giờ query đã có type là GetNotificationsQuery
    const userId = req.userId;
    // 1. Build Filter
    const filter = { recipientId: new mongoose_1.Types.ObjectId(userId) };
    if (query.targetId) {
        filter.entityId = new mongoose_1.Types.ObjectId(query.targetId);
    }
    // Nếu FE truyền ?is_read=false thì ta thêm vào filter
    if (query.is_read !== undefined) {
        filter.is_read = query.is_read === "true";
    }
    // 2. Build Pipeline
    const pipeline = (0, notificationPipeline_1.buildNotificationAggregationPipeline)(filter, {
        includeSender: true,
    });
    // 3. Phân trang sử dụng hàm dùng chung (Tái sử dụng logic giống Comment)
    const result = await (0, pagination_1.paginateAggregation)(Notification_1.default, pipeline, query.page, // paginateAggregation sẽ tự xử lý ép kiểu Number bên trong
    query.limit);
    // 4. Lấy số lượng chưa đọc (Badge)
    const unreadCount = await Notification_1.default.countDocuments({
        recipientId: userId,
        is_read: false,
    });
    res.json({
        notifications: result.items,
        unreadCount,
        pagination: {
            totalItems: result.totalItems,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            limit: result.limit,
        },
    });
});
// 2. PATCH /api/notifications/:id/read
// 2. Đánh dấu đã đọc (Dùng findOneAndUpdate trực tiếp vì đơn giản)
exports.markAsRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const notification = await Notification_1.default.findOneAndUpdate({ _id: req.params.id, recipientId: req.userId }, { is_read: true }, { new: true });
    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Marked as read", notificationId: notification.id });
});
// 3. PATCH /api/notifications/read-all
// 3. Đánh dấu tất cả (Gọi Service)
exports.markAllAsRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await notifyService.markAllAsReadService(req.userId);
    res.json({ message: "All notifications marked as read" });
});
// 4. DELETE /api/notifications/:id
// 4. Xóa thông báo (Gọi Service và Validation)
exports.deleteNotification = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ message: "ID is required" });
    const result = await notifyService.deleteNotificationService(id, req.userId);
    if (!result) {
        return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted successfully" });
});
//# sourceMappingURL=notificationController.js.map