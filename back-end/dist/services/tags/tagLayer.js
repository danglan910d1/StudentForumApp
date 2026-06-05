"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTags = void 0;
const mongoose_1 = require("mongoose");
const Tag_1 = __importDefault(require("../../models/Tag"));
const text_1 = require("../../utils/text");
// --- HẰNG SỐ GIỚI HẠN (HARD RULE) ---
const MAX_TAG_INPUT = 5;
/**
 * Xử lý đầu vào Tag hỗn hợp (ID và Tên) để phân loại và tạo Tag mới (Pending) nếu cần.
 * Đây là logic nghiệp vụ cốt lõi về kiểm soát tính duy nhất của Tag.
 * @param tags Mảng IDs và Tên Tag từ input của người dùng.
 * @param userId ID của người dùng tạo bài viết (để gán Tag mới).
 * @param topicId ID của Topic liên quan (để gán cho Tag mới).
 * @returns Object chứa hai mảng ID đã được phân loại (validTagIds và pendingTagIds).
 */
const processTags = async (tags, userId, topicId) => {
    let validTagIds = [];
    let pendingTagIds = [];
    let warning;
    if (!tags || tags.length === 0)
        return { validTagIds, pendingTagIds };
    // 1. Làm sạch input
    const cleanedInput = tags.map((t) => t.trim()).filter(Boolean);
    const rawUniqueTags = Array.from(new Set(cleanedInput));
    const uniqueTags = rawUniqueTags.slice(0, MAX_TAG_INPUT);
    if (rawUniqueTags.length > MAX_TAG_INPUT) {
        warning = `Chỉ cho phép tối đa ${MAX_TAG_INPUT} thẻ.`;
    }
    const tagIdsFromInput = [];
    const tagSlugsFromInput = [];
    const tagNamesForRegex = [];
    uniqueTags.forEach((item) => {
        if (mongoose_1.Types.ObjectId.isValid(item)) {
            tagIdsFromInput.push(item);
        }
        else {
            tagSlugsFromInput.push((0, text_1.generateSlug)(item));
            tagNamesForRegex.push(item);
        }
    });
    // 2. TRUY VẤN MỞ RỘNG: Tìm cả Slug và Name (Case-insensitive)
    const existingTags = await Tag_1.default.find({
        is_deleted: { $ne: true },
        $or: [
            { _id: { $in: tagIdsFromInput } },
            { slug: { $in: tagSlugsFromInput } },
            // Thêm cái này để "bắt" NodeJS vs node-js
            {
                name: {
                    $in: tagNamesForRegex.map((n) => new RegExp(`^${(0, text_1.escapeRegex)(n)}$`, "i")),
                },
            },
        ],
    }).select("_id name status slug topicId");
    const slugMap = new Map();
    const idMap = new Map();
    const nameMap = new Map();
    existingTags.forEach((t) => {
        slugMap.set(t.slug, t);
        idMap.set(t.id.toString(), t);
        nameMap.set(t.name.toLowerCase(), t); // Map thêm theo tên lowercase
    });
    const tagsToCreate = [];
    const processedIdSet = new Set();
    // 3. Phân loại
    for (const tagItem of uniqueTags) {
        const isObjectId = mongoose_1.Types.ObjectId.isValid(tagItem);
        const itemSlug = isObjectId ? "" : (0, text_1.generateSlug)(tagItem);
        // Tìm ưu tiên: ID -> Slug -> Name
        const foundTag = isObjectId
            ? idMap.get(tagItem)
            : slugMap.get(itemSlug) || nameMap.get(tagItem.toLowerCase());
        if (foundTag) {
            const tagObjectId = foundTag._id;
            if (processedIdSet.has(tagObjectId.toString()))
                continue;
            if (foundTag.status === "approved") {
                const isTopicValid = !foundTag.topicId || foundTag.topicId.equals(topicId);
                isTopicValid
                    ? validTagIds.push(tagObjectId)
                    : pendingTagIds.push(tagObjectId);
            }
            else {
                pendingTagIds.push(tagObjectId);
            }
            processedIdSet.add(tagObjectId.toString());
        }
        else if (!isObjectId) {
            const isAlreadyInCreateList = tagsToCreate.some((t) => t.slug === itemSlug);
            if (!isAlreadyInCreateList) {
                tagsToCreate.push({
                    name: tagItem,
                    slug: itemSlug,
                    createdBy: new mongoose_1.Types.ObjectId(userId),
                    status: "pending",
                    topicId: topicId,
                });
            }
        }
    }
    // 4. Batch Create
    if (tagsToCreate.length > 0) {
        try {
            const createdTags = await Tag_1.default.insertMany(tagsToCreate, {
                ordered: false,
            });
            createdTags.forEach((tag) => pendingTagIds.push(tag._id));
        }
        catch (error) {
            if (error.code === 11000) {
                const retryTags = await Tag_1.default.find({
                    slug: { $in: tagsToCreate.map((t) => t.slug) },
                    is_deleted: { $ne: true }, // Luôn tìm tag chưa xóa
                });
                retryTags.forEach((t) => {
                    const idStr = t.id.toString();
                    // Chỉ push nếu ID này chưa nằm trong valid hoặc pending (đã xử lý ở vòng lặp trước hoặc insert thành công một phần)
                    if (!processedIdSet.has(idStr) &&
                        !pendingTagIds.some((p) => p.toString() === idStr)) {
                        pendingTagIds.push(t._id);
                        processedIdSet.add(idStr);
                    }
                });
            }
        }
    }
    return { validTagIds, pendingTagIds, warning };
};
exports.processTags = processTags;
//# sourceMappingURL=tagLayer.js.map