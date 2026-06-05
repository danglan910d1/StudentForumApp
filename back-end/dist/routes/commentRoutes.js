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
// src/routes/commentRoutes.ts
const express_1 = require("express");
const commentCtrl = __importStar(require("../controllers/commentController"));
const auth_1 = require("../middleware/auth");
const optionalAuth_1 = require("../middleware/optionalAuth");
const admin_1 = require("../middleware/admin");
const ratelimit_1 = require("../middleware/ratelimit");
const idempotency_1 = require("../middleware/idempotency");
const router = (0, express_1.Router)();
/**
 * NHÓM 1: PUBLIC ACCESS
 */
// GET /api/comments - Lấy danh sách bình luận (Public)
router.get("/", optionalAuth_1.optionalAuth, ratelimit_1.generalLimiter, commentCtrl.getComments);
/**
 * NHÓM 2: AUTHENTICATED USER (Author/Admin)
 */
// POST /api/comments - Tạo mới hoặc Trả lời bình luận
router.post("/", ratelimit_1.sensitiveLimiter, auth_1.authMiddleware, idempotency_1.preventDuplicateRequest, commentCtrl.createComment);
// PUT /api/comments/:commentId - Cập nhật nội dung bình luận
router.put("/:commentId", ratelimit_1.sensitiveLimiter, auth_1.authMiddleware, idempotency_1.preventDuplicateRequest, commentCtrl.updateComment);
// DELETE /api/comments/:commentId - Xóa bình luận (Soft Delete)
router.delete("/:commentId", ratelimit_1.sensitiveLimiter, auth_1.authMiddleware, commentCtrl.deleteComment);
/**
 * NHÓM 3: ADMIN ONLY
 * Đặt các route admin lên trên các route động nếu cần,
 * nhưng ở đây prefix '/admin' đã đủ phân biệt.
 */
// GET /api/comments/admin - Quản lý toàn bộ bình luận (Admin View)
router.get("/admin", auth_1.authMiddleware, admin_1.adminMiddleware, ratelimit_1.generalLimiter, commentCtrl.getAllCommentsForAdmin);
// PUT /api/comments/admin/restore/:commentId - Khôi phục bình luận
router.put("/admin/restore/:commentId", auth_1.authMiddleware, admin_1.adminMiddleware, commentCtrl.restoreComment);
exports.default = router;
//# sourceMappingURL=commentRoutes.js.map