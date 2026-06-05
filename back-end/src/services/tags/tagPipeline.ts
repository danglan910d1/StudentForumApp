import { PipelineStage, Types } from "mongoose";

interface TagPipelineConfig {
  includeTopic?: boolean;
  includeUser?: boolean;
  includeProjection?: boolean;
  isAdminView?: boolean;
}

/**
 * Xây dựng các Aggregation Pipeline Stages cho Tag Model.
 * Hỗ trợ đồng nhất tagId, postCount và bảo mật thông tin theo View.
 */
export const buildTagAggregationPipeline = (
  filter: any,
  config: TagPipelineConfig = {},
): PipelineStage[] => {
  const {
    includeTopic = true,
    includeUser = true,
    includeProjection = true,
    isAdminView = false,
  } = config;

  // Giai đoạn 1: Lọc dữ liệu đầu vào (Đã bao gồm filter startDate/endDate từ buildTagFilter)
  const pipeline: PipelineStage[] = [{ $match: filter }];

  // Giai đoạn 2: Lookup Topic liên quan
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

  // Giai đoạn 3: Lookup User tạo thẻ (Chỉ Admin mới thấy hoặc theo config)
  if (includeUser) {
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "userData",
      },
    });
  }

  // Giai đoạn 4: Lookup đếm số lượng POSTS sử dụng Tag này
  pipeline.push({
    $lookup: {
      from: "posts",
      let: { tagId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                // Kiểm tra xem tagId có nằm trong mảng tags của Post không
                { $in: ["$$tagId", { $ifNull: ["$tags", []] }] },
                { $ne: ["$is_deleted", true] },
                // Nếu là Public view, chỉ đếm các bài viết đã được approved
                ...(isAdminView ? [] : [{ $eq: ["$status", "approved"] }]),
              ],
            },
          },
        },
        // Chỉ cần lấy field cần thiết để tối ưu bộ nhớ khi đếm
        { $project: { _id: 1 } },
      ],
      as: "postsUsingThisTag",
    },
  });

  // Giai đoạn 5: Thêm trường đếm postCount
  pipeline.push({
    $addFields: {
      postCount: { $size: "$postsUsingThisTag" },
    },
  });

  // Giai đoạn cuối: Projection - Định dạng dữ liệu đầu ra
  if (includeProjection) {
    pipeline.push({
      $project: {
        _id: 0,
        tagId: "$_id",
        name: 1,
        slug: 1,
        createdAt: 1,
        updatedAt: 1,
        postCount: 1,

        // Admin View mới thấy các trường nhạy cảm
        status: { $cond: [isAdminView, "$status", "$$REMOVE"] },
        is_deleted: { $cond: [isAdminView, "$is_deleted", "$$REMOVE"] },

        // Topic Object
        topic: includeTopic
          ? {
              $let: {
                vars: { top: { $arrayElemAt: ["$topicData", 0] } },
                in: {
                  $cond: [
                    { $ifNull: ["$$top", false] },
                    {
                      topicId: "$$top._id",
                      name: "$$top.name",
                      slug: "$$top.slug",
                    },
                    null,
                  ],
                },
              },
            }
          : "$$REMOVE",

        // User Object (Đồng nhất với Topic Pipeline của bạn)
        user:
          isAdminView && includeUser
            ? {
                $let: {
                  vars: { user: { $arrayElemAt: ["$userData", 0] } },
                  in: {
                    $cond: [
                      { $ifNull: ["$$user", false] },
                      {
                        userId: "$$user._id",
                        name: "$$user.name",
                        avatar: "$$user.avatar",
                        email: "$$user.email",
                      },
                      null,
                    ],
                  },
                },
              }
            : "$$REMOVE",
      },
    });
  }

  return pipeline;
};
