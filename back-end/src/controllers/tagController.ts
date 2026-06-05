/**
 * CONTROLLER: tagController
 * Trách nhiệm: Xử lý Business Logic liên quan đến Nhãn (Tag CRUD, Kiểm duyệt).
 * Nguyên tắc: Pipeline-driven, Unified Error Handling, RBAC, Bulk Operations.
 */
import { Request, Response } from "express";
import { Types } from "mongoose";
import Tag, { ITag, TagStatus } from "../models/Tag";
import Post from "../models/Post";
import { AuthenticatedRequest } from "../types/express";
import { GetTagsQuery, TagParams, UpdateTagBody } from "../types/tag";
import { asyncHandler } from "../utils/asyncHandler";
import { paginateAggregation } from "../utils/pagination";
import { buildTagFilter } from "../services/tags/tagFilter";
import { buildTagAggregationPipeline } from "../services/tags/tagPipeline";
import { escapeRegex, generateSlug } from "../utils/text";
import { AppError } from "../utils/appError";

// --- [ 1. READ OPERATIONS ] ---

/** * GET /api/tags (Public) HOẶC GET /api/tags/admin (Admin)
 * Lấy danh sách tags có phân trang và lọc
 */
export const getTagsList = asyncHandler(
  async (req: Request | AuthenticatedRequest, res: Response) => {
    const query = req.query as any;

    const isResourceAdminRoute = req.originalUrl.includes("/api/tags/admin");
    const userRole = (req as any).userRole;
    const isAdmin = isResourceAdminRoute && userRole === "admin";
    const userId = "userId" in req ? (req as any).userId : undefined;

    // 1. Xây dựng filter
    const filter = await buildTagFilter(query, { userId, isAdmin });

    // 2. Xây dựng pipeline
    const pipeline = buildTagAggregationPipeline(filter, {
      includeTopic: true,
      includeUser: isAdmin,
      includeProjection: true,
      isAdminView: isAdmin,
    });

    // 3. LOGIC SẮP XẾP
    const sortStage: any = {};
    if (query.sort === "popular") {
      // Sắp xếp theo số lượng bài viết gắn tag này
      sortStage.postCount = -1;
    } else if (query.sort === "old") {
      sortStage.createdAt = 1;
    } else {
      sortStage.createdAt = -1;
    }
    pipeline.push({ $sort: sortStage });

    // 4. Thực hiện phân trang
    const result = await paginateAggregation(
      Tag,
      pipeline,
      query.page,
      query.limit,
    );

    res.json({
      tags: result.items,
      pagination: {
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: result.limit,
      },
    });
  },
);

/** * GET /api/tags/admin/:id
 * Admin lấy chi tiết 1 Tag
 */
export const getTagById = asyncHandler(
  async (req: AuthenticatedRequest<TagParams>, res: Response) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id))
      throw new AppError(400, "Invalid Tag ID format.");

    const tagArray = await Tag.aggregate(
      buildTagAggregationPipeline(
        { _id: new Types.ObjectId(id) },
        {
          includeTopic: true,
          includeUser: true,
          includeProjection: true,
          isAdminView: true,
        },
      ),
    );

    if (!tagArray[0]) throw new AppError(404, "Tag not found.");
    res.json(tagArray[0]);
  },
);

// --- [ 2. WRITE OPERATIONS ] ---

/** * POST /api/tags/admin
 * Admin tạo Tag chính thống
 */
export const createTagByAdmin = asyncHandler(
  async (
    req: AuthenticatedRequest<
      {},
      {},
      { name: string; topicId?: string; status?: TagStatus }
    >,
    res: Response,
  ) => {
    const { name, topicId, status } = req.body;
    if (!name || name.trim().length === 0)
      throw new AppError(400, "Tag name is required.");

    const cleanName = name.trim();
    const slug = generateSlug(cleanName);

    // Tìm xem có cái nào trùng slug HOẶC trùng tên (không phân biệt hoa thường) mà chưa xóa không
    const existing = await Tag.findOne({
      is_deleted: { $ne: true },
      $or: [
        { slug: slug },
        { name: { $regex: new RegExp(`^${escapeRegex(cleanName)}$`, "i") } },
      ],
    });

    if (existing)
      throw new AppError(400, "Tag with this name or slug already exists.");

    // 1. Tạo trực tiếp với trạng thái Approved
    const newTag = await Tag.create({
      name: name.trim(),
      slug,
      topicId: topicId ? new Types.ObjectId(topicId) : null,
      createdBy: new Types.ObjectId(req.userId),
      status: status || "approved",
    });

    // 2. Trả về format chuẩn
    const tagArray = await Tag.aggregate(
      buildTagAggregationPipeline(
        { _id: newTag._id },
        { includeTopic: true, includeUser: true, isAdminView: true },
      ),
    );
    res.status(201).json(tagArray[0]);
  },
);

