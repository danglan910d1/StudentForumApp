"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreComment = exports.deleteComment = exports.updateComment = exports.createComment = exports.getAllCommentsForAdmin = exports.getComments = void 0;
const mongoose_1 = require("mongoose");
const Comment_1 = __importDefault(require("../models/Comment"));
const asyncHandler_1 = require("../utils/asyncHandler");
const pagination_1 = require("../utils/pagination");
const commentPipeline_1 = require("../services/comments/commentPipeline");
const commentFilter_1 = require("../services/comments/commentFilter");
const jobQueue_1 = require("../services/common/jobQueue");
const appError_1 = require("../utils/appError");
const Post_1 = __importDefault(require("../models/Post"));
const Notification_1 = require("../models/Notification");
const notificationService_1 = require("../services/notifications/notificationService");
const notificationHelper_1 = require("../utils/notificationHelper");
/** * helper: Thêm Job đếm Comments/Replies vào Queue để xử lý bất đồng bộ
 */
const addCountJob = (targetType, targetId, increment) => {
    const jobName = targetType === "Post"
        ? "updatePostCommentCount"
        : "updateCommentReplyCount";
    (0, jobQueue_1.addJobToQueue)(jobName, {
        targetId,
        targetModelName: targetType,
        update: {
            $inc: {
                [targetType === "Post" ? "comments_count" : "replies_count"]: increment,
            },
        },
    });
};
// --- [ 1. READ OPERATIONS ] ---
/** * GET /api/comments (Public)
 * Lấy comment theo bài viết (thường dùng postId trong query)
 */
exports.getComments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const query = req.query;
    // 1. Build Filter & Pipeline
    const filter = (0, commentFilter_1.buildCommentFilter)(query, {
        userId: undefined,
        isAdmin: false,
    });
    const pipeline = (0, commentPipeline_1.buildCommentAggregationPipeline)(filter, {
        includeUser: true,
        includeProjection: true,
        isAdminView: false,
        currentUserId: req.userId,
    });
    // 2. Phân trang và phản hồi
    const result = await (0, pagination_1.paginateAggregation)(Comment_1.default, pipeline, query.page, query.limit);
    res.json({
        comments: result.items,
        pagination: {
            totalItems: result.totalItems,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            limit: result.limit,
        },
    });
});
/** * GET /api/comments/admin (Admin Only) */
exports.getAllCommentsForAdmin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const query = req.query;
    const filter = (0, commentFilter_1.buildCommentFilter)(query, {
        userId: req.userId,
        isAdmin: true,
    });
    const pipeline = (0, commentPipeline_1.buildCommentAggregationPipeline)(filter, {
        includeUser: true,
        includePost: true,
        includeParent: true,
        includeProjection: true,
        isAdminView: true,
        currentUserId: req.userId,
    });
    const result = await (0, pagination_1.paginateAggregation)(Comment_1.default, pipeline, query.page, query.limit);
    res.json({
        comments: result.items,
        pagination: {
            totalItems: result.totalItems,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            limit: result.limit,
        },
    });
});
// --- [ 2. WRITE OPERATIONS ] ---
/**
 * POST /api/comments (User)
 * Cập nhật: Đảm bảo dữ liệu trả về là dữ liệu mới nhất thông qua Lean và Aggregate chuẩn.
 */
