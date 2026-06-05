"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserStatus = exports.getUsersList = exports.getUserById = exports.updatePassword = exports.updateProfile = exports.getMe = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = require("mongoose");
const User_1 = __importDefault(require("../models/User"));
const Post_1 = __importDefault(require("../models/Post"));
const Comment_1 = __importDefault(require("../models/Comment"));
const Like_1 = __importDefault(require("../models/Like"));
const asyncHandler_1 = require("../utils/asyncHandler");
const constants_1 = require("../config/constants");
const pagination_1 = require("../utils/pagination");
const userFilter_1 = require("../services/users/userFilter");
const redis_1 = require("../services/common/redis");
const userPipeline_1 = require("../services/users/userPipeline");
const fetchUserByPipeline_1 = require("../services/users/fetchUserByPipeline");
const appError_1 = require("../utils/appError");
// --- [ 1. PROFILE & SECURITY ] ---
/** * GET /api/users/me */
exports.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await (0, fetchUserByPipeline_1.fetchUserByPipeline)({ _id: new mongoose_1.Types.ObjectId(req.userId) }, true);
    if (!user)
        throw new appError_1.AppError(404, "User not found.");
    await (0, redis_1.cacheUser)(req.userId, user);
    res.json(user);
});
/** * PUT /api/users/profile (Update Name/Avatar)
 * Sử dụng Cloudinary Storage
 */
