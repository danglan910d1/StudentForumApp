"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTagFilter = void 0;
const mongoose_1 = require("mongoose");
const buildCommonFilter_1 = require("../common/buildCommonFilter"); // Sử dụng CommonQuery
const Topic_1 = __importDefault(require("../../models/Topic"));
/**
 * Xây dựng đối tượng filter MongoDB đặc thù cho Tag.
 * Sử dụng buildCommonFilter để xử lý logic Status, Search, và MyPosts (nếu có).
 */
const buildTagFilter = async (queryParams, authContext) => {
    const filter = (0, buildCommonFilter_1.buildCommonFilter)(queryParams, authContext, "tag");
    const { topicId, topicSlug } = queryParams;
    if (topicId) {
        if (topicId === "null") {
            filter.topicId = null; // Tìm các tag không thuộc topic nào
        }
        else if (mongoose_1.Types.ObjectId.isValid(topicId)) {
            filter.topicId = new mongoose_1.Types.ObjectId(topicId);
        }
    }
    else if (topicSlug) {
        // Tìm ID của Topic trước khi lọc Tag
        const topic = await Topic_1.default.findOne({ slug: topicSlug }).select("_id");
        filter.topicId = topic ? topic._id : new mongoose_1.Types.ObjectId();
    }
    return filter;
};
exports.buildTagFilter = buildTagFilter;
//# sourceMappingURL=tagFilter.js.map