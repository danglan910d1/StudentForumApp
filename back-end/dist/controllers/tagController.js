"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreTag = exports.deleteTag = exports.bulkUpdateTags = exports.updateTag = exports.createTagByAdmin = exports.getTagById = exports.getTagsList = void 0;
const mongoose_1 = require("mongoose");
const Tag_1 = __importDefault(require("../models/Tag"));
const Post_1 = __importDefault(require("../models/Post"));
const asyncHandler_1 = require("../utils/asyncHandler");
const pagination_1 = require("../utils/pagination");
const tagFilter_1 = require("../services/tags/tagFilter");
const tagPipeline_1 = require("../services/tags/tagPipeline");
const text_1 = require("../utils/text");
const appError_1 = require("../utils/appError");
// --- [ 1. READ OPERATIONS ] ---
/** * GET /api/tags (Public) HOẶC GET /api/tags/admin (Admin)
 * Lấy danh sách tags có phân trang và lọc
 */
exports.getTagsList = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const query = req.query;
    const isResourceAdminRoute = req.originalUrl.includes("/api/tags/admin");
    const userRole = req.userRole;
    const isAdmin = isResourceAdminRoute && userRole === "admin";
    const userId = "userId" in req ? req.userId : undefined;
    // 1. Xây dựng filter
    const filter = await (0, tagFilter_1.buildTagFilter)(query, { userId, isAdmin });
    // 2. Xây dựng pipeline
    const pipeline = (0, tagPipeline_1.buildTagAggregationPipeline)(filter, {
        includeTopic: true,
        includeUser: isAdmin,
        includeProjection: true,
        isAdminView: isAdmin,
    });
    // 3. LOGIC SẮP XẾP
    const sortStage = {};
    if (query.sort === "popular") {
        // Sắp xếp theo số lượng bài viết gắn tag này
        sortStage.postCount = -1;
    }
    else if (query.sort === "old") {
        sortStage.createdAt = 1;
    }
    else {
        sortStage.createdAt = -1;
    }
    pipeline.push({ $sort: sortStage });
    // 4. Thực hiện phân trang
    const result = await (0, pagination_1.paginateAggregation)(Tag_1.default, pipeline, query.page, query.limit);
    res.json({
        tags: result.items,
        pagination: {
            totalItems: result.totalItems,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            limit: result.limit,
        },
    });
});
/** * GET /api/tags/admin/:id
 * Admin lấy chi tiết 1 Tag
 */
exports.getTagById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw new appError_1.AppError(400, "Invalid Tag ID format.");
    const tagArray = await Tag_1.default.aggregate((0, tagPipeline_1.buildTagAggregationPipeline)({ _id: new mongoose_1.Types.ObjectId(id) }, {
        includeTopic: true,
        includeUser: true,
        includeProjection: true,
        isAdminView: true,
    }));
    if (!tagArray[0])
        throw new appError_1.AppError(404, "Tag not found.");
    res.json(tagArray[0]);
});
// --- [ 2. WRITE OPERATIONS ] ---
/** * POST /api/tags/admin
 * Admin tạo Tag chính thống
 */
exports.createTagByAdmin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, topicId, status } = req.body;
    if (!name || name.trim().length === 0)
        throw new appError_1.AppError(400, "Tag name is required.");
    const cleanName = name.trim();
    const slug = (0, text_1.generateSlug)(cleanName);
    // Tìm xem có cái nào trùng slug HOẶC trùng tên (không phân biệt hoa thường) mà chưa xóa không
    const existing = await Tag_1.default.findOne({
        is_deleted: { $ne: true },
        $or: [
            { slug: slug },
            { name: { $regex: new RegExp(`^${(0, text_1.escapeRegex)(cleanName)}$`, "i") } },
        ],
    });
    if (existing)
        throw new appError_1.AppError(400, "Tag with this name or slug already exists.");
    // 1. Tạo trực tiếp với trạng thái Approved
    const newTag = await Tag_1.default.create({
        name: name.trim(),
        slug,
        topicId: topicId ? new mongoose_1.Types.ObjectId(topicId) : null,
        createdBy: new mongoose_1.Types.ObjectId(req.userId),
        status: status || "approved",
    });
    // 2. Trả về format chuẩn
    const tagArray = await Tag_1.default.aggregate((0, tagPipeline_1.buildTagAggregationPipeline)({ _id: newTag._id }, { includeTopic: true, includeUser: true, isAdminView: true }));
    res.status(201).json(tagArray[0]);
});
/** * PUT /api/tags/admin/:id
 * Admin cập nhật Tag lẻ
 */
