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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restorePost = exports.deletePost = exports.togglePostStickyController = exports.adminApprovePostController = exports.updatePost = exports.createPost = exports.getPostByIdForAdmin = exports.getPostById = exports.getPosts = void 0;
const mongoose_1 = require("mongoose");
const Post_1 = __importDefault(require("../models/Post"));
const Topic_1 = __importDefault(require("../models/Topic"));
const asyncHandler_1 = require("../utils/asyncHandler");
const pagination_1 = require("../utils/pagination");
const tagLayer_1 = require("../services/tags/tagLayer");
const text_1 = require("../utils/text");
const postFilter_1 = require("../services/posts/postFilter");
const adminApprovePost_1 = require("../services/posts/adminApprovePost");
const postPipeline_1 = require("../services/posts/postPipeline");
const redis_1 = __importStar(require("../services/common/redis"));
const appError_1 = require("../utils/appError");
const notificationService_1 = require("../services/notifications/notificationService");
const Notification_1 = require("../models/Notification");
const notificationHelper_1 = require("../utils/notificationHelper");
const clearPostsCache = async () => {
    await (0, redis_1.invalidateCache)("posts:list:*");
};
// --- [ 1. READ OPERATIONS ] ---
/** * GET /api/posts
 * Lấy danh sách bài viết (Public/Admin)
 */
exports.getPosts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const query = req.query;
    // LOGIC QUAN TRỌNG:
    // 1. Lấy role thực từ token (đã qua middleware auth/optionalAuth)
    const actualRole = req.userRole;
    // 2. Chỉ coi là isAdmin (để hiện bài pending/deleted) nếu:
    //    - Role thực sự là admin
    //    - VÀ Client chủ động yêu cầu xem bằng adminView=true
    const isAdmin = actualRole === "admin" &&
        (query.adminView === "true" || query.adminView === true);
    const userId = req.userId;
    const identity = {
        topic: query.topicSlug ?? null,
        tag: query.tagSlug ?? null,
    };
    // 1. Check Cache (Cache key sẽ phân tách rõ 'admin' và 'public')
    const cacheKey = `posts:list:${isAdmin ? "admin" : "public"}:${JSON.stringify(query)}`;
    const cachedData = await (0, redis_1.getCache)(cacheKey);
    if (cachedData)
        return res.json(cachedData);
    // 2. Xây dựng Filter & Pipeline
    // Biến isAdmin ở đây quyết định buildPostFilter có lấy bài "pending" hay không
    const filter = await (0, postFilter_1.buildPostFilter)(query, { userId, isAdmin });
    const pipeline = (0, postPipeline_1.buildPostAggregationPipeline)(filter, {
        includeUser: true,
        includeTopic: true,
        includeTags: true,
        isAdminView: isAdmin, // isAdminView ở đây quyết định có project (hiển thị) status, email... hay không
        currentUserId: userId,
    });
    // 3. Sắp xếp & Phân trang (Giữ nguyên logic của bạn)
    const sortStage = { is_sticky: -1 };
    if (query.sortBy === "popular")
        sortStage.views_count = -1;
    sortStage.createdAt = -1;
    pipeline.push({ $sort: sortStage });
    const result = await (0, pagination_1.paginateAggregation)(Post_1.default, pipeline, query.page, query.limit);
    const posts = result.items;
    // 4. Cộng dồn view từ Redis (Giữ nguyên logic của bạn)
    if (posts.length > 0) {
        const redisKeys = posts.map((p) => `views:${p.postId}`);
        const pendingViews = await redis_1.default.mGet(redisKeys);
        posts.forEach((post, index) => {
            const extraView = pendingViews[index];
            if (extraView)
                post.views_count += parseInt(extraView, 10);
        });
    }
    const response = {
        identity,
        posts,
        pagination: {
            totalItems: result.totalItems,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            limit: result.limit,
        },
    };
    // 5. Set cache (Giữ nguyên logic của bạn)
    await (0, redis_1.setCache)(cacheKey, response, isAdmin ? 10 : 30);
    res.json(response);
});
/**
 * GET /api/posts/:id
 * Lấy chi tiết bài viết: Dành cho khách vãng lai và Tác giả xem bài của mình.
 */
