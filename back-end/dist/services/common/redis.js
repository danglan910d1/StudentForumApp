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
exports.getCache = getCache;
exports.setCache = setCache;
exports.invalidateCache = invalidateCache;
exports.incrementPostView = incrementPostView;
exports.togglePostLike = togglePostLike;
exports.getPostLikeCount = getPostLikeCount;
exports.checkRateLimit = checkRateLimit;
exports.clearRateLimitsByIdentifier = clearRateLimitsByIdentifier;
exports.handleLoginFailure = handleLoginFailure;
exports.clearLoginFailure = clearLoginFailure;
exports.isAccountLockedOut = isAccountLockedOut;
exports.cacheUser = cacheUser;
exports.getCacheUser = getCacheUser;
exports.addRevokedToken = addRevokedToken;
exports.isTokenRevoked = isTokenRevoked;
exports.reserveIdempotencyKey = reserveIdempotencyKey;
exports.releaseIdempotencyKey = releaseIdempotencyKey;
exports.saveIdempotencyResult = saveIdempotencyResult;
exports.getIdempotencyKey = getIdempotencyKey;
exports.setOTP = setOTP;
exports.getOTP = getOTP;
exports.deleteOTP = deleteOTP;
const redis = __importStar(require("redis"));
// Khởi tạo client Redis
// Đảm bảo cấu hình kết nối được lấy từ biến môi trường (ví dụ: REDIS_URL)
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});
redisClient.on("error", (err) => console.error("Redis Client Error", err));
// Kết nối Redis
async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Redis connected successfully.");
    }
}
// Khởi tạo và kết nối khi ứng dụng bắt đầu
connectRedis();
/**
 * Lấy dữ liệu từ cache theo key
 * @param key Khóa cache
 * @returns JSON object hoặc null
 */
async function getCache(key) {
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    }
    catch (e) {
        console.error(`Error fetching cache for key ${key}:`, e);
        return null;
    }
}
/**
 * Lưu dữ liệu vào cache
 * @param key Khóa cache
 * @param value Dữ liệu cần lưu (Object)
 * @param expirationInSeconds Thời gian sống (TTL) của cache
 */
async function setCache(key, value, expirationInSeconds = 3600) {
    try {
        const data = JSON.stringify(value);
        await redisClient.setEx(key, expirationInSeconds, data);
    }
    catch (e) {
        console.error(`Error setting cache for key ${key}:`, e);
    }
}
/**
 * Xóa cache theo pattern (ví dụ: 'posts:*')
 * @param pattern Pattern key (ví dụ: 'posts:*')
 */
async function invalidateCache(pattern) {
    try {
        let cursor = "0";
        do {
            // SCAN giúp tìm key mà không làm treo hệ thống
            const reply = await redisClient.scan(cursor, {
                MATCH: pattern,
                COUNT: 100, // Mỗi lần quét 100 keys
            });
            cursor = reply.cursor;
            const keys = reply.keys;
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
        } while (cursor !== "0");
        console.log(`Invalidated keys matching ${pattern}`);
    }
    catch (e) {
        console.error(`Error invalidating cache for pattern ${pattern}:`, e);
    }
}
/**
 * Tăng View Count cho Post
 * @param postId ID của bài viết
 */
async function incrementPostView(postId) {
    // Sử dụng INCR để tăng giá trị, TTL để tự động xóa key sau 1 ngày (ví dụ)
    const key = `views:${postId}`;
    const result = await redisClient.incr(key);
    // Đặt TTL chỉ khi view là 1 (key mới) để tránh reset bộ đếm
    if (result === 1) {
        await redisClient.expire(key, 86400); // 24 giờ
    }
}
// ----------------------------------------------------------------------
// CÁC HÀM XỬ LÝ LIKES (Dùng Sets để lưu ID người dùng đã thích)
// ----------------------------------------------------------------------
const LIKE_KEY = (postId) => `likes:post:${postId}`;
/**
 * Thêm hoặc xóa User ID khỏi tập hợp Likes của Post
 * @param postId ID Bài viết
 * @param userId ID Người dùng
 * @param action 'add' để thích, 'remove' để bỏ thích
 * @returns 1 nếu thành công, 0 nếu không thay đổi
 */
