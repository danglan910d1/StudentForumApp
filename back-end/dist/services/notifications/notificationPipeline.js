"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildNotificationAggregationPipeline = void 0;
const buildNotificationAggregationPipeline = (filter, config = {}) => {
    const { includeSender = true } = config;
    const pipeline = [
        { $match: filter },
        { $sort: { createdAt: -1 } },
    ];
    if (includeSender) {
        pipeline.push({
            $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "senderData",
            },
        });
    }
    // --- BƯỚC THÊM MỚI: Lấy Slug từ bảng posts ---
    pipeline.push({
        $lookup: {
            from: "posts",
            localField: "entityId", // ID của bài viết (hoặc ID comment nếu bạn cấu trúc khác)
            foreignField: "_id",
            as: "postData",
        },
    }, {
        $addFields: {
            // Lấy slug từ phần tử đầu tiên của mảng postData trả về
            targetSlug: { $arrayElemAt: ["$postData.slug", 0] },
        },
    });
    // Giai đoạn then chốt: Giữ nguyên cấu trúc cũ và thêm targetSlug
    pipeline.push({
        $project: {
            _id: 0,
            notificationId: "$_id",
            recipientId: 1,
            type: 1,
            targetId: "$entityId",
            targetType: "$entityType",
            targetSlug: 1, // <--- THÊM TRƯỜNG NÀY VÀO ĐÂY
            content: 1,
            is_read: 1,
            createdAt: 1,
            sender: includeSender
                ? {
                    $let: {
                        vars: { s: { $arrayElemAt: ["$senderData", 0] } },
                        in: {
                            $cond: [
                                { $ifNull: ["$$s", false] },
                                {
                                    userId: "$$s._id",
                                    name: "$$s.name",
                                    avatar: "$$s.avatar",
                                },
                                null,
                            ],
                        },
                    },
                }
                : "$$REMOVE",
        },
    });
    return pipeline;
};
exports.buildNotificationAggregationPipeline = buildNotificationAggregationPipeline;
//# sourceMappingURL=notificationPipeline.js.map