exports.getPostById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId; // Từ optionalAuth
    const userRole = req.userRole;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw new appError_1.AppError(400, "ID bài viết không hợp lệ.");
    // 1. Xây dựng Filter
    const filter = {
        _id: new mongoose_1.Types.ObjectId(id),
        is_deleted: { $ne: true },
    };
    /**
     * Tác giả xem được bài của chính mình bất kể status.
     * Khách chỉ xem được bài 'approved'.
     */
    if (userId) {
        filter.$or = [
            { status: "approved" },
            { userId: new mongoose_1.Types.ObjectId(userId) },
        ];
    }
    else {
        filter.status = "approved";
    }
    // 2. Aggregation Pipeline
    const postArray = await Post_1.default.aggregate((0, postPipeline_1.buildPostAggregationPipeline)(filter, {
        includeUser: true,
        includeTopic: true,
        includeTags: true,
        includeProjection: true,
        isAdminView: userRole === "admin",
        currentUserId: userId,
    }));
    const post = postArray[0];
    if (!post)
        throw new appError_1.AppError(404, "Không tìm thấy bài viết hoặc bạn không có quyền xem.");
    // 3. Cộng dồn view từ Redis (Real-time)
    const pendingViews = await redis_1.default.get(`views:${id}`);
    if (pendingViews) {
        post.views_count += parseInt(pendingViews, 10);
    }
    // 4. Logic Tăng View (Chống spam chính mình & Admin)
    const isAuthor = userId && post.user?.userId?.toString() === userId.toString();
    const isAdmin = userRole === "admin";
    if (!isAuthor && !isAdmin) {
        await (0, redis_1.incrementPostView)(id);
    }
    res.json(post);
});
/** * GET /api/posts/admin/:id
 * Admin lấy chi tiết bài viết (Bất kể trạng thái)
 */
exports.getPostByIdForAdmin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw new appError_1.AppError(400, "Invalid Post ID.");
    const postArray = await Post_1.default.aggregate((0, postPipeline_1.buildPostAggregationPipeline)({ _id: new mongoose_1.Types.ObjectId(id) }, {
        includeUser: true,
        includeTopic: true,
        includeTags: true,
        includeProjection: true,
        isAdminView: true,
    }));
    if (!postArray[0])
        throw new appError_1.AppError(404, "Post not found.");
    res.json(postArray[0]);
});
// --- [ 2. WRITE OPERATIONS ] ---
/** * POST /api/posts
 * Tạo bài viết mới (User)
 */
exports.createPost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { topicId, tags, title, content } = req.body;
    const userId = req.userId;
    const requestId = req.headers["x-request-id"];
    // 1. Kiểm tra Topic hợp lệ
    const topic = await Topic_1.default.findOne({ _id: topicId, status: "approved" });
    if (!topic)
        throw new appError_1.AppError(404, "Invalid or unapproved Topic.");
    // 2. Xử lý Tags và tạo Slug
    const { validTagIds, pendingTagIds } = await (0, tagLayer_1.processTags)(tags || [], userId, topic._id);
    const uniqueSlug = await (0, text_1.generateUniqueSlugForPost)(title);
    console.log(">>> [STEP 1] Slug generated:", uniqueSlug); // LOG 1
    // 3. Lưu Database
    const newPost = await Post_1.default.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        topicId: topic._id,
        tags: validTagIds,
        pending_tags: pendingTagIds,
        title,
        slug: uniqueSlug,
        content,
        status: "pending",
    });
    console.log(">>> [STEP 2] Post created in DB with Slug:", newPost.slug); // LOG 2
    await clearPostsCache();
    // 4. Trả về format chuẩn qua Pipeline
    const postArray = await Post_1.default.aggregate((0, postPipeline_1.buildPostAggregationPipeline)({ _id: newPost._id }, {
        includeUser: true,
        includeTopic: true,
        includeTags: true,
        isAdminView: false,
        currentUserId: userId,
    }));
    console.log(">>> [STEP 3] Aggregation result Slug:", postArray[0]?.slug); // LOG 3
    const result = postArray[0];
    // IDEMPOTENCY: Lưu kết quả
    if (requestId)
        await (0, redis_1.saveIdempotencyResult)(requestId, 201, JSON.stringify(result));
    res.status(201).json(result);
});
/** * PUT /api/posts/:id
 * Cập nhật bài viết (Tác giả/Admin)
 */