async function togglePostLike(postId, userId, action) {
    const key = LIKE_KEY(postId);
    if (action === "add") {
        // SADD: Thêm thành viên vào tập hợp
        return redisClient.sAdd(key, userId);
    }
    else {
        // SREM: Loại bỏ thành viên khỏi tập hợp
        return redisClient.sRem(key, userId);
    }
}
/**
 * Lấy số lượng Likes hiện tại từ Redis
 * @param postId ID Bài viết
 */
async function getPostLikeCount(postId) {
    const key = LIKE_KEY(postId);
    // SCARD: Lấy số lượng thành viên trong tập hợp
    return redisClient.sCard(key);
}
// ----------------------------------------------------------------------
// CÁC HÀM XỬ LÝ RATE LIMITING (Sử dụng INCR và EXPIRE)
// ----------------------------------------------------------------------
/**
 * Kiểm tra và giới hạn số lần truy cập dựa trên IP/ID.
 * @param keyPrefix Tiền tố khóa (ví dụ: 'rate:ip', 'rate:user')
 * @param identifier IP hoặc User ID
 * @param limit Số lần truy cập tối đa
 * @param windowInSeconds Khung thời gian (ví dụ: 60s)
 * @returns true nếu còn lượt, false nếu vượt quá giới hạn
 */
async function checkRateLimit(uniqueKey, // KHÓA DUY NHẤT (bao gồm prefix, identifier, và actionId)
limit, windowInSeconds) {
    const key = uniqueKey;
    // INCR: Tăng bộ đếm và trả về giá trị mới
    const currentCount = await redisClient.incr(key);
    // Đặt TTL (Thời gian sống) cho key chỉ khi nó là 1 (key mới)
    if (currentCount === 1) {
        await redisClient.expire(key, windowInSeconds);
    }
    return currentCount <= limit;
}
/**
 * Xóa tất cả Rate Limit Keys dựa trên một định danh và Prefix.
 * Thường dùng để xóa giới hạn IP cũ khi user đăng nhập thành công.
 * @param identifier IP hoặc User ID
 * @param keyPrefixPrefix Ví dụ: 'rate:auth' hoặc 'rate:general'
 */
async function clearRateLimitsByIdentifier(identifier, keyPrefix) {
    // Sử dụng KEYS hoặc SCAN để tìm tất cả các key bắt đầu bằng prefix:identifier:*
    const pattern = `${keyPrefix}:${identifier}:*`;
    await invalidateCache(pattern); // Tái sử dụng hàm invalidateCache
}
// HẰNG SỐ BẢO MẬT MỚI: (Giả định được định nghĩa hoặc import)
const EMAIL_FAIL_LIMIT = 5; // Số lần thử sai mật khẩu tối đa
const EMAIL_LOCKOUT_SECONDS = 30 * 60; // Thời gian khóa tài khoản tạm thời (30 phút)
/**
 * Xử lý thất bại đăng nhập theo Email: Tăng bộ đếm và kiểm tra khóa.
 * @param email Email của user
 * @param userIp IP của người dùng (Đã được truyền từ req.ip)
 */
async function handleLoginFailure(email, userIp) {
    const key = `fail:email:${email.toLowerCase()}`;
    const lockoutKey = `lockout:email:${email.toLowerCase()}`;
    // Tăng bộ đếm thất bại
    const currentFailures = await redisClient.incr(key);
    // Đặt TTL (30 phút) cho bộ đếm thất bại chỉ khi nó là 1
    if (currentFailures === 1) {
        await redisClient.expire(key, EMAIL_LOCKOUT_SECONDS);
    }
    // Khóa tài khoản nếu vượt quá giới hạn
    if (currentFailures >= EMAIL_FAIL_LIMIT) {
        // Thiết lập khóa tài khoản tạm thời
        await redisClient.set(lockoutKey, "true", {
            EX: EMAIL_LOCKOUT_SECONDS, // Chuyển EX và TTL vào đối tượng Options
        }); // Xóa bộ đếm thất bại để tránh lỗi
        await redisClient.del(key);
        // GIẢI PHÓNG GIỚI HẠN IP CHUNG (BẮT BUỘC đặt trong if)
        await clearRateLimitsByIdentifier(userIp, "rate:auth");
        await clearRateLimitsByIdentifier(userIp, "rate:general");
    }
}
/**
 * Xóa trạng thái thất bại và khóa tạm thời của tài khoản.
 * Phải được gọi khi user đăng nhập thành công (mật khẩu đúng).
 *
 * @param email Email của user
 */
