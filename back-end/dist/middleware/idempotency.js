"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.preventDuplicateRequest = void 0;
const crypto = __importStar(require("crypto"));
const redis_1 = require("../services/common/redis");
if (!global.processingRequests) {
    global.processingRequests = new Set();
}
/**
 * Middleware chống Duplicate Request bằng Idempotency Key (x-request-id).
 * Chỉ nên áp dụng cho các route POST/PUT có tác dụng phụ (side effects).
 */
const preventDuplicateRequest = async (req, res, next) => {
    // 1. Lấy hoặc tạo Idempotency Key
    let requestId = req.headers["x-request-id"];
    if (!requestId) {
        // Tự động tạo Key nếu client quên gửi (nên yêu cầu client gửi)
        requestId = crypto.randomUUID();
        req.headers["x-request-id"] = requestId;
        console.warn(`[IDEMPOTENCY] Generated new request ID: ${requestId}`);
    }
    // 2. Kiểm tra và Đánh dấu Request đang xử lý
    try {
        const isNewRequest = await (0, redis_1.reserveIdempotencyKey)(requestId, 60); // TTL 60s
        if (!isNewRequest) {
            // Key đã tồn tại -> Request TRÙNG LẶP
            const keyContent = await (0, redis_1.getIdempotencyKey)(requestId); // Đọc nội dung key
            if (!keyContent || keyContent === "processing") {
                // Key đang trong trạng thái PROCESSING (hoặc không tìm thấy key vì TTL quá ngắn)
                console.warn(`[IDEMPOTENCY] Duplicate request blocked (Processing): ${requestId}`);
                return res
                    .status(429)
                    .json({ error: "Request is already processing. Please wait." });
            }
            else {
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
    }
    catch (error) {
        // Xử lý lỗi Redis (ví dụ: Redis bị sập)
        console.error(`[IDEMPOTENCY] Redis error:`, error);
        // Tùy chọn: Cho phép request đi qua nếu Redis bị lỗi để tránh Service Outage
        next();
    }
};
exports.preventDuplicateRequest = preventDuplicateRequest;
//# sourceMappingURL=idempotency.js.map