import { PipelineStage } from "mongoose";

interface UserPipelineConfig {
  includeStats?: boolean;
  includeProjection?: boolean;
  isAdminView?: boolean;
}

export const buildUserAggregationPipeline = (
  filter: any,
  config: UserPipelineConfig = {}
): PipelineStage[] => {
  const {
    includeStats = false,
    includeProjection = true,
    isAdminView = false,
  } = config;

  const pipeline: PipelineStage[] = [{ $match: filter }];

  if (includeStats) {
    pipeline.push(
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          pipeline: [{ $match: { is_deleted: { $ne: true } } }],
          as: "rawPosts",
        },
      },
      {
        $addFields: {
          postStats: {
            published: {
              $size: {
                $filter: {
                  input: "$rawPosts",
                  as: "p",
                  cond: { $eq: ["$$p.status", "approved"] },
                },
              },
            },
            pending: {
              $size: {
                $filter: {
                  input: "$rawPosts",
                  as: "p",
                  cond: { $eq: ["$$p.status", "pending"] },
                },
              },
            },
          },
        },
      }
    );
  }

  if (includeProjection) {
    pipeline.push({
      $project: {
        _id: 0,
        userId: "$_id",
        name: 1,
        avatar: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1,

        email: { $cond: [isAdminView, "$email", "$$REMOVE"] },
        status: { $cond: [isAdminView, "$status", "$$REMOVE"] },

        postCount: includeStats
          ? {
              $cond: [
                isAdminView,
                {
                  total: {
                    $add: ["$postStats.published", "$postStats.pending"],
                  },
                  published: "$postStats.published",
                  pending: "$postStats.pending",
                },
                { published: "$postStats.published" },
              ],
            }
          : "$$REMOVE",
      },
    });
  }

  return pipeline;
};
