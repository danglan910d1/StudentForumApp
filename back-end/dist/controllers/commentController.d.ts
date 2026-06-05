/** * GET /api/comments (Public)
 * Lấy comment theo bài viết (thường dùng postId trong query)
 */
export declare const getComments: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * GET /api/comments/admin (Admin Only) */
export declare const getAllCommentsForAdmin: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * POST /api/comments (User)
 * Cập nhật: Đảm bảo dữ liệu trả về là dữ liệu mới nhất thông qua Lean và Aggregate chuẩn.
 */
export declare const createComment: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * PUT /api/comments/:commentId (Author/Admin)
 * Cập nhật: Thêm logic cập nhật nội dung và trả về dữ liệu chuẩn Pipeline.
 */
export declare const updateComment: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * DELETE /api/comments/:commentId (Author/Admin) */
export declare const deleteComment: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * PUT /api/comments/admin/restore/:commentId (Admin Only) */
export declare const restoreComment: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=commentController.d.ts.map