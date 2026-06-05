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
exports.NotificationType = void 0;
// src/models/Notification.ts
const mongoose_1 = __importStar(require("mongoose"));
var NotificationType;
(function (NotificationType) {
    // --- Luồng Admin -> User ---
    NotificationType["POST_APPROVED"] = "post_approved";
    NotificationType["POST_REJECTED"] = "post_rejected";
    // --- Luồng User -> Admin ---
    NotificationType["POST_SUBMITTED"] = "post_submitted";
    // --- Luồng User -> User ---
    NotificationType["NEW_COMMENT"] = "new_comment";
    NotificationType["NEW_REPLY"] = "new_reply";
    NotificationType["NEW_LIKE"] = "new_like";
    // --- Hệ thống ---
    NotificationType["SYSTEM_ALERT"] = "system_alert";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
const transformFunc = (doc, ret) => {
    ret.notificationId = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
};
const NotificationSchema = new mongoose_1.Schema({
    recipientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    senderId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    type: {
        type: String,
        enum: Object.values(NotificationType),
        required: true,
    },
    entityId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    entityType: { type: String, enum: ["post", "comment"], required: true },
    content: { type: String, required: true },
    is_read: { type: Boolean, default: false, index: true },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { transform: transformFunc },
    toObject: { transform: transformFunc },
});
// Index để lấy thông báo mới nhất nhanh hơn
NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ entityId: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Tự xóa sau 30 ngày
exports.default = mongoose_1.default.model("Notification", NotificationSchema);
//# sourceMappingURL=Notification.js.map