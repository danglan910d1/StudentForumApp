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
// src/routes/notificationRoutes.ts
const express_1 = require("express");
const notifyCtrl = __importStar(require("../controllers/notificationController"));
const auth_1 = require("../middleware/auth");
const ratelimit_1 = require("../middleware/ratelimit");
const router = (0, express_1.Router)();
/**
 * NHÓM: USER NOTIFICATIONS
 */
// GET /api/notifications - Lấy danh sách thông báo cá nhân
router.get("/", auth_1.authMiddleware, ratelimit_1.generalLimiter, notifyCtrl.getNotifications);
// PATCH /api/notifications/:id/read - Đánh dấu 1 thông báo là đã đọc
router.patch("/:id/read", auth_1.authMiddleware, notifyCtrl.markAsRead);
// PATCH /api/notifications/read-all - Đánh dấu tất cả là đã đọc
router.patch("/read-all", auth_1.authMiddleware, notifyCtrl.markAllAsRead);
// DELETE /api/notifications/:id - Xóa 1 thông báo
router.delete("/:id", auth_1.authMiddleware, notifyCtrl.deleteNotification);
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map