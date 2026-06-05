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
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/authRoutes.ts
const express_1 = require("express");
const authCtrl = __importStar(require("../controllers/authController"));
const ratelimit_1 = require("../middleware/ratelimit");
const idempotency_1 = require("../middleware/idempotency");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * NHÓM 1: PUBLIC (GUEST ACCESS)
 */
// POST /api/auth/register - Đăng ký tài khoản
router.post("/register", ratelimit_1.authLimiter, idempotency_1.preventDuplicateRequest, authCtrl.register);
// POST /api/auth/login - Đăng nhập
router.post("/login", ratelimit_1.authLimiter, idempotency_1.preventDuplicateRequest, authCtrl.login);
// Quên mật khẩu & OTP (PUBLIC)
router.post("/sendOtp", ratelimit_1.sensitiveLimiter, authCtrl.sendOTP);
router.post("/resetPassword", ratelimit_1.sensitiveLimiter, idempotency_1.preventDuplicateRequest, authCtrl.resetPassword);
/**
 * NHÓM 2: AUTH REQUIRED (USER ACCESS)
 */
// POST /api/auth/logout - Đăng xuất (Thu hồi Token)
router.post("/logout", auth_1.authMiddleware, // Cần định danh để biết token nào cần revoke
ratelimit_1.logoutLimiter, authCtrl.logout);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map