"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTopicFilter = void 0;
const buildCommonFilter_1 = require("../common/buildCommonFilter"); // Sử dụng CommonQuery
/**
 * Xây dựng đối tượng filter MongoDB đặc thù cho Topic.
 * Sử dụng buildCommonFilter để xử lý logic Status và Search.
 */
const buildTopicFilter = (queryParams, authContext) => {
    // Topic hiện tại không có trường đặc thù, chỉ dùng chung logic với Common
    // Truyền thẳng queryParams vào là xong
    return (0, buildCommonFilter_1.buildCommonFilter)(queryParams, authContext, "topic");
};
exports.buildTopicFilter = buildTopicFilter;
//# sourceMappingURL=topicFilter.js.map