exports.createComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { postId, parentId, content } = req.body;
    if (!postId || !content?.trim())
        throw new appError_1.AppError(400, "Post ID and content are required.");
    const userId = req.userId;
    // 1. Lưu DB - Sử dụng lean() hoặc save() để đảm bảo object được tạo
    const newCommentDoc = new Comment_1.default({
        userId: new mongoose_1.Types.ObjectId(userId),
        postId: new mongoose_1.Types.ObjectId(postId),
        parentId: parentId ? new mongoose_1.Types.ObjectId(parentId) : null,
        content: content.trim(),
        status: "approved",
    });
    await newCommentDoc.save();
    if (parentId) {
        await Comment_1.default.findByIdAndUpdate(parentId, {
            $inc: { replies_count: 1 },
        });
    }
    else {
        await Post_1.default.findByIdAndUpdate(postId, {
            $inc: { comments_count: 1 },
        });
    }
    // 3. XỬ LÝ LẤY DỮ LIỆU MỚI NHẤT
    // Dùng aggregate với chính ID vừa tạo để trả về đúng format pipeline FE yêu cầu
    const commentArray = await Comment_1.default.aggregate((0, commentPipeline_1.buildCommentAggregationPipeline)({ _id: newCommentDoc._id }, { includeUser: true, includeProjection: true }));
    if (!commentArray || commentArray.length === 0) {
        throw new appError_1.AppError(500, "Lỗi khi truy xuất bình luận vừa tạo.");
    }
    // 4. Gửi thông báo (Giữ nguyên logic của bạn)
    const post = await Post_1.default.findById(postId).select("userId");
    if (post) {
        let recipientId = post.userId;
        let type = Notification_1.NotificationType.NEW_COMMENT;
        if (parentId) {
            const parentComment = await Comment_1.default.findById(parentId).select("userId");
            if (parentComment) {
                recipientId = parentComment.userId;
                type = Notification_1.NotificationType.NEW_REPLY;
            }
        }
        await (0, notificationService_1.createNotification)({
            recipientId: recipientId,
            senderId: userId,
            type,
            entityId: post._id,
            entityType: "post",
            content: (0, notificationHelper_1.generateNotificationContent)(type, {}),
        });
    }
    res.status(201).json(commentArray[0]);
});
/**
 * PUT /api/comments/:commentId (Author/Admin)
 * Cập nhật: Thêm logic cập nhật nội dung và trả về dữ liệu chuẩn Pipeline.
 */
exports.updateComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!content?.trim())
        throw new appError_1.AppError(400, "Nội dung không được để trống.");
    const comment = await Comment_1.default.findById(commentId);
    if (!comment || comment.is_deleted)
        throw new appError_1.AppError(404, "Không tìm thấy bình luận.");
    // Kiểm tra quyền sở hữu
    if (comment.userId.toString() !== req.userId && req.userRole !== "admin") {
        throw new appError_1.AppError(403, "Bạn không có quyền sửa bình luận này.");
    }
    // Thực hiện Update
    await Comment_1.default.updateOne({ _id: commentId }, { $set: { content: content.trim(), updatedAt: new Date() } });
    // Lấy lại dữ liệu sau khi update thông qua Pipeline để đồng bộ Format với GET
    const commentArray = await Comment_1.default.aggregate((0, commentPipeline_1.buildCommentAggregationPipeline)({ _id: new mongoose_1.Types.ObjectId(commentId) }, { includeUser: true, includeProjection: true }));
    res.json(commentArray[0]);
});
// --- [ 3. DELETE & RESTORE ] ---
/** * DELETE /api/comments/:commentId (Author/Admin) */
exports.deleteComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { commentId } = req.params;
    const comment = await Comment_1.default.findById(commentId);
    if (!comment || comment.is_deleted)
        throw new appError_1.AppError(404, "Comment not found.");
    if (comment.userId.toString() !== req.userId && req.userRole !== "admin") {
        throw new appError_1.AppError(403, "Permission denied.");
    }
    // Soft delete
    await Comment_1.default.updateOne({ _id: commentId }, { $set: { is_deleted: true } });
    // Giảm count ngầm
    if (comment.parentId) {
        // Cập nhật trực tiếp cho Comment cha thay vì dùng Job
        await Comment_1.default.findByIdAndUpdate(comment.parentId, {
            $inc: { replies_count: -1 },
        });
    }
    else {
        // Cập nhật trực tiếp cho Post
        await Post_1.default.findByIdAndUpdate(comment.postId, {
            $inc: { comments_count: -1 },
        });
    }
    res.json({ message: "Comment deleted successfully." });
});
/** * PUT /api/comments/admin/restore/:commentId (Admin Only) */
exports.restoreComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { commentId } = req.params;
    const comment = await Comment_1.default.findOneAndUpdate({ _id: commentId, is_deleted: true }, { $set: { is_deleted: false } }, { new: true });
    if (!comment)
        throw new appError_1.AppError(404, "Comment not found in trash.");
    // Tăng lại count
    comment.parentId
        ? addCountJob("Comment", comment.parentId.toString(), 1)
        : addCountJob("Post", comment.postId.toString(), 1);
    res.json({ message: "Comment restored successfully." });
});
//# sourceMappingURL=commentController.js.map