// Hàm này phải được gọi khi ĐĂNG NHẬP THÀNH CÔNG!
async function clearLoginFailure(email) {
    const processedEmail = email.toLowerCase();
    const failureKey = `fail:email:${processedEmail}`; // Key đếm thất bại
    const lockoutKey = `lockout:email:${processedEmail}`; // Key trạng thái khóa
    // await redisClient.del(key); // Quan trọng: Xóa bộ đếm (Ví dụ: giá trị 4)
    // await redisClient.del(lockoutKey); // Xóa trạng thái khóa (phòng trường hợp người dùng nhớ mật khẩu trước khi hết hạn)
    await Promise.all([redisClient.del(failureKey), redisClient.del(lockoutKey)]);
}
/**
 * Kiểm tra xem tài khoản có đang bị khóa tạm thời do nhập sai mật khẩu quá nhiều lần không.
 * @param email Email của user
 * @returns true nếu bị khóa
 */
async function isAccountLockedOut(email) {
    const lockoutKey = `lockout:email:${email.toLowerCase()}`;
    const isLocked = await redisClient.get(lockoutKey);
    return isLocked === "true";
}
// ----------------------------------------------------------------------
// CÁC HÀM XỬ LÝ DỮ LIỆU NGƯỜI DÙNG
// ----------------------------------------------------------------------
/**
 * Lưu thông tin người dùng vào cache (Ví dụ: Profile cơ bản, vai trò)
 * @param userId ID người dùng
 * @param userData Dữ liệu người dùng cần lưu (Object)
 * @param expirationInSeconds Thời gian sống (TTL) của cache (Mặc định 1 giờ)
 */
async function cacheUser(userId, userData, expirationInSeconds = 3600) {
    const key = `user:profile:${userId}`;
    await setCache(key, userData, expirationInSeconds);
}
/**
 * Lấy thông tin người dùng từ cache
 * @param userId ID người dùng
 * @returns Dữ liệu người dùng hoặc null
 */
async function getCacheUser(userId) {
    const key = `user:profile:${userId}`;
    return getCache(key);
}
// ----------------------------------------------------------------------
// CÁC HÀM XỬ LÝ REVOCATION LIST (TOKEN/SESSION THU HỒI)
// ----------------------------------------------------------------------
const REVOKED_TOKEN_PREFIX = "revoked:token";
/**
 * Thêm ID Token vào danh sách thu hồi.
 * @param jwtId ID duy nhất của Token (nên dùng JTI hoặc userId + timestamp).
 * @param expirationInSeconds Thời gian sống (TTL) của token, sau đó key sẽ tự xóa.
 */
async function addRevokedToken(jwtId, expirationInSeconds) {
    const key = `${REVOKED_TOKEN_PREFIX}:${jwtId}`;
    // Lưu giá trị '1' (hoặc bất kỳ giá trị nào) với TTL
    await redisClient.setEx(key, expirationInSeconds, "1");
}
/**
 * Kiểm tra xem ID Token đã bị thu hồi hay chưa.
 * @param jwtId ID Token
 * @returns true nếu Token đã bị thu hồi (tồn tại trong Redis), false nếu chưa.
 */
async function isTokenRevoked(jwtId) {
    const key = `${REVOKED_TOKEN_PREFIX}:${jwtId}`;
    try {
        const exists = await redisClient.exists(key);
        return exists === 1;
    }
    catch (e) {
        console.error(`Error checking revocation for key ${key}:`, e);
        // Tùy chọn: Bạn có thể chọn trả về false để chấp nhận token nếu Redis bị lỗi
        // hoặc ném lại lỗi để middleware/controller xử lý.
        throw e;
    }
}
// ----------------------------------------------------------------------
// CÁC HÀM XỬ LÝ DUPPICATE REQUEST
// ----------------------------------------------------------------------
/**
 * Kiểm tra và đặt Idempotency Key với TTL.
 * Sử dụng SET key value NX EX seconds.
 * @param requestId Idempotency Key (x-request-id)
 * @param expirationInSeconds Thời gian sống của key (ví dụ: 60s)
 * @returns true nếu key được đặt thành công (Request MỚI), false nếu key đã tồn tại (Request TRÙNG LẶP).
 */
