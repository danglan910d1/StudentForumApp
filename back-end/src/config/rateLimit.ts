import { Request, Response, NextFunction } from "express";
import { checkRateLimit } from "../services/common/redis"; // Import hàm kiểm tra Redis
import { asyncHandler } from "../utils/asyncHandler"; // Sử dụng utility này nếu cần

/**
 * Middleware Rate Limiting tùy chỉnh sử dụng Redis.
 * @param limit Số lần truy cập tối đa
 * @param windowInSeconds Khung thời gian
 * @param keyPrefix Tiền tố khóa (ví dụ: 'rate:ip' hoặc 'rate:user')
 */
export const redisRateLimiter = (
  limit: number,
  windowInSeconds: number,
  keyPrefix: string
) => {
  // Trả về một RequestHandler sử dụng asyncHandler để bắt lỗi
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // 1. Xác định định danh: Dùng IP cho General Limiter, dùng User ID cho Sensitive Limiter
      // LƯU Ý: Nếu authMiddleware đã gán userId, ta ưu tiên dùng userId
      const identifier = (req as any).userId || req.ip;

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

      const allowed = await checkRateLimit(uniqueKey, limit, windowInSeconds);

      if (!allowed) {
        // Trả về lỗi 429 nếu vượt quá giới hạn
        return res.status(429).json({
          code: 429,
          error: `Too many requests. Try again in ${windowInSeconds} seconds.`,
        });
      }

      next();
    }
  );
};
