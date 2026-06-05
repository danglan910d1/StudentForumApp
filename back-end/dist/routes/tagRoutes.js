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
// src/routes/tagRoutes.ts
const express_1 = require("express");
const tagCtrl = __importStar(require("../controllers/tagController"));
const auth_1 = require("../middleware/auth");
const admin_1 = require("../middleware/admin");
const ratelimit_1 = require("../middleware/ratelimit");
const idempotency_1 = require("../middleware/idempotency");
const router = (0, express_1.Router)();
/**
 * NHÓM 1: ADMIN ONLY
 * Quản lý kho dữ liệu Tag hệ thống
 */
// GET /api/tags/admin - Lấy toàn bộ danh sách (Admin View)
router.get("/admin", auth_1.authMiddleware, admin_1.adminMiddleware, ratelimit_1.generalLimiter, tagCtrl.getTagsList);
// POST /api/tags/admin - Admin tạo Tag chính thống
router.post("/admin", auth_1.authMiddleware, admin_1.adminMiddleware, ratelimit_1.sensitiveLimiter, idempotency_1.preventDuplicateRequest, tagCtrl.createTagByAdmin);
// PATCH /api/tags/admin/bulk - Duyệt/Từ chối hàng loạt Tags
router.patch("/admin/bulk", auth_1.authMiddleware, admin_1.adminMiddleware, ratelimit_1.sensitiveLimiter, idempotency_1.preventDuplicateRequest, tagCtrl.bulkUpdateTags);
// PUT /api/tags/admin/restore/:id - Khôi phục Tag đã xóa
router.put("/admin/restore/:id", auth_1.authMiddleware, admin_1.adminMiddleware, ratelimit_1.sensitiveLimiter, tagCtrl.restoreTag);
// GET /api/tags/admin/:id - Chi tiết Tag (Admin View)
router.get("/admin/:id", auth_1.authMiddleware, admin_1.adminMiddleware, ratelimit_1.generalLimiter, tagCtrl.getTagById);
// PUT /api/tags/admin/:id - Cập nhật Tag lẻ
router.put("/admin/:id", auth_1.authMiddleware, admin_1.adminMiddleware, ratelimit_1.sensitiveLimiter, idempotency_1.preventDuplicateRequest, tagCtrl.updateTag);
// DELETE /api/tags/admin/:id - Xóa mềm Tag
router.delete("/admin/:id", auth_1.authMiddleware, admin_1.adminMiddleware, ratelimit_1.sensitiveLimiter, tagCtrl.deleteTag);
/**
 * NHÓM 2: PUBLIC ACCESS
 */
// GET /api/tags - Lấy danh sách Tag đã duyệt (Gợi ý cho User/Khách)
router.get("/", ratelimit_1.generalLimiter, tagCtrl.getTagsList);
exports.default = router;
//# sourceMappingURL=tagRoutes.js.map