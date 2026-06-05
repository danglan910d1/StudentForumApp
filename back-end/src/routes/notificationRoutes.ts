// src/routes/notificationRoutes.ts
import { Router } from "express";
import * as notifyCtrl from "../controllers/notificationController";
import { authMiddleware } from "../middleware/auth";
import { generalLimiter } from "../middleware/ratelimit";

const router = Router();

/**
 * NHÓM: USER NOTIFICATIONS
 */

// GET /api/notifications - Lấy danh sách thông báo cá nhân
router.get("/", authMiddleware, generalLimiter, notifyCtrl.getNotifications);

// PATCH /api/notifications/:id/read - Đánh dấu 1 thông báo là đã đọc
router.patch("/:id/read", authMiddleware, notifyCtrl.markAsRead);

// PATCH /api/notifications/read-all - Đánh dấu tất cả là đã đọc
router.patch("/read-all", authMiddleware, notifyCtrl.markAllAsRead);

// DELETE /api/notifications/:id - Xóa 1 thông báo
router.delete("/:id", authMiddleware, notifyCtrl.deleteNotification);

export default router;