exports.updatePost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { topicId, tags, title, content, status } = req.body;
    const isAdmin = req.userRole === "admin";
    const requestId = req.headers["x-request-id"];
    // 1. Kiểm tra tồn tại và quyền sở hữu
    const post = await Post_1.default.findOne({ _id: id, is_deleted: { $ne: true } });
    if (!post)
        throw new appError_1.AppError(404, "Post not found.");
    if (post.userId.toString() !== req.userId && !isAdmin)
        throw new appError_1.AppError(403, "Access denied.");
    // 2. Chuẩn bị các trường cập nhật
    const updateFields = {};
    if (topicId) {
        updateFields.topicId = topicId;
    }
    if (title) {
        updateFields.title = title;
        updateFields.slug = await (0, text_1.generateUniqueSlugForPost)(title);
    }
    if (content)
        updateFields.content = content;
    if (isAdmin && status)
        updateFields.status = status;
    if (typeof req.body.is_resolved !== "undefined") {
        updateFields.is_resolved = req.body.is_resolved;
    }
    // 3. Xử lý logic Tags mới
    if (tags) {
        const { validTagIds, pendingTagIds } = await (0, tagLayer_1.processTags)(tags, req.userId, topicId || post.topicId);
        updateFields.tags = validTagIds;
        updateFields.pending_tags = pendingTagIds;
    }
    // 4. Update & Trả kết quả
    const updatedPost = await Post_1.default.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    // Xóa cache
    await clearPostsCache();
    const postArray = await Post_1.default.aggregate((0, postPipeline_1.buildPostAggregationPipeline)({ _id: updatedPost._id }, {
        includeUser: true,
        includeTopic: true,
        includeTags: true,
        isAdminView: isAdmin,
        currentUserId: req.userId,
    }));
    const result = postArray[0];
    // IDEMPOTENCY: Lưu kết quả
    if (requestId)
        await (0, redis_1.saveIdempotencyResult)(requestId, 201, JSON.stringify(result));
    res.json(result);
});
// --- [ 3. ADMIN OPERATIONS ] ---
/** * POST /api/posts/admin/approve/:id
 * Admin duyệt bài và Tag đề xuất
 */
