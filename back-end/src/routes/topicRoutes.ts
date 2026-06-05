// src/routes/topicRoutes.ts
import { Router } from "express";
import * as topicCtrl from "../controllers/topicController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { generalLimiter, sensitiveLimiter } from "../middleware/ratelimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

/**
 * NHÓM 1: ADMIN ONLY
 * Quản lý danh mục (Topics) hệ thống
 */

// GET /api/topics/admin - Lấy toàn bộ danh sách (Admin View)
router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  generalLimiter,
  topicCtrl.getTopicsList,
);

// POST /api/topics/admin - Tạo Topic chính thống mới
router.post(
  "/admin",
  authMiddleware,
  adminMiddleware,
  sensitiveLimiter,
  preventDuplicateRequest,
  topicCtrl.createTopic,
);

// PUT /api/topics/admin/restore/:id - Khôi phục Topic đã xóa mềm
router.put(
  "/admin/restore/:id",
  authMiddleware,
  adminMiddleware,
  sensitiveLimiter,
  topicCtrl.restoreTopic,
);

// GET /api/topics/admin/:id - Chi tiết Topic (Admin View)
router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  generalLimiter,
  topicCtrl.getTopicById,
);

// PUT /api/topics/admin/:id - Cập nhật thông tin/trạng thái Topic
router.put(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  sensitiveLimiter,
  // preventDuplicateRequest,
  topicCtrl.updateTopic,
);

// DELETE /api/topics/admin/:id - Xóa mềm Topic
router.delete(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  sensitiveLimiter,
  topicCtrl.deleteTopic,
);

/**
 * NHÓM 2: PUBLIC ACCESS
 */

// GET /api/topics - Danh sách Topic đã duyệt (Cho User chọn hoặc xem danh mục)
router.get("/", generalLimiter, topicCtrl.getTopicsList);

export default router;
