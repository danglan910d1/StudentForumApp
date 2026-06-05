import { Request, Response, NextFunction } from "express";
import * as crypto from "crypto";
import {
  reserveIdempotencyKey,
  getIdempotencyKey,
} from "../services/common/redis";

// Sử dụng một Set toàn cục để mô phỏng lưu trữ Idempotency Key trong Redis.
// LƯU Ý: Phải dùng Redis/Memcached/store chung cho môi trường đa server.
declare global {
  var processingRequests: Set<string>;
}

if (!global.processingRequests) {
  global.processingRequests = new Set<string>();
}

/**
 * Middleware chống Duplicate Request bằng Idempotency Key (x-request-id).
 * Chỉ nên áp dụng cho các route POST/PUT có tác dụng phụ (side effects).
 */
export const preventDuplicateRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Lấy hoặc tạo Idempotency Key
  let requestId = req.headers["x-request-id"] as string;

  if (!requestId) {
    // Tự động tạo Key nếu client quên gửi (nên yêu cầu client gửi)
    requestId = crypto.randomUUID();
    req.headers["x-request-id"] = requestId;
    console.warn(`[IDEMPOTENCY] Generated new request ID: ${requestId}`);
  }

  // 2. Kiểm tra và Đánh dấu Request đang xử lý
  try {
    const isNewRequest = await reserveIdempotencyKey(requestId, 60); // TTL 60s

    if (!isNewRequest) {
      // Key đã tồn tại -> Request TRÙNG LẶP
      const keyContent = await getIdempotencyKey(requestId); // Đọc nội dung key
      if (!keyContent || keyContent === "processing") {
        // Key đang trong trạng thái PROCESSING (hoặc không tìm thấy key vì TTL quá ngắn)
        console.warn(
          `[IDEMPOTENCY] Duplicate request blocked (Processing): ${requestId}`
        );
        return res
          .status(429)
          .json({ error: "Request is already processing. Please wait." });
      } else {
        // Key chứa KẾT QUẢ (Full Idempotency)
        console.log(`[IDEMPOTENCY] Returning cached result for: ${requestId}`);
        const cachedResult = JSON.parse(keyContent); // Trả về kết quả cũ
        res.status(cachedResult.status).send(cachedResult.body);
        return; // Dừng xử lý middleware/controller
      }
    }
    // 3. LOẠI BỎ LOGIC releaseIdempotencyKey (Dùng saveIdempotencyResult trong Controller)
    // res.on("finish", ...) logic cũ đã bị xóa.
    res.setHeader("x-request-id", requestId);
    next();
  } catch (error) {
    // Xử lý lỗi Redis (ví dụ: Redis bị sập)
    console.error(`[IDEMPOTENCY] Redis error:`, error);
    // Tùy chọn: Cho phép request đi qua nếu Redis bị lỗi để tránh Service Outage
    next();
  }
};
