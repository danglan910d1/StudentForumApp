// src/routes/userRoutes.ts
import { Router } from "express";
import * as userCtrl from "../controllers/userController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { generalLimiter, sensitiveLimiter } from "../middleware/ratelimit";
import { preventDuplicateRequest } from "../middleware/idempotency";
import { multerErrorHandler, uploadSingleAvatar } from "../middleware/multer";

const router = Router();

/**
 * NHÓM 1: CÁC ROUTE ĐỊNH DANH CỤ THỂ (SPECIFIC ROUTES)
 */

// GET /api/users/me - Lấy thông tin cá nhân hiện tại
router.get("/me", authMiddleware, generalLimiter, userCtrl.getMe);

// PUT /api/users/profile - Cập nhật Profile (Name, Avatar)
router.put(
  "/profile",
  authMiddleware,
  sensitiveLimiter,
  multerErrorHandler(uploadSingleAvatar),
  preventDuplicateRequest,
  userCtrl.updateProfile,
);

// PUT /api/users/password - Đổi mật khẩu
router.put(
  "/password",
  authMiddleware,
  sensitiveLimiter,
  preventDuplicateRequest,
  userCtrl.updatePassword,
);

// DELETE /api/users/me - Tự xóa tài khoản cá nhân
router.delete(
  "/me",
  authMiddleware,
  sensitiveLimiter,
  preventDuplicateRequest,
  userCtrl.deleteUser,
);

/**
 * NHÓM 2: CÁC ROUTE ADMIN (DYNAMIC & PROTECTED)
 */

// GET /api/users/admin - Admin lấy danh sách tất cả Users
router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  generalLimiter,
  userCtrl.getUsersList,
);

// PUT /api/users/admin/:id/status - Admin cập nhật trạng thái/role
router.put(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  sensitiveLimiter,
  preventDuplicateRequest,
  userCtrl.updateUserStatus,
);

// GET /api/users/admin/:id - Admin xem chi tiết User theo ID
router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  generalLimiter,
  userCtrl.getUserById,
);

// DELETE /api/users/admin/:id - Admin xóa tài khoản người dùng
router.delete(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  sensitiveLimiter,
  preventDuplicateRequest,
  userCtrl.deleteUser,
);

/**
 * NHÓM 3: PUBLIC ROUTES (DYNAMIC & OPEN)
 */

// GET /api/users/ - Tìm kiếm/Danh sách User công khai
router.get("/", generalLimiter, userCtrl.getUsersList);

// GET /api/users/:id - Xem hồ sơ công khai của người khác
router.get("/:id", generalLimiter, userCtrl.getUserById);

export default router;
