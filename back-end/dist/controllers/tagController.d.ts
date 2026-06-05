/** * GET /api/tags (Public) HOẶC GET /api/tags/admin (Admin)
 * Lấy danh sách tags có phân trang và lọc
 */
export declare const getTagsList: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * GET /api/tags/admin/:id
 * Admin lấy chi tiết 1 Tag
 */
export declare const getTagById: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * POST /api/tags/admin
 * Admin tạo Tag chính thống
 */
export declare const createTagByAdmin: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * PUT /api/tags/admin/:id
 * Admin cập nhật Tag lẻ
 */
export declare const updateTag: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * PATCH /api/tags/admin/bulk
 * Duyệt/Từ chối hàng loạt Tag
 */
export declare const bulkUpdateTags: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * DELETE /api/tags/admin/:id
 * Xóa mềm Tag + Giải phóng liên đới trong Post
 */
export declare const deleteTag: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * PUT /api/tags/admin/restore/:id
 * Khôi phục Tag
 */
export declare const restoreTag: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=tagController.d.ts.map