exports.updateTag = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, topicId, status } = req.body;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw new appError_1.AppError(400, "Invalid Tag ID.");
    const updateFields = {};
    if (name) {
        updateFields.name = name.trim();
        updateFields.slug = (0, text_1.generateSlug)(name.trim());
    }
    if (topicId !== undefined)
        updateFields.topicId = topicId ? new mongoose_1.Types.ObjectId(topicId) : null;
    if (status)
        updateFields.status = status;
    if (Object.keys(updateFields).length === 0)
        throw new appError_1.AppError(400, "No fields to update.");
    const updatedTag = await Tag_1.default.findOneAndUpdate({ _id: id, is_deleted: { $ne: true } }, { $set: updateFields }, { new: true });
    if (!updatedTag)
        throw new appError_1.AppError(404, "Tag not found or deleted.");
    const tagArray = await Tag_1.default.aggregate((0, tagPipeline_1.buildTagAggregationPipeline)({ _id: updatedTag._id }, { includeTopic: true, includeUser: true, isAdminView: true }));
    res.json(tagArray[0]);
});
/** * PATCH /api/tags/admin/bulk
 * Duyệt/Từ chối hàng loạt Tag
 */
exports.bulkUpdateTags = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { ids, status } = req.body;
    if (!ids?.length)
        throw new appError_1.AppError(400, "List of Tag IDs is required.");
    const result = await Tag_1.default.updateMany({ _id: { $in: ids.map((id) => new mongoose_1.Types.ObjectId(id)) } }, { $set: { status } });
    res.json({
        message: `Successfully updated ${result.modifiedCount} tags to ${status}.`,
    });
});
// --- [ 3. DELETE & RESTORE ] ---
/** * DELETE /api/tags/admin/:id
 * Xóa mềm Tag + Giải phóng liên đới trong Post
 */
exports.deleteTag = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const tag = await Tag_1.default.findById(id);
    if (!tag || tag.is_deleted)
        throw new appError_1.AppError(404, "Tag not found.");
    // 1. Xóa mềm Tag
    await Tag_1.default.findByIdAndUpdate(id, {
        is_deleted: true,
        slug: `${tag.slug}-deleted-${Date.now()}`,
    });
    // 2. Atomic Pull: Gỡ Tag này ra khỏi tất cả bài viết liên quan
    const tagObjectId = new mongoose_1.Types.ObjectId(id);
    await Post_1.default.updateMany({ $or: [{ tags: tagObjectId }, { pending_tags: tagObjectId }] }, { $pull: { tags: tagObjectId, pending_tags: tagObjectId } });
    res.json({ message: "Tag moved to trash and removed from related posts." });
});
/** * PUT /api/tags/admin/restore/:id
 * Khôi phục Tag
 */
exports.restoreTag = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await Tag_1.default.findByIdAndUpdate(id, { is_deleted: false }, { new: true });
    if (!result)
        throw new appError_1.AppError(404, "Tag not found.");
    const tagArray = await Tag_1.default.aggregate((0, tagPipeline_1.buildTagAggregationPipeline)({ _id: result._id }, { includeTopic: true, isAdminView: true }));
    res.json({ message: "Tag restored successfully.", tag: tagArray[0] });
});
//# sourceMappingURL=tagController.js.map