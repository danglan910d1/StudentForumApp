// src/routes/authRoutes.ts
import { Router } from "express";
import * as authCtrl from "../controllers/authController";
import {
  authLimiter,
  logoutLimiter,
  sensitiveLimiter,
} from "../middleware/ratelimit";
import { preventDuplicateRequest } from "../middleware/idempotency";
import { authMiddleware } from "../middleware/auth";

const router = Router();

/**
 * NHÓM 1: PUBLIC (GUEST ACCESS)
 */

// POST /api/auth/register - Đăng ký tài khoản
router.post(
  "/register",
  authLimiter,
  preventDuplicateRequest,
  authCtrl.register,
);

// POST /api/auth/login - Đăng nhập
router.post("/login", authLimiter, preventDuplicateRequest, authCtrl.login);

// Quên mật khẩu & OTP (PUBLIC)
router.post("/sendOtp", sensitiveLimiter, authCtrl.sendOTP);
router.post(
  "/resetPassword",
  sensitiveLimiter,
  preventDuplicateRequest,
  authCtrl.resetPassword,
);

/**
 * NHÓM 2: AUTH REQUIRED (USER ACCESS)
 */

// POST /api/auth/logout - Đăng xuất (Thu hồi Token)
router.post(
  "/logout",
  authMiddleware, // Cần định danh để biết token nào cần revoke
  logoutLimiter,
  authCtrl.logout,
);

export default router;
