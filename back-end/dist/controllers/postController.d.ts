/** * GET /api/posts
 * Lấy danh sách bài viết (Public/Admin)
 */
export declare const getPosts: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * GET /api/posts/:id
 * Lấy chi tiết bài viết: Dành cho khách vãng lai và Tác giả xem bài của mình.
 */
export declare const getPostById: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * GET /api/posts/admin/:id
 * Admin lấy chi tiết bài viết (Bất kể trạng thái)
 */
export declare const getPostByIdForAdmin: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * POST /api/posts
 * Tạo bài viết mới (User)
 */
export declare const createPost: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * PUT /api/posts/:id
 * Cập nhật bài viết (Tác giả/Admin)
 */
export declare const updatePost: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * POST /api/posts/admin/approve/:id
 * Admin duyệt bài và Tag đề xuất
 */
export declare const adminApprovePostController: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * PUT /api/posts/admin/sticky/:id
 * Admin ghim/bỏ ghim bài viết
 */
export declare const togglePostStickyController: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * DELETE /api/posts/:id
 * Xóa mềm bài viết (Tác giả/Admin)
 */
export declare const deletePost: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * PUT /api/posts/admin/restore/:id
 * Admin khôi phục bài viết
 */
export declare const restorePost: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=postController.d.ts.map