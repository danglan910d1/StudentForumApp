// src/routes/commentRoutes.ts
import { Router } from "express";
import * as commentCtrl from "../controllers/commentController";
import { authMiddleware } from "../middleware/auth";
import { optionalAuth } from "../middleware/optionalAuth";
import { adminMiddleware } from "../middleware/admin";
import { generalLimiter, sensitiveLimiter } from "../middleware/ratelimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

/**
 * NHÓM 1: PUBLIC ACCESS
 */

// GET /api/comments - Lấy danh sách bình luận (Public)
router.get("/", optionalAuth, generalLimiter, commentCtrl.getComments);

/**
 * NHÓM 2: AUTHENTICATED USER (Author/Admin)
 */

// POST /api/comments - Tạo mới hoặc Trả lời bình luận
router.post(
  "/",
  sensitiveLimiter,
  authMiddleware,
  preventDuplicateRequest,
  commentCtrl.createComment
);

// PUT /api/comments/:commentId - Cập nhật nội dung bình luận
router.put(
  "/:commentId",
  sensitiveLimiter,
  authMiddleware,
  preventDuplicateRequest,
  commentCtrl.updateComment
);

// DELETE /api/comments/:commentId - Xóa bình luận (Soft Delete)
router.delete(
  "/:commentId",
  sensitiveLimiter,
  authMiddleware,
  commentCtrl.deleteComment
);

/**
 * NHÓM 3: ADMIN ONLY
 * Đặt các route admin lên trên các route động nếu cần,
 * nhưng ở đây prefix '/admin' đã đủ phân biệt.
 */

// GET /api/comments/admin - Quản lý toàn bộ bình luận (Admin View)
router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  generalLimiter,
  commentCtrl.getAllCommentsForAdmin
);

// PUT /api/comments/admin/restore/:commentId - Khôi phục bình luận
router.put(
  "/admin/restore/:commentId",
  authMiddleware,
  adminMiddleware,
  commentCtrl.restoreComment
);

export default router;
