import { redisRateLimiter } from "../config/rateLimit";

// Định nghĩa cấu hình Rate Limit cho từng loại endpoint:
// 1. Limiter Đăng nhập/Đăng ký (Cần giới hạn nghiêm ngặt hơn)
export const authLimiter = redisRateLimiter(100, 5 * 60, "rate:auth"); // 100 lần / 5 phút
// 2. Limiter Đăng xuất (Rất nhẹ nhàng)
export const logoutLimiter = redisRateLimiter(60, 5 * 60, "rate:logout"); // 60 lần / 5 phút
// 3. Limiter chung cho Read (100 requests / 15 phút, dùng cho Read/Public)
export const generalLimiter = redisRateLimiter(100, 15 * 60, "rate:general");
// 4. Limiter nhạy cảm cần xác thực, dùng cho post và put (10 requests / 5 phút, dùng cho Write/Auth)
export const sensitiveLimiter = redisRateLimiter(13, 5 * 60, "rate:sensitive");
