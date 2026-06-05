/**
 * CONTROLLER: postController
 * Trách nhiệm: Xử lý Business Logic cho Bài viết (CRUD, Kiểm duyệt, Tương tác).
 * Nguyên tắc: Pipeline-driven, Unified Error Handling, RBAC, Data Integrity.
 */
import { Request, Response } from "express";
import { Types } from "mongoose";
import Post from "../models/Post";
import Topic from "../models/Topic";
import { AuthenticatedRequest } from "../types/express";
import {
  PostParams,
  CreatePostBody,
  UpdatePostBody,
  AdminApprovePostBody,
  ToggleStickyBody,
} from "../types/post";
import { asyncHandler } from "../utils/asyncHandler";
import { paginateAggregation } from "../utils/pagination";
import { processTags } from "../services/tags/tagLayer";
import { generateUniqueSlugForPost } from "../utils/text";
import { buildPostFilter } from "../services/posts/postFilter";
import { adminApprovePost } from "../services/posts/adminApprovePost";
import { buildPostAggregationPipeline } from "../services/posts/postPipeline";
import redisClient, {
  getCache,
  setCache,
  incrementPostView,
  invalidateCache,
  saveIdempotencyResult,
} from "../services/common/redis";
import { AppError } from "../utils/appError";
import { createNotification } from "../services/notifications/notificationService";
import { NotificationType } from "../models/Notification";
import { generateNotificationContent } from "../utils/notificationHelper";

const clearPostsCache = async () => {
  await invalidateCache("posts:list:*");
};

// --- [ 1. READ OPERATIONS ] ---

/** * GET /api/posts
 * Lấy danh sách bài viết (Public/Admin)
 */
export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as any;

  // LOGIC QUAN TRỌNG:
  // 1. Lấy role thực từ token (đã qua middleware auth/optionalAuth)
  const actualRole = (req as any).userRole;

  // 2. Chỉ coi là isAdmin (để hiện bài pending/deleted) nếu:
  //    - Role thực sự là admin
  //    - VÀ Client chủ động yêu cầu xem bằng adminView=true
  const isAdmin =
    actualRole === "admin" &&
    (query.adminView === "true" || query.adminView === true);

  const userId = (req as any).userId;

  const identity = {
    topic: query.topicSlug ?? null,
    tag: query.tagSlug ?? null,
  };

  // 1. Check Cache (Cache key sẽ phân tách rõ 'admin' và 'public')
  const cacheKey = `posts:list:${isAdmin ? "admin" : "public"}:${JSON.stringify(
    query
  )}`;
  const cachedData = await getCache(cacheKey);
  if (cachedData) return res.json(cachedData);

  // 2. Xây dựng Filter & Pipeline
  // Biến isAdmin ở đây quyết định buildPostFilter có lấy bài "pending" hay không
  const filter = await buildPostFilter(query, { userId, isAdmin });

  const pipeline = buildPostAggregationPipeline(filter, {
    includeUser: true,
    includeTopic: true,
    includeTags: true,
    isAdminView: isAdmin, // isAdminView ở đây quyết định có project (hiển thị) status, email... hay không
    currentUserId: userId,
  });

  // 3. Sắp xếp & Phân trang (Giữ nguyên logic của bạn)
  const sortStage: any = { is_sticky: -1 };
  if (query.sortBy === "popular") sortStage.views_count = -1;
  sortStage.createdAt = -1;

  pipeline.push({ $sort: sortStage });

  const result = await paginateAggregation(
    Post,
    pipeline,
    query.page,
    query.limit
  );

  const posts = result.items;

  // 4. Cộng dồn view từ Redis (Giữ nguyên logic của bạn)
  if (posts.length > 0) {
    const redisKeys = posts.map((p: any) => `views:${p.postId}`);
    const pendingViews = await redisClient.mGet(redisKeys);
    posts.forEach((post: any, index: number) => {
      const extraView = pendingViews[index];
      if (extraView) post.views_count += parseInt(extraView, 10);
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
  await setCache(cacheKey, response, isAdmin ? 10 : 30);

  res.json(response);
});

/**
 * GET /api/posts/:id
 * Lấy chi tiết bài viết: Dành cho khách vãng lai và Tác giả xem bài của mình.
 */
export const getPostById = asyncHandler(
  async (req: Request<PostParams>, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).userId; // Từ optionalAuth
    const userRole = (req as any).userRole;

    if (!Types.ObjectId.isValid(id))
      throw new AppError(400, "ID bài viết không hợp lệ.");

    // 1. Xây dựng Filter
    const filter: any = {
      _id: new Types.ObjectId(id),
      is_deleted: { $ne: true },
    };

    /**
     * Tác giả xem được bài của chính mình bất kể status.
     * Khách chỉ xem được bài 'approved'.
     */
    if (userId) {
      filter.$or = [
        { status: "approved" },
        { userId: new Types.ObjectId(userId) },
      ];
    } else {
      filter.status = "approved";
    }

    // 2. Aggregation Pipeline
    const postArray = await Post.aggregate(
      buildPostAggregationPipeline(filter, {
        includeUser: true,
        includeTopic: true,
        includeTags: true,
        includeProjection: true,
        isAdminView: userRole === "admin",
        currentUserId: userId,
      })
    );

    const post = postArray[0];
    if (!post)
      throw new AppError(
        404,
        "Không tìm thấy bài viết hoặc bạn không có quyền xem."
      );

    // 3. Cộng dồn view từ Redis (Real-time)
    const pendingViews = await redisClient.get(`views:${id}`);
    if (pendingViews) {
      post.views_count += parseInt(pendingViews, 10);
    }

    // 4. Logic Tăng View (Chống spam chính mình & Admin)
    const isAuthor =
      userId && post.user?.userId?.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isAuthor && !isAdmin) {
      await incrementPostView(id);
    }

    res.json(post);
  }
);

