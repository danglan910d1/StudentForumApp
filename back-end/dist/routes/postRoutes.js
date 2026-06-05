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
// src/routes/postRoutes.ts
const express_1 = require("express");
const postCtrl = __importStar(require("../controllers/postController"));
const auth_1 = require("../middleware/auth");
const admin_1 = require("../middleware/admin");
const optionalAuth_1 = require("../middleware/optionalAuth");
const ratelimit_1 = require("../middleware/ratelimit");
const idempotency_1 = require("../middleware/idempotency");
const router = (0, express_1.Router)();
/**
 * NHÓM 1: ADMIN ONLY
 * Đặt lên đầu để không bị trùng với route GET /:id
 */
// POST /api/posts/admin/approve/:id - Duyệt bài & xử lý Tag đề xuất
router.post("/admin/approve/:id", auth_1.authMiddleware, admin_1.adminMiddleware, ratelimit_1.sensitiveLimiter, idempotency_1.preventDuplicateRequest, postCtrl.adminApprovePostController);
// PUT /api/posts/admin/restore/:id - Khôi phục bài từ thùng rác
router.put("/admin/restore/:id", auth_1.authMiddleware, admin_1.adminMiddleware, ratelimit_1.sensitiveLimiter, postCtrl.restorePost);
// PUT /api/posts/admin/sticky/:id - Ghim/Bỏ ghim bài viết
router.put("/admin/sticky/:id", auth_1.authMiddleware, admin_1.adminMiddleware, ratelimit_1.sensitiveLimiter, postCtrl.togglePostStickyController);
// GET /api/posts/admin/:id - Xem chi tiết mọi trạng thái bài viết
router.get("/admin/:id", auth_1.authMiddleware, admin_1.adminMiddleware, ratelimit_1.generalLimiter, postCtrl.getPostByIdForAdmin);
/**
 * NHÓM 2: PUBLIC / OPTIONAL AUTH
 */
// GET /api/posts - Danh sách bài viết (Filter theo Approved/User/Search)
router.get("/", ratelimit_1.generalLimiter, optionalAuth_1.optionalAuth, postCtrl.getPosts);
// GET /api/posts/:id - Xem chi tiết bài viết công khai & Tăng View
router.get("/:id", ratelimit_1.generalLimiter, optionalAuth_1.optionalAuth, postCtrl.getPostById);
/**
 * NHÓM 3: AUTHORIZED USERS (Author/Admin)
 */
// POST /api/posts - Tạo bài viết mới (Status mặc định: pending)
router.post("/", auth_1.authMiddleware, ratelimit_1.sensitiveLimiter, idempotency_1.preventDuplicateRequest, postCtrl.createPost);
// PUT /api/posts/:id - Cập nhật nội dung bài viết
router.put("/:id", auth_1.authMiddleware, ratelimit_1.sensitiveLimiter, idempotency_1.preventDuplicateRequest, postCtrl.updatePost);
// DELETE /api/posts/:id - Xóa mềm bài viết
router.delete("/:id", auth_1.authMiddleware, ratelimit_1.sensitiveLimiter, postCtrl.deletePost);
exports.default = router;
//# sourceMappingURL=postRoutes.js.map