/**
 * CONTROLLER: commentController
 * Trách nhiệm: Xử lý Business Logic liên quan đến Bình luận.
 * Nguyên tắc: Pipeline-driven, Job-based Counter, Atomic Updates.
 */
import { Request, Response } from "express";
import { Types } from "mongoose";
import Comment from "../models/Comment";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../utils/asyncHandler";
import { paginateAggregation } from "../utils/pagination";
import { buildCommentAggregationPipeline } from "../services/comments/commentPipeline";
import { buildCommentFilter } from "../services/comments/commentFilter";
import { addJobToQueue } from "../services/common/jobQueue";
import {
  CommentParams,
  CreateCommentBody,
  GetCommentsQuery,
} from "../types/comment";
import { AppError } from "../utils/appError";
import Post from "../models/Post";
import { NotificationType } from "../models/Notification";
import { createNotification } from "../services/notifications/notificationService";
import { generateNotificationContent } from "../utils/notificationHelper";

/** * helper: Thêm Job đếm Comments/Replies vào Queue để xử lý bất đồng bộ
 */
const addCountJob = (
  targetType: "Post" | "Comment",
  targetId: string,
  increment: 1 | -1
) => {
  const jobName =
    targetType === "Post"
      ? "updatePostCommentCount"
      : "updateCommentReplyCount";
  addJobToQueue(jobName, {
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
export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as GetCommentsQuery;

  // 1. Build Filter & Pipeline
  const filter = buildCommentFilter(query, {
    userId: undefined,
    isAdmin: false,
  });
  const pipeline = buildCommentAggregationPipeline(filter, {
    includeUser: true,
    includeProjection: true,
    isAdminView: false,
    currentUserId: (req as any).userId,
  });

  // 2. Phân trang và phản hồi
  const result = await paginateAggregation(
    Comment,
    pipeline,
    query.page,
    query.limit
  );
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
export const getAllCommentsForAdmin = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query as GetCommentsQuery;

    const filter = buildCommentFilter(query, {
      userId: req.userId,
      isAdmin: true,
    });
    const pipeline = buildCommentAggregationPipeline(filter, {
      includeUser: true,
      includePost: true,
      includeParent: true,
      includeProjection: true,
      isAdminView: true,
      currentUserId: (req as any).userId,
    });

    const result = await paginateAggregation(
      Comment,
      pipeline,
      query.page,
      query.limit
    );
    res.json({
      comments: result.items,
      pagination: {
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: result.limit,
      },
    });
  }
);

// --- [ 2. WRITE OPERATIONS ] ---

/**
 * POST /api/comments (User)
 * Cập nhật: Đảm bảo dữ liệu trả về là dữ liệu mới nhất thông qua Lean và Aggregate chuẩn.
 */
export const createComment = asyncHandler(
  async (
    req: AuthenticatedRequest<{}, {}, CreateCommentBody>,
    res: Response
  ) => {
    const { postId, parentId, content } = req.body;
    if (!postId || !content?.trim())
      throw new AppError(400, "Post ID and content are required.");

    const userId = req.userId!;

    // 1. Lưu DB - Sử dụng lean() hoặc save() để đảm bảo object được tạo
    const newCommentDoc = new Comment({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
      parentId: parentId ? new Types.ObjectId(parentId) : null,
      content: content.trim(),
      status: "approved",
    });
    await newCommentDoc.save();

    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, {
        $inc: { replies_count: 1 },
      });
    } else {
      await Post.findByIdAndUpdate(postId, {
        $inc: { comments_count: 1 },
      });
    }

    // 3. XỬ LÝ LẤY DỮ LIỆU MỚI NHẤT
    // Dùng aggregate với chính ID vừa tạo để trả về đúng format pipeline FE yêu cầu
    const commentArray = await Comment.aggregate(
      buildCommentAggregationPipeline(
        { _id: newCommentDoc._id },
        { includeUser: true, includeProjection: true }
      )
    );

    if (!commentArray || commentArray.length === 0) {
      throw new AppError(500, "Lỗi khi truy xuất bình luận vừa tạo.");
    }

    // 4. Gửi thông báo (Giữ nguyên logic của bạn)
    const post = await Post.findById(postId).select("userId");
    if (post) {
      let recipientId = post.userId;
      let type = NotificationType.NEW_COMMENT;
      if (parentId) {
        const parentComment = await Comment.findById(parentId).select("userId");
        if (parentComment) {
          recipientId = parentComment.userId;
          type = NotificationType.NEW_REPLY;
        }
      }
      await createNotification({
        recipientId: recipientId as Types.ObjectId,
        senderId: userId,
        type,
        entityId: post._id as Types.ObjectId,
        entityType: "post",
        content: generateNotificationContent(type, {}),
      });
    }

    res.status(201).json(commentArray[0]);
  }
);