exports.adminApprovePostController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { pendingTagActions, newPostStatus, keepTagIds, reason } = req.body;
    const requestId = req.headers["x-request-id"];
    // 1. Gọi Service xử lý logic nghiệp vụ (Tags, Status, DB Transaction)
    const updatedPost = await (0, adminApprovePost_1.adminApprovePost)(id, req.userId, pendingTagActions, newPostStatus, keepTagIds);
    // Xóa cache sau khi dữ liệu thay đổi
    await clearPostsCache();
    // 2. GỬI THÔNG BÁO (Kết nối với logic Moderation Trace)
    const isApproved = newPostStatus === "approved";
    const notiType = isApproved
        ? Notification_1.NotificationType.POST_APPROVED
        : Notification_1.NotificationType.POST_REJECTED;
    // Gọi hàm Helper để gộp reason vào content một cách chuẩn mực
    const notificationContent = (0, notificationHelper_1.generateNotificationContent)(notiType, {
        title: updatedPost.title,
        reason: reason,
    });
    await (0, notificationService_1.createNotification)({
        recipientId: updatedPost.userId,
        senderId: req.userId,
        type: notiType,
        entityId: updatedPost.id,
        entityType: "post",
        content: notificationContent,
    });
    // 3. TRẢ VỀ DỮ LIỆU (Dùng Pipeline để FE nhận được format chuẩn có moderationNote)
    const postArray = await Post_1.default.aggregate((0, postPipeline_1.buildPostAggregationPipeline)({ _id: updatedPost._id }, {
        includeUser: true,
        includeTopic: true,
        includeTags: true,
        isAdminView: true, // Admin sẽ thấy được moderationNote vừa tạo qua pipeline
        currentUserId: req.userId, // Để pipeline check logic canSeeSensitive
    }));
    const result = postArray[0];
    if (!result) {
        throw new appError_1.AppError(500, "Lỗi khi truy xuất dữ liệu sau khi duyệt.");
    }
    // 4. IDEMPOTENCY: Lưu kết quả để tránh submit trùng lặp
    if (requestId) {
        await (0, redis_1.saveIdempotencyResult)(requestId, 200, JSON.stringify(result));
    }
    res.json(result);
});
/** * PUT /api/posts/admin/sticky/:id
 * Admin ghim/bỏ ghim bài viết
 */
exports.togglePostStickyController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { is_sticky } = req.body;
    const requestId = req.headers["x-request-id"];
    const resultUpdate = await Post_1.default.updateOne({ _id: id }, { $set: { is_sticky } });
    if (resultUpdate.matchedCount === 0)
        throw new appError_1.AppError(404, "Post not found.");
    await clearPostsCache();
    const postArray = await Post_1.default.aggregate((0, postPipeline_1.buildPostAggregationPipeline)({ _id: new mongoose_1.Types.ObjectId(id) }, {
        includeUser: true,
        includeTopic: true,
        includeTags: true,
        isAdminView: true,
        currentUserId: req.userId,
    }));
    const result = postArray[0];
    // IDEMPOTENCY: Lưu kết quả
    if (requestId)
        await (0, redis_1.saveIdempotencyResult)(requestId, 200, JSON.stringify(result));
    res.json(result);
});
// --- [ 4. DELETE & RESTORE ] ---
/** * DELETE /api/posts/:id
 * Xóa mềm bài viết (Tác giả/Admin)
 */
exports.deletePost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const requestId = req.headers["x-request-id"];
    const post = await Post_1.default.findById(id);
    if (!post || post.is_deleted)
        throw new appError_1.AppError(404, "Post not found.");
    if (post.userId.toString() !== req.userId && req.userRole !== "admin")
        throw new appError_1.AppError(403, "Access denied.");
    // Xóa mềm và giải phóng slug cũ
    await Post_1.default.findByIdAndUpdate(id, {
        is_deleted: true,
        slug: `${post.slug}-deleted-${Date.now()}`,
    });
    await clearPostsCache();
    const result = { message: "Post moved to trash." };
    if (requestId)
        await (0, redis_1.saveIdempotencyResult)(requestId, 200, JSON.stringify(result));
    res.json(result);
});
/** * PUT /api/posts/admin/restore/:id
 * Admin khôi phục bài viết
 */
exports.restorePost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const requestId = req.headers["x-request-id"];
    const post = await Post_1.default.findById(id);
    if (!post)
        throw new appError_1.AppError(404, "Post not found.");
    // Khi restore, phải tính lại slug vì slug cũ có thể đã bị chiếm dụng
    const newSlug = await (0, text_1.generateUniqueSlugForPost)(post.title);
    await Post_1.default.findByIdAndUpdate(id, {
        is_deleted: false,
        slug: newSlug,
    });
    await clearPostsCache();
    const result = { message: "Post restored successfully.", postId: id };
    if (requestId)
        await (0, redis_1.saveIdempotencyResult)(requestId, 200, JSON.stringify(result));
    res.json(result);
});
//# sourceMappingURL=postController.js.map