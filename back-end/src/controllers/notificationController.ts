import { Response } from "express";
import Notification from "../models/Notification";
import * as notifyService from "../services/notifications/notificationService";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types/express";
import { buildNotificationAggregationPipeline } from "../services/notifications/notificationPipeline";
import { Types } from "mongoose";
import { GetNotificationsQuery } from "../types/noti";
import { paginateAggregation } from "../utils/pagination";

// 1. GET /api/notifications
// 1. Lấy danh sách (Dùng Pipeline để làm phẳng ID)
export const getNotifications = asyncHandler(
  async (
    req: AuthenticatedRequest<{}, {}, {}, GetNotificationsQuery>,
    res: Response
  ) => {
    const query = req.query; // Bây giờ query đã có type là GetNotificationsQuery
    const userId = req.userId!;

    // 1. Build Filter
    const filter: any = { recipientId: new Types.ObjectId(userId) };
    if (query.targetId) {
      filter.entityId = new Types.ObjectId(query.targetId);
    }

    // Nếu FE truyền ?is_read=false thì ta thêm vào filter
    if (query.is_read !== undefined) {
      filter.is_read = query.is_read === "true";
    }

    // 2. Build Pipeline
    const pipeline = buildNotificationAggregationPipeline(filter, {
      includeSender: true,
    });

    // 3. Phân trang sử dụng hàm dùng chung (Tái sử dụng logic giống Comment)
    const result = await paginateAggregation(
      Notification,
      pipeline,
      query.page, // paginateAggregation sẽ tự xử lý ép kiểu Number bên trong
      query.limit
    );

    // 4. Lấy số lượng chưa đọc (Badge)
    const unreadCount = await Notification.countDocuments({
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
  }
);
// 2. PATCH /api/notifications/:id/read
// 2. Đánh dấu đã đọc (Dùng findOneAndUpdate trực tiếp vì đơn giản)
export const markAsRead = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.userId },
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Marked as read", notificationId: notification.id });
  }
);

// 3. PATCH /api/notifications/read-all
// 3. Đánh dấu tất cả (Gọi Service)
export const markAllAsRead = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    await notifyService.markAllAsReadService(req.userId);
    res.json({ message: "All notifications marked as read" });
  }
);

// 4. DELETE /api/notifications/:id
// 4. Xóa thông báo (Gọi Service và Validation)
export const deleteNotification = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "ID is required" });

    const result = await notifyService.deleteNotificationService(
      id,
      req.userId
    );

    if (!result) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  }
);
