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
// src/routes/userRoutes.ts
const express_1 = require("express");
const userCtrl = __importStar(require("../controllers/userController"));
const auth_1 = require("../middleware/auth");
const admin_1 = require("../middleware/admin");
const ratelimit_1 = require("../middleware/ratelimit");
const idempotency_1 = require("../middleware/idempotency");
const multer_1 = require("../middleware/multer");
const router = (0, express_1.Router)();
/**
 * NHÓM 1: CÁC ROUTE ĐỊNH DANH CỤ THỂ (SPECIFIC ROUTES)
 */
// GET /api/users/me - Lấy thông tin cá nhân hiện tại
router.get("/me", auth_1.authMiddleware, ratelimit_1.generalLimiter, userCtrl.getMe);
// PUT /api/users/profile - Cập nhật Profile (Name, Avatar)
router.put("/profile", auth_1.authMiddleware, ratelimit_1.sensitiveLimiter, (0, multer_1.multerErrorHandler)(multer_1.uploadSingleAvatar), idempotency_1.preventDuplicateRequest, userCtrl.updateProfile);
// PUT /api/users/password - Đổi mật khẩu
router.put("/password", auth_1.authMiddleware, ratelimit_1.sensitiveLimiter, idempotency_1.preventDuplicateRequest, userCtrl.updatePassword);
// DELETE /api/users/me - Tự xóa tài khoản cá nhân
router.delete("/me", auth_1.authMiddleware, ratelimit_1.sensitiveLimiter, idempotency_1.preventDuplicateRequest, userCtrl.deleteUser);
/**
 * NHÓM 2: CÁC ROUTE ADMIN (DYNAMIC & PROTECTED)
 */
// GET /api/users/admin - Admin lấy danh sách tất cả Users
router.get("/admin", auth_1.authMiddleware, admin_1.adminMiddleware, ratelimit_1.generalLimiter, userCtrl.getUsersList);
// PUT /api/users/admin/:id/status - Admin cập nhật trạng thái/role
router.put("/admin/:id/status", auth_1.authMiddleware, admin_1.adminMiddleware, ratelimit_1.sensitiveLimiter, idempotency_1.preventDuplicateRequest, userCtrl.updateUserStatus);
// GET /api/users/admin/:id - Admin xem chi tiết User theo ID
router.get("/admin/:id", auth_1.authMiddleware, admin_1.adminMiddleware, ratelimit_1.generalLimiter, userCtrl.getUserById);
// DELETE /api/users/admin/:id - Admin xóa tài khoản người dùng
router.delete("/admin/:id", auth_1.authMiddleware, admin_1.adminMiddleware, ratelimit_1.sensitiveLimiter, idempotency_1.preventDuplicateRequest, userCtrl.deleteUser);
/**
 * NHÓM 3: PUBLIC ROUTES (DYNAMIC & OPEN)
 */
// GET /api/users/ - Tìm kiếm/Danh sách User công khai
router.get("/", ratelimit_1.generalLimiter, userCtrl.getUsersList);
// GET /api/users/:id - Xem hồ sơ công khai của người khác
router.get("/:id", ratelimit_1.generalLimiter, userCtrl.getUserById);
exports.default = router;
//# sourceMappingURL=userRouters.js.map