/**
 * PUT /api/comments/:commentId (Author/Admin)
 * Cập nhật: Thêm logic cập nhật nội dung và trả về dữ liệu chuẩn Pipeline.
 */
export const updateComment = asyncHandler(
  async (
    req: AuthenticatedRequest<CommentParams, {}, { content: string }>,
    res: Response
  ) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content?.trim())
      throw new AppError(400, "Nội dung không được để trống.");

    const comment = await Comment.findById(commentId);
    if (!comment || comment.is_deleted)
      throw new AppError(404, "Không tìm thấy bình luận.");

    // Kiểm tra quyền sở hữu
    if (comment.userId.toString() !== req.userId && req.userRole !== "admin") {
      throw new AppError(403, "Bạn không có quyền sửa bình luận này.");
    }

    // Thực hiện Update
    await Comment.updateOne(
      { _id: commentId },
      { $set: { content: content.trim(), updatedAt: new Date() } }
    );

    // Lấy lại dữ liệu sau khi update thông qua Pipeline để đồng bộ Format với GET
    const commentArray = await Comment.aggregate(
      buildCommentAggregationPipeline(
        { _id: new Types.ObjectId(commentId) },
        { includeUser: true, includeProjection: true }
      )
    );

    res.json(commentArray[0]);
  }
);

// --- [ 3. DELETE & RESTORE ] ---

/** * DELETE /api/comments/:commentId (Author/Admin) */
export const deleteComment = asyncHandler(
  async (req: AuthenticatedRequest<CommentParams>, res: Response) => {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment || comment.is_deleted)
      throw new AppError(404, "Comment not found.");

    if (comment.userId.toString() !== req.userId && req.userRole !== "admin") {
      throw new AppError(403, "Permission denied.");
    }

    // Soft delete
    await Comment.updateOne({ _id: commentId }, { $set: { is_deleted: true } });

    // Giảm count ngầm
    if (comment.parentId) {
      // Cập nhật trực tiếp cho Comment cha thay vì dùng Job
      await Comment.findByIdAndUpdate(comment.parentId, {
        $inc: { replies_count: -1 },
      });
    } else {
      // Cập nhật trực tiếp cho Post
      await Post.findByIdAndUpdate(comment.postId, {
        $inc: { comments_count: -1 },
      });
    }

    res.json({ message: "Comment deleted successfully." });
  }
);

/** * PUT /api/comments/admin/restore/:commentId (Admin Only) */
export const restoreComment = asyncHandler(
  async (req: AuthenticatedRequest<CommentParams>, res: Response) => {
    const { commentId } = req.params;

    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, is_deleted: true },
      { $set: { is_deleted: false } },
      { new: true }
    );

    if (!comment) throw new AppError(404, "Comment not found in trash.");

    // Tăng lại count
    comment.parentId
      ? addCountJob("Comment", comment.parentId.toString(), 1)
      : addCountJob("Post", comment.postId.toString(), 1);

    res.json({ message: "Comment restored successfully." });
  }
);