exports.updateProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { name, avatar } = req.body;
    const requestId = req.headers["x-request-id"];
    const user = await User_1.default.findById(userId);
    if (!user)
        throw new appError_1.AppError(404, "User not found.");
    const updateFields = {};
    if (name?.trim())
        updateFields.name = name.trim();
    // --- [XỬ LÝ AVATAR VỚI CLOUDINARY] ---
    if (req.file) {
        /**
         * Với multer-storage-cloudinary:
         * req.file.path là URL đầy đủ (https://res.cloudinary.com/...)
         */
        updateFields.avatar = req.file.path;
        // Lưu ý: Việc xóa ảnh cũ trên Cloudinary để tiết kiệm dung lượng
        // yêu cầu lấy public_id từ URL cũ. Tạm thời lưu link mới đã giúp
        // hiển thị ảnh công khai cho toàn bộ hệ thống.
    }
    else if (avatar === "null") {
        updateFields.avatar = null;
    }
    console.log("--- ĐÃ VÀO ĐƯỢC CONTROLLER UPDATE PROFILE ---");
    console.log("File nhận được:", req.file);
    // Cập nhật Database
    const updatedUserRaw = await User_1.default.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });
    if (!updatedUserRaw)
        throw new appError_1.AppError(404, "Update failed, user not found.");
    // Lấy dữ liệu user đầy đủ thông qua Pipeline (bao gồm stats, role...)
    const userData = await (0, fetchUserByPipeline_1.fetchUserByPipeline)({ _id: updatedUserRaw._id }, true);
    // Cập nhật Cache Redis
    await (0, redis_1.cacheUser)(userId, userData);
    // Xử lý Idempotency (Chống trùng lặp request)
    if (requestId) {
        await (0, redis_1.saveIdempotencyResult)(requestId, 200, JSON.stringify(userData));
    }
    res.json(userData);
});
/** * PUT /api/users/password (Security) */
exports.updatePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const requestId = req.headers["x-request-id"];
    if (!oldPassword?.trim() || !newPassword?.trim())
        throw new appError_1.AppError(400, "Both passwords are required.");
    if (newPassword.length < constants_1.MIN_PASSWORD_LENGTH)
        throw new appError_1.AppError(400, `Password must be at least ${constants_1.MIN_PASSWORD_LENGTH} characters.`);
    const user = await User_1.default.findById(req.userId).select("+password");
    if (!user)
        throw new appError_1.AppError(404, "User not found.");
    const isMatch = await bcrypt_1.default.compare(oldPassword, user.password);
    if (!isMatch)
        throw new appError_1.AppError(401, "Invalid current password.");
    const salt = await bcrypt_1.default.genSalt(constants_1.BCRYPT_SALT_ROUNDS);
    user.password = await bcrypt_1.default.hash(newPassword, salt);
    await user.save();
    await (0, redis_1.cacheUser)(req.userId, null, 0); // Invalidate cache
    const result = { message: "Password updated successfully." };
    // IDEMPOTENCY: Lưu kết quả (Chỉ lưu thông báo, KHÔNG lưu mật khẩu)
    if (requestId)
        await (0, redis_1.saveIdempotencyResult)(requestId, 200, JSON.stringify(result));
    res.json(result);
});
// --- [ 2. ADMIN & PUBLIC READS ] ---
/** * GET /api/users/:id */
exports.getUserById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.userId;
    const isAdmin = req.userRole === "admin";
    const canViewFull = !!currentUserId && (isAdmin || currentUserId === id);
    const cacheKey = `user:detail:${canViewFull ? "private" : "public"}:${id}`;
    const cached = await (0, redis_1.getCache)(cacheKey);
    if (cached)
        return res.json(cached);
    const user = await (0, fetchUserByPipeline_1.fetchUserByPipeline)({ _id: new mongoose_1.Types.ObjectId(id) }, canViewFull);
    if (!user)
        throw new appError_1.AppError(404, "User not found.");
    await (0, redis_1.setCache)(cacheKey, user, canViewFull ? 60 : 300);
    res.json(user);
});
/** * GET /api/users (Admin/Public List) */
exports.getUsersList = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const isAdmin = req.userRole === "admin";
    const filter = (0, userFilter_1.buildUserFilter)(req.query, {
        userId: req.userId,
        isAdmin,
    });
    const pipeline = (0, userPipeline_1.buildUserAggregationPipeline)(filter, {
        includeStats: true,
        isAdminView: isAdmin,
    });
    const result = await (0, pagination_1.paginateAggregation)(User_1.default, pipeline, req.query.page, req.query.limit);
    res.json({
        users: result.items,
        pagination: {
            totalItems: result.totalItems,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            limit: result.limit,
        },
    });
});
// --- [ 3. ADMINISTRATIVE & CASCADE DELETE ] ---
/** * PUT /api/users/admin/:id/status (Admin Only) */
exports.updateUserStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const requestId = req.headers["x-request-id"];
    const targetId = req.params.id;
    const currentAdminId = req.userId;
    if (req.userId === req.params.id)
        throw new appError_1.AppError(403, "Cannot modify yourself.");
    if (targetId === currentAdminId && req.body.role === "user") {
        throw new appError_1.AppError(403, "Bạn không thể tự hạ cấp chính mình để tránh mất quyền quản trị.");
    }
    const updated = await User_1.default.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updated)
        throw new appError_1.AppError(404, "User not found.");
    await (0, redis_1.cacheUser)(req.params.id, null, 0);
    const userData = await (0, fetchUserByPipeline_1.fetchUserByPipeline)({ _id: updated._id }, true);
    if (requestId)
        await (0, redis_1.saveIdempotencyResult)(requestId, 200, JSON.stringify(userData));
    res.json(userData);
});
/** * DELETE /api/users/:id (Cascade Soft Delete) */
exports.deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const targetId = req.params.id || req.userId;
    const requestId = req.headers["x-request-id"];
    if (req.params.id && req.userRole !== "admin")
        throw new appError_1.AppError(403, "Permission denied.");
    const user = await User_1.default.findById(targetId);
    if (!user || user.is_deleted)
        throw new appError_1.AppError(404, "User not found.");
    // Soft delete user & obfuscate email
    await User_1.default.findByIdAndUpdate(targetId, {
        is_deleted: true,
        email: `${user.email}-del-${Date.now()}`,
    });
    // CASCADE: Xử lý Like, Comment, Post
    await Promise.all([
        Post_1.default.updateMany({ userId: targetId }, { is_deleted: true }),
        Comment_1.default.updateMany({ userId: targetId }, { is_deleted: true }),
        Like_1.default.deleteMany({ userId: targetId }), // Like thường được xóa hẳn để giải phóng count bài viết
        (0, redis_1.cacheUser)(targetId, null, 0),
    ]);
    const result = { message: "Account deleted successfully." };
    if (requestId)
        await (0, redis_1.saveIdempotencyResult)(requestId, 200, JSON.stringify(result));
    res.json(result);
});
//# sourceMappingURL=userController.js.map