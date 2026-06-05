"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPostFilter = void 0;
// src/services/postService.ts
const mongoose_1 = require("mongoose");
const buildCommonFilter_1 = require("../common/buildCommonFilter");
const Topic_1 = __importDefault(require("../../models/Topic"));
const Tag_1 = __importDefault(require("../../models/Tag"));
/**
 * Xây dựng đối tượng filter MongoDB đặc thù cho Post.
 * Nó gọi hàm chung để xử lý Status và Search, sau đó thêm lọc đặc thù.
 */
const buildPostFilter = async (queryParams, authContext) => {
    // 1. Lấy khung filter chung (status, search, myPosts, is_deleted)
    const filter = (0, buildCommonFilter_1.buildCommonFilter)(queryParams, authContext, "post");
    // 2. Thêm logic đặc thù (Destructuring lấy các trường riêng của Post)
    const { topicId, tagId, is_resolved, topicSlug, tagSlug, userId } = queryParams;
    // Lọc theo Topic (Ưu tiên ID, sau đó đến Slug)
    if (topicId && mongoose_1.Types.ObjectId.isValid(topicId)) {
        filter.topicId = new mongoose_1.Types.ObjectId(topicId);
    }
    else if (topicSlug) {
        // Tìm ID từ Slug trước khi filter
        const topic = await Topic_1.default.findOne({ slug: topicSlug }).select("_id");
        filter.topicId = topic ? topic._id : new mongoose_1.Types.ObjectId();
    }
    // Lọc theo Tag (Trong mảng tags)
    if (tagId && mongoose_1.Types.ObjectId.isValid(tagId)) {
        filter.tags = new mongoose_1.Types.ObjectId(tagId);
    }
    else if (tagSlug) {
        // Tìm ID của Tag từ Slug
        const tag = await Tag_1.default.findOne({ slug: tagSlug }).select("_id");
        filter.tags = tag ? tag._id : new mongoose_1.Types.ObjectId();
    }
    if (is_resolved === "true" || is_resolved === true) {
        filter.is_resolved = true;
    }
    // Nếu có userId trong query (User A xem User B) và không phải chế độ myPosts
    if (userId && mongoose_1.Types.ObjectId.isValid(userId)) {
        filter.userId = new mongoose_1.Types.ObjectId(userId);
        // Khi xem người khác, bắt buộc chỉ xem bài approved (tránh hacker mò ID)
        if (!authContext.isAdmin &&
            filter.userId.toString() !== authContext.userId) {
            filter.status = "approved";
        }
    }
    return filter;
};
exports.buildPostFilter = buildPostFilter;
//# sourceMappingURL=postFilter.js.map