/** * GET /api/posts/admin/:id
 * Admin lấy chi tiết bài viết (Bất kể trạng thái)
 */
export const getPostByIdForAdmin = asyncHandler(
  async (req: AuthenticatedRequest<PostParams>, res: Response) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id))
      throw new AppError(400, "Invalid Post ID.");

    const postArray = await Post.aggregate(
      buildPostAggregationPipeline(
        { _id: new Types.ObjectId(id) },
        {
          includeUser: true,
          includeTopic: true,
          includeTags: true,
          includeProjection: true,
          isAdminView: true,
        }
      )
    );

    if (!postArray[0]) throw new AppError(404, "Post not found.");
    res.json(postArray[0]);
  }
);

// --- [ 2. WRITE OPERATIONS ] ---

/** * POST /api/posts
 * Tạo bài viết mới (User)
 */
export const createPost = asyncHandler(
  async (req: AuthenticatedRequest<{}, {}, CreatePostBody>, res: Response) => {
    const { topicId, tags, title, content } = req.body;
    const userId = req.userId!;
    const requestId = req.headers["x-request-id"] as string;

    // 1. Kiểm tra Topic hợp lệ
    const topic = await Topic.findOne({ _id: topicId, status: "approved" });
    if (!topic) throw new AppError(404, "Invalid or unapproved Topic.");

    // 2. Xử lý Tags và tạo Slug
    const { validTagIds, pendingTagIds } = await processTags(
      tags || [],
      userId,
      topic._id as Types.ObjectId
    );

    const uniqueSlug = await generateUniqueSlugForPost(title);
    console.log(">>> [STEP 1] Slug generated:", uniqueSlug); // LOG 1
    // 3. Lưu Database
    const newPost = await Post.create({
      userId: new Types.ObjectId(userId),
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
    const postArray = await Post.aggregate(
      buildPostAggregationPipeline(
        { _id: newPost._id },
        {
          includeUser: true,
          includeTopic: true,
          includeTags: true,
          isAdminView: false,
          currentUserId: userId,
        }
      )
    );
    console.log(">>> [STEP 3] Aggregation result Slug:", postArray[0]?.slug); // LOG 3
    const result = postArray[0];
    // IDEMPOTENCY: Lưu kết quả
    if (requestId)
      await saveIdempotencyResult(requestId, 201, JSON.stringify(result));
    res.status(201).json(result);
  }
);

/** * PUT /api/posts/:id
 * Cập nhật bài viết (Tác giả/Admin)
 */
export const updatePost = asyncHandler(
  async (
    req: AuthenticatedRequest<PostParams, {}, UpdatePostBody>,
    res: Response
  ) => {
    const { id } = req.params;
    const { topicId, tags, title, content, status } = req.body;
    const isAdmin = req.userRole === "admin";
    const requestId = req.headers["x-request-id"] as string;

    // 1. Kiểm tra tồn tại và quyền sở hữu
    const post = await Post.findOne({ _id: id, is_deleted: { $ne: true } });
    if (!post) throw new AppError(404, "Post not found.");
    if (post.userId.toString() !== req.userId && !isAdmin)
      throw new AppError(403, "Access denied.");

    // 2. Chuẩn bị các trường cập nhật
    const updateFields: any = {};
    if (topicId) {
      updateFields.topicId = topicId;
    }

    if (title) {
      updateFields.title = title;
      updateFields.slug = await generateUniqueSlugForPost(title);
    }

    if (content) updateFields.content = content;
    if (isAdmin && status) updateFields.status = status;

    if (typeof req.body.is_resolved !== "undefined") {
      updateFields.is_resolved = req.body.is_resolved;
    }
    // 3. Xử lý logic Tags mới
    if (tags) {
      const { validTagIds, pendingTagIds } = await processTags(
        tags,
        req.userId!,
        (topicId as any) || post.topicId
      );
      updateFields.tags = validTagIds;
      updateFields.pending_tags = pendingTagIds;
    }

    // 4. Update & Trả kết quả
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    // Xóa cache
    await clearPostsCache();
    const postArray = await Post.aggregate(
      buildPostAggregationPipeline(
        { _id: updatedPost!._id },
        {
          includeUser: true,
          includeTopic: true,
          includeTags: true,
          isAdminView: isAdmin,
          currentUserId: req.userId,
        }
      )
    );
    const result = postArray[0];

    // IDEMPOTENCY: Lưu kết quả
    if (requestId)
      await saveIdempotencyResult(requestId, 201, JSON.stringify(result));

    res.json(result);
  }
);

// --- [ 3. ADMIN OPERATIONS ] ---

/** * POST /api/posts/admin/approve/:id
 * Admin duyệt bài và Tag đề xuất
 */
export const adminApprovePostController = asyncHandler(
  async (
    req: AuthenticatedRequest<PostParams, {}, AdminApprovePostBody>,
    res: Response
  ) => {
    const { id } = req.params;
    const { pendingTagActions, newPostStatus, keepTagIds, reason } = req.body;
    const requestId = req.headers["x-request-id"] as string;

    // 1. Gọi Service xử lý logic nghiệp vụ (Tags, Status, DB Transaction)
    const updatedPost = await adminApprovePost(
      id,
      req.userId!,
      pendingTagActions,
      newPostStatus,
      keepTagIds
    );

    // Xóa cache sau khi dữ liệu thay đổi
    await clearPostsCache();

    // 2. GỬI THÔNG BÁO (Kết nối với logic Moderation Trace)
    const isApproved = newPostStatus === "approved";
    const notiType = isApproved
      ? NotificationType.POST_APPROVED
      : NotificationType.POST_REJECTED;

    // Gọi hàm Helper để gộp reason vào content một cách chuẩn mực
    const notificationContent = generateNotificationContent(notiType, {
      title: updatedPost.title,
      reason: reason,
    });

    await createNotification({
      recipientId: updatedPost.userId,
      senderId: req.userId,
      type: notiType,
      entityId: updatedPost.id,
      entityType: "post",
      content: notificationContent,
    });

    // 3. TRẢ VỀ DỮ LIỆU (Dùng Pipeline để FE nhận được format chuẩn có moderationNote)
    const postArray = await Post.aggregate(
      buildPostAggregationPipeline(
        { _id: updatedPost._id },
        {
          includeUser: true,
          includeTopic: true,
          includeTags: true,
          isAdminView: true, // Admin sẽ thấy được moderationNote vừa tạo qua pipeline
          currentUserId: req.userId, // Để pipeline check logic canSeeSensitive
        }
      )
    );

    const result = postArray[0];

    if (!result) {
      throw new AppError(500, "Lỗi khi truy xuất dữ liệu sau khi duyệt.");
    }

    // 4. IDEMPOTENCY: Lưu kết quả để tránh submit trùng lặp
    if (requestId) {
      await saveIdempotencyResult(requestId, 200, JSON.stringify(result));
    }

    res.json(result);
  }
);

/** * PUT /api/posts/admin/sticky/:id
 * Admin ghim/bỏ ghim bài viết
 */
export const togglePostStickyController = asyncHandler(
  async (
    req: AuthenticatedRequest<PostParams, {}, ToggleStickyBody>,
    res: Response
  ) => {
    const { id } = req.params;
    const { is_sticky } = req.body;
    const requestId = req.headers["x-request-id"] as string;

    const resultUpdate = await Post.updateOne(
      { _id: id },
      { $set: { is_sticky } }
    );
    if (resultUpdate.matchedCount === 0)
      throw new AppError(404, "Post not found.");

    await clearPostsCache();
    const postArray = await Post.aggregate(
      buildPostAggregationPipeline(
        { _id: new Types.ObjectId(id) },
        {
          includeUser: true,
          includeTopic: true,
          includeTags: true,
          isAdminView: true,
          currentUserId: req.userId,
        }
      )
    );
    const result = postArray[0];

    // IDEMPOTENCY: Lưu kết quả
    if (requestId)
      await saveIdempotencyResult(requestId, 200, JSON.stringify(result));

    res.json(result);
  }
);

// --- [ 4. DELETE & RESTORE ] ---

/** * DELETE /api/posts/:id
 * Xóa mềm bài viết (Tác giả/Admin)
 */
export const deletePost = asyncHandler(
  async (req: AuthenticatedRequest<PostParams>, res: Response) => {
    const { id } = req.params;
    const requestId = req.headers["x-request-id"] as string;
    const post = await Post.findById(id);
    if (!post || post.is_deleted) throw new AppError(404, "Post not found.");
    if (post.userId.toString() !== req.userId && req.userRole !== "admin")
      throw new AppError(403, "Access denied.");

    // Xóa mềm và giải phóng slug cũ
    await Post.findByIdAndUpdate(id, {
      is_deleted: true,
      slug: `${post.slug}-deleted-${Date.now()}`,
    });

    await clearPostsCache();
    const result = { message: "Post moved to trash." };
    if (requestId)
      await saveIdempotencyResult(requestId, 200, JSON.stringify(result));

    res.json(result);
  }
);

/** * PUT /api/posts/admin/restore/:id
 * Admin khôi phục bài viết
 */
export const restorePost = asyncHandler(
  async (req: AuthenticatedRequest<PostParams>, res: Response) => {
    const { id } = req.params;
    const requestId = req.headers["x-request-id"] as string;
    const post = await Post.findById(id);
    if (!post) throw new AppError(404, "Post not found.");

    // Khi restore, phải tính lại slug vì slug cũ có thể đã bị chiếm dụng
    const newSlug = await generateUniqueSlugForPost(post.title);

    await Post.findByIdAndUpdate(id, {
      is_deleted: false,
      slug: newSlug,
    });

    await clearPostsCache();
    const result = { message: "Post restored successfully.", postId: id };

    if (requestId)
      await saveIdempotencyResult(requestId, 200, JSON.stringify(result));

    res.json(result);
  }
);
