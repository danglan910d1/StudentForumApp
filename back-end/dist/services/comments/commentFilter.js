"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCommentFilter = void 0;
const mongoose_1 = require("mongoose");
const buildCommonFilter_1 = require("../common/buildCommonFilter");
const buildCommentFilter = (queryParams, authContext) => {
    const { postId, parentId } = queryParams;
    // 1. Build common filter (search, is_deleted, status mặc định)
    const filter = (0, buildCommonFilter_1.buildCommonFilter)(queryParams, authContext, "comment");
    // 2. Validate PostId (Fail-fast)
    if (!postId || !mongoose_1.Types.ObjectId.isValid(postId)) {
        return { error: "Valid postId is required." };
    }
    filter.postId = new mongoose_1.Types.ObjectId(postId);
    // 3. Xử lý ParentId (Phân cấp)
    if (parentId) {
        if (!mongoose_1.Types.ObjectId.isValid(parentId))
            return { error: "Invalid parentId." };
        filter.parentId = new mongoose_1.Types.ObjectId(parentId);
    }
    else {
        filter.parentId = null; // Lấy comment gốc
    }
    return filter;
};
exports.buildCommentFilter = buildCommentFilter;
//# sourceMappingURL=commentFilter.js.map