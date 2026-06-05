// src/routes/tagRoutes.ts
import { Router } from "express";
import * as tagCtrl from "../controllers/tagController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { generalLimiter, sensitiveLimiter } from "../middleware/ratelimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

/**
 * NHÓM 1: ADMIN ONLY
 * Quản lý kho dữ liệu Tag hệ thống
 */

// GET /api/tags/admin - Lấy toàn bộ danh sách (Admin View)
router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  generalLimiter,
  tagCtrl.getTagsList
);

// POST /api/tags/admin - Admin tạo Tag chính thống
router.post(
  "/admin",
  authMiddleware,
  adminMiddleware,
  sensitiveLimiter,
  preventDuplicateRequest,
  tagCtrl.createTagByAdmin
);

// PATCH /api/tags/admin/bulk - Duyệt/Từ chối hàng loạt Tags
router.patch(
  "/admin/bulk",
  authMiddleware,
  adminMiddleware,
  sensitiveLimiter,
  preventDuplicateRequest,
  tagCtrl.bulkUpdateTags
);

// PUT /api/tags/admin/restore/:id - Khôi phục Tag đã xóa
router.put(
  "/admin/restore/:id",
  authMiddleware,
  adminMiddleware,
  sensitiveLimiter,
  tagCtrl.restoreTag
);

// GET /api/tags/admin/:id - Chi tiết Tag (Admin View)
router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  generalLimiter,
  tagCtrl.getTagById
);

// PUT /api/tags/admin/:id - Cập nhật Tag lẻ
router.put(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  sensitiveLimiter,
  preventDuplicateRequest,
  tagCtrl.updateTag
);

// DELETE /api/tags/admin/:id - Xóa mềm Tag
router.delete(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  sensitiveLimiter,
  tagCtrl.deleteTag
);

/**
 * NHÓM 2: PUBLIC ACCESS
 */

// GET /api/tags - Lấy danh sách Tag đã duyệt (Gợi ý cho User/Khách)
router.get("/", generalLimiter, tagCtrl.getTagsList);

export default router;
