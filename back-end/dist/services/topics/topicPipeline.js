"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTopicAggregationPipeline = void 0;
const buildTopicAggregationPipeline = (filter, config = {}) => {
    const { includeUser = true, includeProjection = true, isAdminView = false, } = config;
    const pipeline = [{ $match: filter }];
    if (includeUser && isAdminView) {
        pipeline.push({
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                pipeline: [{ $match: { is_deleted: { $ne: true } } }],
                as: "userData",
            },
        });
    }
    // 2. Lookup để đếm số lượng POSTS thuộc Topic này
    pipeline.push({
        $lookup: {
            from: "posts",
            let: { topicId: "$_id" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    $eq: [{ $toString: "$topicId" }, { $toString: "$$topicId" }],
                                },
                                { $ne: ["$is_deleted", true] },
                                // Nếu không phải Admin, chỉ đếm các bài đã được duyệt
                                ...(isAdminView ? [] : [{ $eq: ["$status", "approved"] }]),
                            ],
                        },
                    },
                },
            ],
            as: "postsInTopic",
        },
    });
    // 3. Lookup để đếm số lượng TAGS thuộc Topic này
    pipeline.push({
        $lookup: {
            from: "tags",
            let: { topicId: "$_id" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$topic", "$$topicId"] }, // Lưu ý: field trong Tag model là 'topic'
                                { $ne: ["$is_deleted", true] },
                                ...(isAdminView ? [] : [{ $eq: ["$status", "approved"] }]),
                            ],
                        },
                    },
                },
            ],
            as: "tagsInTopic",
        },
    });
    // 4. Thêm các trường đếm (Count Fields)
    pipeline.push({
        $addFields: {
            postCount: { $size: "$postsInTopic" },
            tagCount: { $size: "$tagsInTopic" },
        },
    });
    if (includeProjection) {
        pipeline.push({
            $project: {
                _id: 0,
                topicId: "$_id",
                name: 1,
                slug: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                status: { $cond: [isAdminView, "$status", "$$REMOVE"] },
                is_deleted: { $cond: [isAdminView, "$is_deleted", "$$REMOVE"] },
                _count: {
                    posts: "$postCount",
                    tags: "$tagCount",
                },
                // Nếu là AdminView: Trả về object chi tiết
                // Nếu là Public: Biến mất hoàn toàn (không lộ ID Admin)
                user: isAdminView && includeUser
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
                                        email: "$$user.email", // Admin thấy luôn email
                                    },
                                    null,
                                ],
                            },
                        },
                    }
                    : "$$REMOVE", // Public thì không thấy field 'user' này luôn
            },
        });
    }
    return pipeline;
};
exports.buildTopicAggregationPipeline = buildTopicAggregationPipeline;
//# sourceMappingURL=topicPipeline.js.map