async function reserveIdempotencyKey(requestId, expirationInSeconds = 60) {
    const key = `idempotency:${requestId}`;
    // SETNX: Thiết lập giá trị key chỉ khi key chưa tồn tại (NX)
    // SETEX: Đặt thời gian sống (EX)
    // Nếu lệnh SETNX thành công (trả về 'OK'), nghĩa là key chưa tồn tại -> Request MỚI
    const result = await redisClient.set(key, "processing", // Giá trị (có thể là 'processing' hoặc bất kỳ thứ gì)
    {
        NX: true, // Chỉ đặt nếu key KHÔNG tồn tại
        EX: expirationInSeconds, // Đặt thời gian sống
    });
    // Nếu result là 'OK', thì key đã được đặt thành công (Request MỚI)
    return result === "OK";
}
/**
 * Xóa Idempotency Key sau khi request đã hoàn tất.
 * @param requestId Idempotency Key (x-request-id)
 */
async function releaseIdempotencyKey(requestId) {
    const key = `idempotency:${requestId}`;
    await redisClient.del(key);
}
// Thêm hàm để Lưu kết quả cuối cùng (Full Idempotency)
// Sử dụng SET key value XX EX seconds để thay thế giá trị chỉ khi nó đã tồn tại (XX)
async function saveIdempotencyResult(requestId, statusCode, responseBody, expirationInSeconds = 600) {
    const key = `idempotency:${requestId}`;
    const resultData = JSON.stringify({ status: statusCode, body: responseBody });
    // Chỉ SET nếu key đã TỒN TẠI (XX), và cập nhật TTL.
    // Điều này chỉ nên được gọi sau khi request đã hoàn thành xử lý lần đầu tiên.
    const result = await redisClient.set(key, resultData, {
        XX: true,
        EX: expirationInSeconds,
    });
    return result === "OK";
}
async function getIdempotencyKey(requestId) {
    const key = `idempotency:${requestId}`;
    return redisClient.get(key);
}
// ----------------------------------------------------------------------
// CÁC HÀM XỬ LÝ OTP (Xác thực 2 lớp / Đổi mật khẩu)
// ----------------------------------------------------------------------
/**
 * Lưu mã OTP vào Redis với thời gian hết hạn ngắn.
 * @param userId ID người dùng
 * @param otp Mã số OTP (thường là 6 số)
 * @param action Loại tác vụ (ví dụ: 'change-password', 'reset-password')
 * @param expirationInSeconds Thời gian sống của OTP (Mặc định 5 phút = 300s)
 */
async function setOTP(userId, otp, action = "reset-password", // Cập nhật mặc định thành reset-password
expirationInSeconds = 300) {
    const key = `otp:${action}:${userId}`;
    // Lưu OTP dạng chuỗi thường, không cần JSON.stringify nếu chỉ là mã số
    await redisClient.setEx(key, expirationInSeconds, otp);
}
/**
 * Lấy mã OTP đang lưu trong Redis để so sánh.
 * @param userId ID người dùng
 * @param action Loại tác vụ
 * @returns Mã OTP hoặc null nếu hết hạn/không tồn tại
 */
async function getOTP(userId, action = "reset-password") {
    const key = `otp:${action}:${userId}`;
    return redisClient.get(key);
}
/**
 * Xóa OTP ngay lập tức sau khi xác thực thành công (Tránh dùng lại).
 * @param userId ID người dùng
 * @param action Loại tác vụ
 */
async function deleteOTP(userId, action = "reset-password") {
    const key = `otp:${action}:${userId}`;
    await redisClient.del(key);
}
exports.default = redisClient;
//# sourceMappingURL=redis.js.map