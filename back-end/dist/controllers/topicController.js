"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreTopic = exports.deleteTopic = exports.updateTopic = exports.createTopic = exports.getTopicById = exports.getTopicsList = void 0;
const mongoose_1 = require("mongoose");
const Topic_1 = __importDefault(require("../models/Topic"));
const Tag_1 = __importDefault(require("../models/Tag"));
const Post_1 = __importDefault(require("../models/Post"));
const topicFilter_1 = require("../services/topics/topicFilter");
const topicPipeline_1 = require("../services/topics/topicPipeline");
const asyncHandler_1 = require("../utils/asyncHandler");
const pagination_1 = require("../utils/pagination");
const text_1 = require("../utils/text");
const appError_1 = require("../utils/appError");
// --- [ 1. READ OPERATIONS ] ---
/** * GET /api/topics (Public) & GET /api/topics/admin (Admin) */
exports.getTopicsList = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const query = req.query; // Dùng any để lấy field sort dễ dàng
    const isAdmin = req.userRole === "admin";
    const userId = req.userId;
    // 1. Xây dựng Filter
    const filter = (0, topicFilter_1.buildTopicFilter)(query, { userId, isAdmin });
    // 2. Xây dựng Pipeline cơ bản
    const pipeline = (0, topicPipeline_1.buildTopicAggregationPipeline)(filter, {
        includeUser: isAdmin,
        includeProjection: true,
        isAdminView: isAdmin,
    });
    // 3. LOGIC SẮP XẾP (Giống PostController)
    const sortStage = {};
    if (query.sort === "popular") {
        // Sắp xếp theo số lượng bài viết giảm dần
        sortStage.postCount = -1;
    }
    else if (query.sort === "old") {
        sortStage.createdAt = 1;
    }
    else {
        // Mặc định là mới nhất
        sortStage.createdAt = -1;
    }
    pipeline.push({ $sort: sortStage });
    // 4. Phân trang
    const result = await (0, pagination_1.paginateAggregation)(Topic_1.default, pipeline, query.page, query.limit);
    res.json({
        topics: result.items,
        pagination: {
            totalItems: result.totalItems,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            limit: result.limit,
        },
    });
});
/** * GET /api/topics/admin/:id */
exports.getTopicById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw new appError_1.AppError(400, "Invalid Topic ID format.");
    const topicArray = await Topic_1.default.aggregate((0, topicPipeline_1.buildTopicAggregationPipeline)({ _id: new mongoose_1.Types.ObjectId(id) }, { includeUser: true, includeProjection: true, isAdminView: true }));
    if (!topicArray[0])
        throw new appError_1.AppError(404, "Topic not found.");
    res.json(topicArray[0]);
});
// --- [ 2. WRITE OPERATIONS ] ---
/** * POST /api/topics/admin */
exports.createTopic = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, description, status } = req.body;
    if (!name?.trim())
        throw new appError_1.AppError(400, "Topic name is required.");
    const slug = (0, text_1.generateSlug)(name.trim());
    const topicExists = await Topic_1.default.findOne({ slug, is_deleted: false });
    if (topicExists)
        throw new appError_1.AppError(400, "Topic name already exists.");
    const newTopic = await Topic_1.default.create({
        name: name.trim(),
        slug,
        description: description?.trim(),
        createdBy: new mongoose_1.Types.ObjectId(req.userId),
        status: status || "approved",
    });
    const topicArray = await Topic_1.default.aggregate((0, topicPipeline_1.buildTopicAggregationPipeline)({ _id: newTopic._id }, { includeUser: true, isAdminView: true }));
    res.status(201).json(topicArray[0]);
});
/** * PUT /api/topics/admin/:id */
exports.updateTopic = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw new appError_1.AppError(400, "Invalid Topic ID.");
    const updateFields = {};
    if (name) {
        updateFields.name = name.trim();
        updateFields.slug = (0, text_1.generateSlug)(name.trim());
    }
    if (description !== undefined)
        updateFields.description = description?.trim() || null;
    if (status)
        updateFields.status = status;
    if (Object.keys(updateFields).length === 0)
        throw new appError_1.AppError(400, "No fields provided for update.");
    const updatedTopic = await Topic_1.default.findOneAndUpdate({ _id: id }, { $set: updateFields }, { new: true, runValidators: true });
    if (!updatedTopic)
        throw new appError_1.AppError(404, "Topic not found or deleted.");
    const topicArray = await Topic_1.default.aggregate((0, topicPipeline_1.buildTopicAggregationPipeline)({ _id: updatedTopic._id }, { includeUser: true, isAdminView: true }));
    res.json(topicArray[0]);
});
// --- [ 3. DELETE & RESTORE ] ---
/** * DELETE /api/topics/admin/:id
 * Xóa mềm Topic và giải phóng các Tag/Post liên quan
 */
exports.deleteTopic = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const topic = await Topic_1.default.findById(id);
    if (!topic || topic.is_deleted)
        throw new appError_1.AppError(404, "Topic not found.");
    // 1. Xóa mềm Topic
    await Topic_1.default.findByIdAndUpdate(id, {
        is_deleted: true,
        slug: `${topic.slug}-deleted-${Date.now()}`,
    });
    // 2. Cascading: Chuyển Tag và Post liên quan về "Tự do" (topicId: null)
    const topicObjectId = new mongoose_1.Types.ObjectId(id);
    await Promise.all([
        Tag_1.default.updateMany({ topicId: topicObjectId }, { $set: { topicId: null } }),
        Post_1.default.updateMany({ topicId: topicObjectId }, { $set: { topicId: null } }),
    ]);
    res.json({ message: "Topic soft deleted and linked entities decoupled." });
});
/** * PUT /api/topics/admin/restore/:id */
exports.restoreTopic = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const restoredTopic = await Topic_1.default.findByIdAndUpdate(id, { is_deleted: false }, { new: true });
    if (!restoredTopic)
        throw new appError_1.AppError(404, "Topic not found.");
    const topicArray = await Topic_1.default.aggregate((0, topicPipeline_1.buildTopicAggregationPipeline)({ _id: restoredTopic._id }, { includeUser: true, isAdminView: true }));
    res.json({ message: "Topic restored successfully.", topic: topicArray[0] });
});
//# sourceMappingURL=topicController.js.map