"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCommentAggregationPipeline = void 0;
/**
 * Xây dựng Aggregation Pipeline cho Comment Model.
 * Hỗ trợ hiển thị content và tự động lookup danh sách replies.
 */
const buildCommentAggregationPipeline = (filter, config = {}) => {
    const { includeUser = true, includePost = false, includeParent = false, includeProjection = true, isAdminView = false, currentUserId, } = config;
    const { Types } = require("mongoose");
    const currentUserIdObj = currentUserId
        ? new Types.ObjectId(currentUserId)
        : null;
    const pipeline = [{ $match: filter }];
    // 1. $lookup User chính (Người viết comment cha)
    if (includeUser) {
        pipeline.push({
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                pipeline: [{ $match: { is_deleted: { $ne: true } } }],
                as: "userData",
            },
        }, { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } });
    }
    // 2. $lookup REPLIES (Lấy các comment con lồng vào bên trong)
    // pipeline.push({
    //   $lookup: {
    //     from: "comments",
    //     let: { parent_id: "$_id" },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: { $eq: ["$parentId", "$$parent_id"] },
    //           is_deleted: { $ne: true }, // Chỉ lấy reply chưa xóa (trừ khi là admin)
    //         },
    //       },
    //       // Lookup User cho từng reply con
    //       {
    //         $lookup: {
    //           from: "users",
    //           localField: "userId",
    //           foreignField: "_id",
    //           as: "replyUser",
    //         },
    //       },
    //       { $unwind: { path: "$replyUser", preserveNullAndEmptyArrays: true } },
    //       { $sort: { createdAt: 1 } }, // Phản hồi cũ hiện trước
    //     ],
    //     as: "repliesData",
    //   },
    // });
    // 3. $lookup Post & Parent (Giữ nguyên logic cũ của bạn)
    if (includePost) {
        pipeline.push({
            $lookup: {
                from: "posts",
                localField: "postId",
                foreignField: "_id",
                as: "post",
            },
        });
    }
    if (includeParent) {
        pipeline.push({
            $lookup: {
                from: "comments",
                localField: "parentId",
                foreignField: "_id",
                as: "parent",
            },
        });
    }
    // 3.5 Lookup Likes
    if (currentUserIdObj) {
        pipeline.push({
            $lookup: {
                from: "likes",
                let: { cId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$targetId", "$$cId"] },
                                    { $eq: ["$targetType", "comment"] },
                                    { $eq: ["$userId", currentUserIdObj] },
                                ],
                            },
                        },
                    },
                ],
                as: "currentUserLike",
            },
        });
    }
    // 4. Projection cuối cùng
    if (includeProjection) {
        pipeline.push({
            $project: {
                _id: 0,
                commentId: "$_id",
                likes_count: 1,
                replies_count: 1,
                createdAt: 1,
                updatedAt: 1,
                parentId: 1,
                status: { $cond: [isAdminView, "$status", "$$REMOVE"] },
                is_liked_by_current_user: currentUserIdObj
                    ? { $gt: [{ $size: { $ifNull: ["$currentUserLike", []] } }, 0] }
                    : { $literal: false },
                // Hiển thị nội dung thực tế hoặc thông báo xóa
                content: {
                    $cond: [
                        {
                            $and: [
                                { $eq: ["$is_deleted", true] },
                                { $ne: [isAdminView, true] },
                            ],
                        },
                        "Bình luận này đã bị xóa.",
                        "$content",
                    ],
                },
                // Format User cha
                user: includeUser
                    ? {
                        userId: "$userData._id",
                        name: "$userData.name",
                        avatar: "$userData.avatar",
                        email: { $cond: [isAdminView, "$userData.email", "$$REMOVE"] },
                    }
                    : "$userId",
                // Map lại mảng replies lồng bên trong
                // replies: {
                //   $map: {
                //     input: "$repliesData",
                //     as: "r",
                //     in: {
                //       commentId: "$$r._id",
                //       content: "$$r.content",
                //       createdAt: "$$r.createdAt",
                //       likes_count: "$$r.likes_count",
                //       user: {
                //         userId: "$$r.replyUser._id",
                //         name: "$$r.replyUser.name",
                //         avatar: "$$r.replyUser.avatar",
                //       },
                //     },
                //   },
                // },
                postId: includePost ? { $arrayElemAt: ["$post", 0] } : "$postId",
            },
        });
    }
    return pipeline;
};
exports.buildCommentAggregationPipeline = buildCommentAggregationPipeline;
//# sourceMappingURL=commentPipeline.js.map