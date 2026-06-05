/**
 * CONTROLLER: topicController
 * Trách nhiệm: Xử lý Business Logic liên quan đến Chủ đề (Topic CRUD, Kiểm duyệt).
 * Nguyên tắc: Pipeline-driven, Unified Error Handling, RBAC, Cascading Update.
 */
import { Request, Response } from "express";
import { Types } from "mongoose";
import Topic, { ITopic } from "../models/Topic";
import Tag from "../models/Tag";
import Post from "../models/Post";
import { AuthenticatedRequest } from "../types/express";
import { TopicParams, CreateTopicBody, UpdateTopicBody } from "../types/topic";
import { GetTopicsQuery } from "../services/topics/topicFilter";
import { buildTopicFilter } from "../services/topics/topicFilter";
import { buildTopicAggregationPipeline } from "../services/topics/topicPipeline";
import { asyncHandler } from "../utils/asyncHandler";
import { paginateAggregation } from "../utils/pagination";
import { generateSlug } from "../utils/text";
import { AppError } from "../utils/appError";

// --- [ 1. READ OPERATIONS ] ---

/** * GET /api/topics (Public) & GET /api/topics/admin (Admin) */
export const getTopicsList = asyncHandler(
  async (req: Request | AuthenticatedRequest, res: Response) => {
    const query = req.query as any; // Dùng any để lấy field sort dễ dàng
    const isAdmin = req.userRole === "admin";
    const userId = (req as any).userId;

    // 1. Xây dựng Filter
    const filter = buildTopicFilter(query, { userId, isAdmin });

    // 2. Xây dựng Pipeline cơ bản
    const pipeline = buildTopicAggregationPipeline(filter, {
      includeUser: isAdmin,
      includeProjection: true,
      isAdminView: isAdmin,
    });

    // 3. LOGIC SẮP XẾP (Giống PostController)
    const sortStage: any = {};
    if (query.sort === "popular") {
      // Sắp xếp theo số lượng bài viết giảm dần
      sortStage.postCount = -1;
    } else if (query.sort === "old") {
      sortStage.createdAt = 1;
    } else {
      // Mặc định là mới nhất
      sortStage.createdAt = -1;
    }
    pipeline.push({ $sort: sortStage });

    // 4. Phân trang
    const result = await paginateAggregation(
      Topic,
      pipeline,
      query.page,
      query.limit,
    );

    res.json({
      topics: result.items,
      pagination: {
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: result.limit,
      },
    });
  },
);

/** * GET /api/topics/admin/:id */
export const getTopicById = asyncHandler(
  async (req: AuthenticatedRequest<TopicParams>, res: Response) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id))
      throw new AppError(400, "Invalid Topic ID format.");

    const topicArray = await Topic.aggregate(
      buildTopicAggregationPipeline(
        { _id: new Types.ObjectId(id) },
        { includeUser: true, includeProjection: true, isAdminView: true },
      ),
    );

    if (!topicArray[0]) throw new AppError(404, "Topic not found.");
    res.json(topicArray[0]);
  },
);

// --- [ 2. WRITE OPERATIONS ] ---

/** * POST /api/topics/admin */
export const createTopic = asyncHandler(
  async (req: AuthenticatedRequest<{}, {}, CreateTopicBody>, res: Response) => {
    const { name, description, status } = req.body;
    if (!name?.trim()) throw new AppError(400, "Topic name is required.");

    const slug = generateSlug(name.trim());
    const topicExists = await Topic.findOne({ slug, is_deleted: false });
    if (topicExists) throw new AppError(400, "Topic name already exists.");

    const newTopic = await Topic.create({
      name: name.trim(),
      slug,
      description: description?.trim(),
      createdBy: new Types.ObjectId(req.userId),
      status: status || "approved",
    });

    const topicArray = await Topic.aggregate(
      buildTopicAggregationPipeline(
        { _id: newTopic._id },
        { includeUser: true, isAdminView: true },
      ),
    );
    res.status(201).json(topicArray[0]);
  },
);

/** * PUT /api/topics/admin/:id */
export const updateTopic = asyncHandler(
  async (
    req: AuthenticatedRequest<TopicParams, {}, UpdateTopicBody>,
    res: Response,
  ) => {
    const { id } = req.params;
    const { name, description, status } = req.body;
    if (!Types.ObjectId.isValid(id))
      throw new AppError(400, "Invalid Topic ID.");

    const updateFields: any = {};
    if (name) {
      updateFields.name = name.trim();
      updateFields.slug = generateSlug(name.trim());
    }
    if (description !== undefined)
      updateFields.description = description?.trim() || null;
    if (status) updateFields.status = status;

    if (Object.keys(updateFields).length === 0)
      throw new AppError(400, "No fields provided for update.");

    const updatedTopic = await Topic.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!updatedTopic) throw new AppError(404, "Topic not found or deleted.");

    const topicArray = await Topic.aggregate(
      buildTopicAggregationPipeline(
        { _id: updatedTopic._id },
        { includeUser: true, isAdminView: true },
      ),
    );
    res.json(topicArray[0]);
  },
);

// --- [ 3. DELETE & RESTORE ] ---

/** * DELETE /api/topics/admin/:id
 * Xóa mềm Topic và giải phóng các Tag/Post liên quan
 */
export const deleteTopic = asyncHandler(
  async (req: AuthenticatedRequest<TopicParams>, res: Response) => {
    const { id } = req.params;
    const topic = await Topic.findById(id);
    if (!topic || topic.is_deleted) throw new AppError(404, "Topic not found.");

    // 1. Xóa mềm Topic
    await Topic.findByIdAndUpdate(id, {
      is_deleted: true,
      slug: `${topic.slug}-deleted-${Date.now()}`,
    });

    // 2. Cascading: Chuyển Tag và Post liên quan về "Tự do" (topicId: null)
    const topicObjectId = new Types.ObjectId(id);
    await Promise.all([
      Tag.updateMany({ topicId: topicObjectId }, { $set: { topicId: null } }),
      Post.updateMany({ topicId: topicObjectId }, { $set: { topicId: null } }),
    ]);

    res.json({ message: "Topic soft deleted and linked entities decoupled." });
  },
);

/** * PUT /api/topics/admin/restore/:id */
export const restoreTopic = asyncHandler(
  async (req: AuthenticatedRequest<TopicParams>, res: Response) => {
    const { id } = req.params;

    const restoredTopic = await Topic.findByIdAndUpdate(
      id,
      { is_deleted: false },
      { new: true },
    );
    if (!restoredTopic) throw new AppError(404, "Topic not found.");

    const topicArray = await Topic.aggregate(
      buildTopicAggregationPipeline(
        { _id: restoredTopic._id },
        { includeUser: true, isAdminView: true },
      ),
    );
    res.json({ message: "Topic restored successfully.", topic: topicArray[0] });
  },
);
