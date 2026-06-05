"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.authMiddlewareImpl = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // Thư viện đã có định nghĩa kiểu (@types/jsonwebtoken)
const redis_1 = require("../services/common/redis");
const asyncHandler_1 = require("../utils/asyncHandler");
// Lấy secret key từ biến môi trường hoặc dùng giá trị mặc định
const JWT_SECRET = process.env.JWT_SECRET || "secret";
/**
 * MIDDLEWARE: authMiddleware (Bắt buộc)
 * * @description Xác thực JWT, kiểm tra danh sách thu hồi (Redis) và gán danh tính vào Request.
 * @param {Request} req - Đối tượng Request chứa Header Authorization.
 * @param {Response} res - Đối tượng Response trả về lỗi 401 nếu Token không hợp lệ.
 * @param {NextFunction} next - Hàm callback chuyển tiếp.
 * @throws {JsonWebTokenError} Nếu token sai hoặc hết hạn.
 */
// Middleware kiểm tra và xác thực token JWT
const authMiddlewareImpl = async (req, res, next) => {
    // Lấy token từ header Authorization (dạng: 'Bearer TOKEN')
    const token = req.headers.authorization?.split(" ")[1];
    // 1. Kiểm tra token tồn tại
    if (!token) {
        return res.status(401).json({ error: "No token, authorization denied" });
    }
    try {
        // 2. Xác thực token và giải mã payload
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // KIỂM TRA DANH SÁCH THU HỒI TRONG REDIS
        if (decoded.jti) {
            // isTokenRevoked là hàm bất đồng bộ, có thể ném lỗi
            const isRevoked = await (0, redis_1.isTokenRevoked)(decoded.jti);
            if (isRevoked) {
                // Token bị thu hồi: Dừng ngay lập tức
                return res.status(401).json({ error: "Token has been revoked" });
            }
        }
        // 3. Gán ID người dùng đã xác thực vào request object
        req.userId = decoded.id;
        // 4. Gán VAI TRÒ (ROLE) người dùng vào request object (Tối ưu hiệu suất!)
        req.userRole = decoded.role;
        // Chuyển sang middleware hoặc controller tiếp theo
        next();
    }
    catch (error) {
        // 5. Xử lý lỗi token không hợp lệ (hết hạn, sai chữ ký,...)
        // Vì lỗi đã được xử lý TẠI ĐÂY, nó sẽ không đi qua asyncHandler.
        return res.status(401).json({ error: "Invalid token" });
    }
};
exports.authMiddlewareImpl = authMiddlewareImpl;
// ----------------------------------------------------------------------
// 2. EXPORT HÀM ĐÃ ĐƯỢC BỌC BẰNG asyncHandler
// ----------------------------------------------------------------------
/**
 * Xuất phiên bản đã được bọc của authMiddleware.
 * Nó đảm bảo rằng nếu có lỗi không được xử lý (ví dụ: lỗi kết nối Redis)
 * bên ngoài khối try...catch, nó sẽ được chuyển đến next(error).
 */
exports.authMiddleware = (0, asyncHandler_1.asyncHandler)(exports.authMiddlewareImpl);
//# sourceMappingURL=auth.js.map