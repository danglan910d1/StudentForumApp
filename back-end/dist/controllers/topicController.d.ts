/** * GET /api/topics (Public) & GET /api/topics/admin (Admin) */
export declare const getTopicsList: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * GET /api/topics/admin/:id */
export declare const getTopicById: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * POST /api/topics/admin */
export declare const createTopic: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * PUT /api/topics/admin/:id */
export declare const updateTopic: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * DELETE /api/topics/admin/:id
 * Xóa mềm Topic và giải phóng các Tag/Post liên quan
 */
export declare const deleteTopic: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * PUT /api/topics/admin/restore/:id */
export declare const restoreTopic: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=topicController.d.ts.map