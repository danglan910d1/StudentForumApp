"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLikeStatus = exports.toggleLike = void 0;
const mongoose_1 = require("mongoose");
const Like_1 = __importDefault(require("../models/Like"));
const Post_1 = __importDefault(require("../models/Post"));
const Comment_1 = __importDefault(require("../models/Comment"));
const asyncHandler_1 = require("../utils/asyncHandler");
const appError_1 = require("../utils/appError");
const jobQueue_1 = require("../services/common/jobQueue");
const notificationService_1 = require("../services/notifications/notificationService");
const Notification_1 = require("../models/Notification");
const notificationHelper_1 = require("../utils/notificationHelper");
const likableModels = {
    post: Post_1.default,
    comment: Comment_1.default,
};
const addLikeCountJob = (targetType, targetId, increment) => {
    (0, jobQueue_1.addJobToQueue)("updateLikeCounts", {
        targetId,
        targetModelName: targetType === "post" ? "Post" : "Comment",
        update: { $inc: { likes_count: increment } },
    });
};
// --- [ 1. WRITE OPERATIONS ] ---
exports.toggleLike = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { targetType, targetId } = req.params;
    const userId = req.userId;
    const Model = likableModels[targetType];
    if (!Model)
        throw new appError_1.AppError(400, "Invalid target type.");
    const target = await Model.findOne({
        _id: targetId,
        is_deleted: false,
        status: "approved",
    }).select("likes_count userId postId");
    if (!target)
        throw new appError_1.AppError(404, `${targetType} không tồn tại.`);
    const existingLike = await Like_1.default.findOne({
        userId: new mongoose_1.Types.ObjectId(userId),
        targetId: new mongoose_1.Types.ObjectId(targetId),
        targetType,
    });
    const isLiked = !existingLike;
    // --- LOGIC BẢO VỆ GIÁ TRỊ ÂM ---
    let increment = isLiked ? 1 : -1;
    // Nếu hành động là Unlike nhưng số like hiện tại đã là 0 hoặc âm, set increment = 0
    if (!isLiked && (target.likes_count || 0) <= 0) {
        increment = 0;
    }
    if (existingLike) {
        await existingLike.deleteOne();
    }
    else {
        await Like_1.default.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            targetId: new mongoose_1.Types.ObjectId(targetId),
            targetType,
        });
    }
    if (isLiked &&
        target.userId &&
        target.userId.toString() !== userId.toString()) {
        const entityId = targetType === "post" ? target._id : target.postId;
        (0, notificationService_1.createNotification)({
            recipientId: target.userId,
            senderId: userId,
            type: Notification_1.NotificationType.NEW_LIKE,
            entityId: entityId,
            entityType: "post",
            content: (0, notificationHelper_1.generateNotificationContent)(Notification_1.NotificationType.NEW_LIKE, {
                targetType: targetType,
            }),
        }).catch((err) => console.error("Notification Error:", err));
    }
    // Chỉ đẩy Job vào Queue nếu có sự thay đổi (increment != 0)
    if (increment !== 0) {
        addLikeCountJob(targetType, targetId, increment);
    }
    res.json({
        message: isLiked ? "Liked successfully." : "Unliked successfully.",
        isLiked,
        // Trả về giá trị đã được bảo vệ tối thiểu là 0
        likeCount: Math.max(0, (target.likes_count || 0) + increment),
    });
});
// --- [ 2. READ OPERATIONS ] ---
exports.getLikeStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { targetType, targetId } = req.query;
    const userId = req.userId;
    const Model = likableModels[targetType];
    if (!Model)
        throw new appError_1.AppError(400, "Invalid target type.");
    const target = await Model.findById(targetId).select("likes_count");
    if (!target)
        throw new appError_1.AppError(404, "Target not found.");
    let isLiked = false;
    if (userId && mongoose_1.Types.ObjectId.isValid(userId)) {
        isLiked = !!(await Like_1.default.exists({
            userId: new mongoose_1.Types.ObjectId(userId),
            targetId: new mongoose_1.Types.ObjectId(targetId),
            targetType,
        }));
    }
    res.json({ isLiked, likes_count: target.likes_count || 0 });
});
//# sourceMappingURL=likeController.js.map