/** * PUT /api/tags/admin/:id
 * Admin cập nhật Tag lẻ
 */
export const updateTag = asyncHandler(
  async (
    req: AuthenticatedRequest<TagParams, {}, UpdateTagBody>,
    res: Response,
  ) => {
    const { id } = req.params;
    const { name, topicId, status } = req.body;
    if (!Types.ObjectId.isValid(id)) throw new AppError(400, "Invalid Tag ID.");

    const updateFields: any = {};
    if (name) {
      updateFields.name = name.trim();
      updateFields.slug = generateSlug(name.trim());
    }
    if (topicId !== undefined)
      updateFields.topicId = topicId ? new Types.ObjectId(topicId) : null;
    if (status) updateFields.status = status;

    if (Object.keys(updateFields).length === 0)
      throw new AppError(400, "No fields to update.");

    const updatedTag = await Tag.findOneAndUpdate(
      { _id: id, is_deleted: { $ne: true } },
      { $set: updateFields },
      { new: true },
    );
    if (!updatedTag) throw new AppError(404, "Tag not found or deleted.");

    const tagArray = await Tag.aggregate(
      buildTagAggregationPipeline(
        { _id: updatedTag._id },
        { includeTopic: true, includeUser: true, isAdminView: true },
      ),
    );
    res.json(tagArray[0]);
  },
);

/** * PATCH /api/tags/admin/bulk
 * Duyệt/Từ chối hàng loạt Tag
 */
export const bulkUpdateTags = asyncHandler(
  async (
    req: AuthenticatedRequest<{}, {}, { ids: string[]; status: string }>,
    res: Response,
  ) => {
    const { ids, status } = req.body;
    if (!ids?.length) throw new AppError(400, "List of Tag IDs is required.");

    const result = await Tag.updateMany(
      { _id: { $in: ids.map((id) => new Types.ObjectId(id)) } },
      { $set: { status } },
    );

    res.json({
      message: `Successfully updated ${result.modifiedCount} tags to ${status}.`,
    });
  },
);

// --- [ 3. DELETE & RESTORE ] ---

/** * DELETE /api/tags/admin/:id
 * Xóa mềm Tag + Giải phóng liên đới trong Post
 */
export const deleteTag = asyncHandler(
  async (req: AuthenticatedRequest<TagParams>, res: Response) => {
    const { id } = req.params;
    const tag = await Tag.findById(id);
    if (!tag || tag.is_deleted) throw new AppError(404, "Tag not found.");

    // 1. Xóa mềm Tag
    await Tag.findByIdAndUpdate(id, {
      is_deleted: true,
      slug: `${tag.slug}-deleted-${Date.now()}`,
    });

    // 2. Atomic Pull: Gỡ Tag này ra khỏi tất cả bài viết liên quan
    const tagObjectId = new Types.ObjectId(id);
    await Post.updateMany(
      { $or: [{ tags: tagObjectId }, { pending_tags: tagObjectId }] },
      { $pull: { tags: tagObjectId, pending_tags: tagObjectId } },
    );

    res.json({ message: "Tag moved to trash and removed from related posts." });
  },
);

/** * PUT /api/tags/admin/restore/:id
 * Khôi phục Tag
 */
export const restoreTag = asyncHandler(
  async (req: AuthenticatedRequest<TagParams>, res: Response) => {
    const { id } = req.params;
    const result = await Tag.findByIdAndUpdate(
      id,
      { is_deleted: false },
      { new: true },
    );
    if (!result) throw new AppError(404, "Tag not found.");

    const tagArray = await Tag.aggregate(
      buildTagAggregationPipeline(
        { _id: result._id },
        { includeTopic: true, isAdminView: true },
      ),
    );
    res.json({ message: "Tag restored successfully.", tag: tagArray[0] });
  },
);
