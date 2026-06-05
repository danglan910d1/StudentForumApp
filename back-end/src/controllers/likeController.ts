/**
 * CONTROLLER: likeController
 * Trách nhiệm: Xử lý Thích/Bỏ thích cho Post và Comment.
 * Đã sửa lỗi: Bổ sung userId/postId vào select để không crash khi gửi thông báo.
 */
import { Response, Request } from "express";
import { Types, Model, Document } from "mongoose";
import Like, { TargetType } from "../models/Like";
import Post from "../models/Post";
import Comment from "../models/Comment";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { ToggleLikeParams, GetLikeStatusQuery } from "../types/like";
import { addJobToQueue } from "../services/common/jobQueue";
import { createNotification } from "../services/notifications/notificationService";
import { NotificationType } from "../models/Notification";
import { generateNotificationContent } from "../utils/notificationHelper";

type LikableDocument = Document & {
  userId: Types.ObjectId;
  status: string;
  is_deleted: boolean;
  likes_count: number;
  postId?: Types.ObjectId;
};

const likableModels: Record<TargetType, Model<LikableDocument>> = {
  post: Post as unknown as Model<LikableDocument>,
  comment: Comment as unknown as Model<LikableDocument>,
};

const addLikeCountJob = (
  targetType: TargetType,
  targetId: string,
  increment: 1 | -1
) => {
  addJobToQueue("updateLikeCounts", {
    targetId,
    targetModelName: targetType === "post" ? "Post" : "Comment",
    update: { $inc: { likes_count: increment } },
  });
};

// --- [ 1. WRITE OPERATIONS ] ---

export const toggleLike = asyncHandler(
  async (req: AuthenticatedRequest<ToggleLikeParams>, res: Response) => {
    const { targetType, targetId } = req.params;
    const userId = req.userId!;

    const Model = likableModels[targetType as TargetType];
    if (!Model) throw new AppError(400, "Invalid target type.");

    const target = await Model.findOne({
      _id: targetId,
      is_deleted: false,
      status: "approved",
    }).select("likes_count userId postId");

    if (!target) throw new AppError(404, `${targetType} không tồn tại.`);

    const existingLike = await Like.findOne({
      userId: new Types.ObjectId(userId),
      targetId: new Types.ObjectId(targetId),
      targetType,
    });

    const isLiked = !existingLike;

    // --- LOGIC BẢO VỆ GIÁ TRỊ ÂM ---
    let increment: 1 | -1 | 0 = isLiked ? 1 : -1;

    // Nếu hành động là Unlike nhưng số like hiện tại đã là 0 hoặc âm, set increment = 0
    if (!isLiked && (target.likes_count || 0) <= 0) {
      increment = 0;
    }

    if (existingLike) {
      await existingLike.deleteOne();
    } else {
      await Like.create({
        userId: new Types.ObjectId(userId),
        targetId: new Types.ObjectId(targetId),
        targetType,
      });
    }

    if (
      isLiked &&
      target.userId &&
      target.userId.toString() !== userId.toString()
    ) {
      const entityId =
        targetType === "post" ? target._id : (target as any).postId;
      createNotification({
        recipientId: target.userId,
        senderId: userId,
        type: NotificationType.NEW_LIKE,
        entityId: entityId,
        entityType: "post",
        content: generateNotificationContent(NotificationType.NEW_LIKE, {
          targetType: targetType as "post" | "comment",
        }),
      }).catch((err) => console.error("Notification Error:", err));
    }

    // Chỉ đẩy Job vào Queue nếu có sự thay đổi (increment != 0)
    if (increment !== 0) {
      addLikeCountJob(targetType as TargetType, targetId, increment);
    }

    res.json({
      message: isLiked ? "Liked successfully." : "Unliked successfully.",
      isLiked,
      // Trả về giá trị đã được bảo vệ tối thiểu là 0
      likeCount: Math.max(0, (target.likes_count || 0) + increment),
    });
  }
);
// --- [ 2. READ OPERATIONS ] ---

export const getLikeStatus = asyncHandler(
  async (req: Request<{}, {}, {}, GetLikeStatusQuery>, res: Response) => {
    const { targetType, targetId } = req.query;
    const userId = (req as any).userId;

    const Model = likableModels[targetType as TargetType];
    if (!Model) throw new AppError(400, "Invalid target type.");

    const target = await Model.findById(targetId).select("likes_count");
    if (!target) throw new AppError(404, "Target not found.");

    let isLiked = false;
    if (userId && Types.ObjectId.isValid(userId as string)) {
      isLiked = !!(await Like.exists({
        userId: new Types.ObjectId(userId),
        targetId: new Types.ObjectId(targetId as string),
        targetType,
      }));
    }

    res.json({ isLiked, likes_count: target.likes_count || 0 });
  }
);
