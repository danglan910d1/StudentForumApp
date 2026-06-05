"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminApprovePost = void 0;
const mongoose_1 = require("mongoose");
const Post_1 = __importDefault(require("../../models/Post"));
const Tag_1 = __importDefault(require("../../models/Tag"));
const auditLog = async (adminId, postId, tagId, action) => {
    console.log(`[AUDIT LOG] Admin ${adminId} executed "${action}" on Tag ${tagId} for Post ${postId}`);
};
const adminApprovePost = async (postId, adminId, pendingTagActions, newPostStatus, keepTagIds) => {
    const session = await (0, mongoose_1.startSession)();
    session.startTransaction();
    try {
        const post = await Post_1.default.findById(postId).session(session);
        if (!post)
            throw new Error("Post not found.");
        if (!post.topicId)
            throw new Error("Post does not have a valid Topic ID.");
        // 1. Lấy thông tin các Tag đang nằm trong danh sách chờ (pending_tags)
        const tagsToProcess = await Tag_1.default.find({
            _id: { $in: post.pending_tags },
        }).session(session);
        const tagsMap = new Map(tagsToProcess.map((t) => [t._id.toString(), t]));
        // Mảng chứa ID những tag được phép xuất hiện trong bài viết (nếu bài được duyệt)
        const validTagIdsToAdd = [];
        // Map chứa các thay đổi về trạng thái Tag trong Database Global
        const tagsToUpdateModel = new Map();
        // 2. Duyệt từng hành động Admin gửi lên
        for (const actionItem of pendingTagActions) {
            const { tagId, action } = actionItem;
            const tag = tagsMap.get(tagId);
            if (!tag)
                continue; // Bỏ qua nếu tag không tồn tại trong danh sách pending của post
            await auditLog(adminId, postId, tagId, action);
            // KIỂM TRA 1: Quyết định gắn vào bài viết
            // Chỉ 2 hành động này mới cho phép Tag xuất hiện trong bài
            const isApprovedForPost = [
                "approve_and_add_topic",
                "approve_and_mark_free",
            ].includes(action);
            if (isApprovedForPost) {
                validTagIdsToAdd.push(tag._id);
            }
            // KIỂM TRA 2: Quyết định sinh tồn của Tag trong hệ thống (Global)
            if (action.startsWith("approve")) {
                const updateData = { status: "approved" };
                if (action.includes("topic")) {
                    // Gắn Tag vào Topic cụ thể của bài viết
                    updateData.topicId = new mongoose_1.Types.ObjectId(post.topicId.toString());
                }
                else if (action.includes("global") || action.includes("mark_free")) {
                    // Biến Tag thành Global
                    updateData.topicId = null;
                }
                tagsToUpdateModel.set(tagId, updateData);
            }
            else if (action === "reject_tag") {
                // Chuyển trạng thái Tag thành Rejected để không xuất hiện trong các bài sau
                tagsToUpdateModel.set(tagId, { status: "rejected" });
            }
        }
        // 3. Thực hiện cập nhật các Tag Model đồng loạt (Làm giàu/Dọn dẹp Database Tag)
        const tagUpdatePromises = Array.from(tagsToUpdateModel.entries()).map(([id, updates]) => Tag_1.default.updateOne({ _id: id }, { $set: updates }).session(session));
        await Promise.all(tagUpdatePromises);
        // 4. Cập nhật Model bài viết
        // Việc hiển thị Tag phụ thuộc vào newPostStatus (Trùm cuối)
        if (newPostStatus === "approved") {
            // Chỉ khi bài được duyệt, ta mới trộn tags cũ (keep) và tags pending được duyệt
            const currentTags = keepTagIds
                ? keepTagIds
                : post.tags.map((id) => id.toString());
            const newTagsToAdd = validTagIdsToAdd.map((id) => id.toString());
            const finalTagsSet = new Set([...currentTags, ...newTagsToAdd]);
            post.tags = Array.from(finalTagsSet).map((id) => new mongoose_1.Types.ObjectId(id));
        }
        else {
            /**
             * Nếu bài bị REJECTED:
             * Không nạp thêm tag pending vào bài (vô nghĩa vì bài bị ẩn).
             * Ta giữ nguyên hoặc cập nhật mảng tags theo keepTagIds để user sửa bài sau này.
             */
            const currentTags = keepTagIds
                ? keepTagIds
                : post.tags.map((id) => id.toString());
            post.tags = currentTags.map((id) => new mongoose_1.Types.ObjectId(id));
        }
        post.pending_tags = []; // Làm sạch danh sách chờ sau khi đã xử lý xong
        post.status = newPostStatus;
        post.updatedAt = new Date();
        await post.save({ session });
        await session.commitTransaction();
        return post;
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.adminApprovePost = adminApprovePost;
//# sourceMappingURL=adminApprovePost.js.map