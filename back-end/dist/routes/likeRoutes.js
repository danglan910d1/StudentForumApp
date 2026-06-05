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
// src/routes/likeRoutes.ts
const express_1 = require("express");
const likeCtrl = __importStar(require("../controllers/likeController"));
const auth_1 = require("../middleware/auth");
const optionalAuth_1 = require("../middleware/optionalAuth");
const ratelimit_1 = require("../middleware/ratelimit");
const idempotency_1 = require("../middleware/idempotency");
const router = (0, express_1.Router)();
/**
 * NHÓM 1: PUBLIC / OPTIONAL AUTH
 * Dùng để hiển thị dữ liệu lên giao diện.
 */
// GET /api/likes - Lấy trạng thái Like & Tổng số lượt Like
// Query params: ?targetType=post|comment&targetId=...
router.get("/", optionalAuth_1.optionalAuth, ratelimit_1.generalLimiter, likeCtrl.getLikeStatus);
/**
 * NHÓM 2: AUTHENTICATED USER
 * Các thao tác thay đổi dữ liệu yêu cầu định danh.
 */
// POST /api/likes/:targetType/:targetId - Thích hoặc Bỏ thích (Toggle)
// :targetType có thể là 'post' hoặc 'comment'
router.post("/:targetType/:targetId", auth_1.authMiddleware, ratelimit_1.sensitiveLimiter, idempotency_1.preventDuplicateRequest, likeCtrl.toggleLike);
exports.default = router;
//# sourceMappingURL=likeRoutes.js.map