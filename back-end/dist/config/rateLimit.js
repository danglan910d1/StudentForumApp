"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisRateLimiter = void 0;
const redis_1 = require("../services/common/redis"); // Import hàm kiểm tra Redis
const asyncHandler_1 = require("../utils/asyncHandler"); // Sử dụng utility này nếu cần
/**
 * Middleware Rate Limiting tùy chỉnh sử dụng Redis.
 * @param limit Số lần truy cập tối đa
 * @param windowInSeconds Khung thời gian
 * @param keyPrefix Tiền tố khóa (ví dụ: 'rate:ip' hoặc 'rate:user')
 */
const redisRateLimiter = (limit, windowInSeconds, keyPrefix) => {
    // Trả về một RequestHandler sử dụng asyncHandler để bắt lỗi
    return (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
        // 1. Xác định định danh: Dùng IP cho General Limiter, dùng User ID cho Sensitive Limiter
        // LƯU Ý: Nếu authMiddleware đã gán userId, ta ưu tiên dùng userId
        const identifier = req.userId || req.ip;
        if (!identifier) {
            // Trường hợp không có IP hoặc ID (rất hiếm)
            return res
                .status(500)
                .json({ error: "Rate limit identifier missing." });
        } // Kết hợp HTTP Method và Path để tạo định danh duy nhất cho hành động này.
        // 2. TẠO ID HÀNH ĐỘNG CỤC BỘ (Action-Specific ID)
        // Dùng req.baseUrl + req.path để tái tạo lại path đầy đủ, ví dụ: /api/users/profile
        const actionId = `${req.method}:${req.baseUrl || ""}${req.path}`;
        // Đảm bảo actionId không có ký tự không hợp lệ cho key Redis nếu cần, nhưng string path thường là OK.
        // 3. TẠO KHÓA REDIS HOÀN CHỈNH
        // Khóa sẽ là: rate:sensitive:USER_ID:POST:/api/auth/register
        const uniqueKey = `${keyPrefix}:${identifier}:${actionId}`;
        const allowed = await (0, redis_1.checkRateLimit)(uniqueKey, limit, windowInSeconds);
        if (!allowed) {
            // Trả về lỗi 429 nếu vượt quá giới hạn
            return res.status(429).json({
                code: 429,
                error: `Too many requests. Try again in ${windowInSeconds} seconds.`,
            });
        }
        next();
    });
};
exports.redisRateLimiter = redisRateLimiter;
//# sourceMappingURL=rateLimit.js.map