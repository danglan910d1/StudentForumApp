import { PipelineStage, Types } from "mongoose";
import { NotificationType } from "../../models/Notification";

interface PostPipelineConfig {
  includeUser?: boolean;
  includeTopic?: boolean;
  includeTags?: boolean;
  includeProjection?: boolean;
  isAdminView?: boolean;
  currentUserId?: string;
}

export const buildPostAggregationPipeline = (
  filter: any,
  config: PostPipelineConfig = {}
): PipelineStage[] => {
  const {
    includeUser = true,
    includeTopic = true,
    includeTags = true,
    includeProjection = true,
    isAdminView = false,
    currentUserId,
  } = config;

  const pipeline: PipelineStage[] = [{ $match: filter }];

  // Chuyển currentUserId sang ObjectId để so sánh trong Pipeline
  const currentUserIdObj = currentUserId
    ? new Types.ObjectId(currentUserId)
    : null;

  // Biến dùng chung để check quyền xem thông tin nhạy cảm (Admin hoặc Tác giả)
  const canSeeSensitive = [
    { $eq: [isAdminView, true] }, // Điều kiện 1: Là Admin
    {
      $and: [
        { $gt: [currentUserIdObj, null] }, // Có đăng nhập
        { $eq: ["$userId", currentUserIdObj] }, // Và là chủ bài viết
      ],
    },
  ];

  // 1. Lookup User
  if (includeUser) {
    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [{ $match: { is_deleted: { $ne: true } } }],
          as: "userData",
        },
      },
      { $unwind: "$userData" }
    );
  }

  // 2. Lookup Topic
  if (includeTopic) {
    pipeline.push({
      $lookup: {
        from: "topics",
        let: { tId: "$topicId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$tId"] },
                  { $ne: ["$is_deleted", true] },
                ],
              },
            },
          },
        ],
        as: "topicData",
      },
    });
  }

  // 3. Lookup Tags (Gộp cả Approved và Pending)
  // ... các phần Lookup User và Topic giữ nguyên ...

  // 3. Lookup Tags
  if (includeTags) {
    pipeline.push(
      {
        $lookup: {
          from: "tags",
          localField: "tags",
          foreignField: "_id",
          as: "approvedTagsFetched",
        },
      },
      {
        $lookup: {
          from: "tags",
          localField: "pending_tags",
          foreignField: "_id",
          as: "pendingTagsFetched",
        },
      }
    );
  }

  pipeline.push({
    $lookup: {
      from: "notifications",
      let: { pId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$entityId", "$$pId"] },
                {
                  $in: [
                    "$type",
                    [
                      NotificationType.POST_APPROVED,
                      NotificationType.POST_REJECTED,
                      NotificationType.POST_SUBMITTED, // THÊM: Admin thấy vết khi user gửi bài
                    ],
                  ],
                },
              ],
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 1 },
      ],
      as: "moderationNotice",
    },
  });

  // 4. Lookup Likes for current user
  if (currentUserIdObj) {
    pipeline.push({
      $lookup: {
        from: "likes",
        let: { pId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$targetId", "$$pId"] },
                  { $eq: ["$targetType", "post"] },
                  { $eq: ["$userId", currentUserIdObj] }
                ]
              }
            }
          }
        ],
        as: "currentUserLike"
      }
    });
  }

  // 5. Projection
  if (includeProjection) {
    pipeline.push({
      $project: {
        _id: 0,
        postId: "$_id",
        title: 1,
        slug: 1,
        content: 1,
        views_count: 1,
        likes_count: 1,
        comments_count: 1,
        is_sticky: 1,
        is_resolved: 1,
        createdAt: 1,
        updatedAt: 1,
        status: 1,
        is_liked_by_current_user: currentUserIdObj 
          ? { $gt: [{ $size: { $ifNull: ["$currentUserLike", []] } }, 0] } 
          : { $literal: false },

        user: includeUser
          ? {
              userId: "$userData._id",
              name: "$userData.name",
              avatar: "$userData.avatar",
              role: "$userData.role",
              // SỬA: Chỉ hiện email nếu là Admin HOẶC là chính mình
              email: {
                $cond: [
                  { $or: canSeeSensitive },
                  "$userData.email",
                  "$$REMOVE",
                ],
              },
            }
          : "$userId",

        topic: includeTopic
          ? {
              $let: {
                vars: { t: { $arrayElemAt: ["$topicData", 0] } },
                in: {
                  $cond: [
                    { $ifNull: ["$$t", false] },
                    { topicId: "$$t._id", name: "$$t.name", slug: "$$t.slug" },
                    null,
                  ],
                },
              },
            }
          : "$topicId",

        // FIX: Chỉ hiện các tag đã được phê duyệt cho người dùng cuối
        tags: includeTags
          ? {
              $map: {
                input: {
                  $filter: {
                    input: "$approvedTagsFetched",
                    as: "t",
                    cond: { $ne: ["$$t.is_deleted", true] },
                  },
                },
                as: "tag",
                in: {
                  tagId: "$$tag._id",
                  name: "$$tag.name",
                  slug: "$$tag.slug",
                  status: "$$tag.status",
                },
              },
            }
          : "$tags",

        // FIX: Chỉ Admin hoặc Logic tác giả mới thấy tags đang chờ duyệt
        pending_tags: includeTags
          ? {
              $cond: [
                { $or: canSeeSensitive },
                {
                  $map: {
                    input: {
                      $filter: {
                        input: "$pendingTagsFetched",
                        as: "pt",
                        cond: { $ne: ["$$pt.is_deleted", true] },
                      },
                    },
                    as: "pTag",
                    in: {
                      tagId: "$$pTag._id",
                      name: "$$pTag.name",
                      slug: "$$pTag.slug",
                      status: "$$pTag.status",
                    },
                  },
                },
                "$$REMOVE",
              ],
            }
          : "$pending_tags",

        moderationNote: {
          $let: {
            vars: { notice: { $arrayElemAt: ["$moderationNotice", 0] } },
            in: {
              $cond: [{ $or: canSeeSensitive }, "$$notice.content", "$$REMOVE"],
            },
          },
        },
      },
    });
  }

  return pipeline;
};
