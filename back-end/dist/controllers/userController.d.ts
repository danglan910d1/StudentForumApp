/** * GET /api/users/me */
export declare const getMe: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * PUT /api/users/profile (Update Name/Avatar)
 * Sử dụng Cloudinary Storage
 */
export declare const updateProfile: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * PUT /api/users/password (Security) */
export declare const updatePassword: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * GET /api/users/:id */
export declare const getUserById: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * GET /api/users (Admin/Public List) */
export declare const getUsersList: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * PUT /api/users/admin/:id/status (Admin Only) */
export declare const updateUserStatus: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/** * DELETE /api/users/:id (Cascade Soft Delete) */
export declare const deleteUser: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=userController.d.ts.map