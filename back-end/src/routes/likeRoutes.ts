// src/routes/likeRoutes.ts
import { Router } from "express";
import * as likeCtrl from "../controllers/likeController";
import { authMiddleware } from "../middleware/auth";
import { optionalAuth } from "../middleware/optionalAuth";
import { generalLimiter, sensitiveLimiter } from "../middleware/ratelimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

/**
 * NHÓM 1: PUBLIC / OPTIONAL AUTH
 * Dùng để hiển thị dữ liệu lên giao diện.
 */

// GET /api/likes - Lấy trạng thái Like & Tổng số lượt Like
// Query params: ?targetType=post|comment&targetId=...
router.get("/", optionalAuth, generalLimiter, likeCtrl.getLikeStatus);

/**
 * NHÓM 2: AUTHENTICATED USER
 * Các thao tác thay đổi dữ liệu yêu cầu định danh.
 */

// POST /api/likes/:targetType/:targetId - Thích hoặc Bỏ thích (Toggle)
// :targetType có thể là 'post' hoặc 'comment'
router.post(
  "/:targetType/:targetId",
  authMiddleware,
  sensitiveLimiter,
  preventDuplicateRequest,
  likeCtrl.toggleLike
);

export default router;
