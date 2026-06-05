// src/routes/postRoutes.ts
import { Router } from "express";
import * as postCtrl from "../controllers/postController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { optionalAuth } from "../middleware/optionalAuth";
import { generalLimiter, sensitiveLimiter } from "../middleware/ratelimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

/**
 * NHÓM 1: ADMIN ONLY
 * Đặt lên đầu để không bị trùng với route GET /:id
 */

// POST /api/posts/admin/approve/:id - Duyệt bài & xử lý Tag đề xuất
router.post(
  "/admin/approve/:id",
  authMiddleware,
  adminMiddleware,
  sensitiveLimiter,
  preventDuplicateRequest,
  postCtrl.adminApprovePostController
);

// PUT /api/posts/admin/restore/:id - Khôi phục bài từ thùng rác
router.put(
  "/admin/restore/:id",
  authMiddleware,
  adminMiddleware,
  sensitiveLimiter,
  postCtrl.restorePost
);

// PUT /api/posts/admin/sticky/:id - Ghim/Bỏ ghim bài viết
router.put(
  "/admin/sticky/:id",
  authMiddleware,
  adminMiddleware,
  sensitiveLimiter,
  postCtrl.togglePostStickyController
);

// GET /api/posts/admin/:id - Xem chi tiết mọi trạng thái bài viết
router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  generalLimiter,
  postCtrl.getPostByIdForAdmin
);

/**
 * NHÓM 2: PUBLIC / OPTIONAL AUTH
 */

// GET /api/posts - Danh sách bài viết (Filter theo Approved/User/Search)
router.get("/", generalLimiter, optionalAuth, postCtrl.getPosts);

// GET /api/posts/:id - Xem chi tiết bài viết công khai & Tăng View
router.get("/:id", generalLimiter, optionalAuth, postCtrl.getPostById);

/**
 * NHÓM 3: AUTHORIZED USERS (Author/Admin)
 */

// POST /api/posts - Tạo bài viết mới (Status mặc định: pending)
router.post(
  "/",
  authMiddleware,
  sensitiveLimiter,
  preventDuplicateRequest,
  postCtrl.createPost
);

// PUT /api/posts/:id - Cập nhật nội dung bài viết
router.put(
  "/:id",
  authMiddleware,
  sensitiveLimiter,
  preventDuplicateRequest,
  postCtrl.updatePost
);

// DELETE /api/posts/:id - Xóa mềm bài viết
router.delete("/:id", authMiddleware, sensitiveLimiter, postCtrl.deletePost);

export default router;
