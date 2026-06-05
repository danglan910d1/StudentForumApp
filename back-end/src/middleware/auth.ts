/**
 * MIDDLEWARE: authMiddleware
 * * Trách nhiệm: Xác thực token JWT, trích xuất userId và userRole, gán vào req.
 * * Nguyên tắc JWT: Zero-Lookup (Không truy vấn DB để lấy role).
 * * CÓ THÊM BƯỚC TRA CỨU REDIS để kiểm tra Token đã bị Thu hồi (Revoked) chưa.
 */
import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken"; // Thư viện đã có định nghĩa kiểu (@types/jsonwebtoken)
import { AuthenticatedRequest } from "../types/express";
import { isTokenRevoked } from "../services/common/redis";
import { asyncHandler } from "../utils/asyncHandler";

// Lấy secret key từ biến môi trường hoặc dùng giá trị mặc định
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Định nghĩa kiểu payload JWT (Phải khớp với generateToken - hàm mã hoá)
interface JwtPayload {
  id: string;
  role: "user" | "admin";
  // THÊM TRƯỜNG JTI (JWT ID) ĐỂ PHỤC VỤ VIỆC THU HỒI
  jti?: string; // JTI là ID duy nhất của token (cần phải thêm khi generate token)
}

/**
 * MIDDLEWARE: authMiddleware (Bắt buộc)
 * * @description Xác thực JWT, kiểm tra danh sách thu hồi (Redis) và gán danh tính vào Request.
 * @param {Request} req - Đối tượng Request chứa Header Authorization.
 * @param {Response} res - Đối tượng Response trả về lỗi 401 nếu Token không hợp lệ.
 * @param {NextFunction} next - Hàm callback chuyển tiếp.
 * @throws {JsonWebTokenError} Nếu token sai hoặc hết hạn.
 */

// Middleware kiểm tra và xác thực token JWT
export const authMiddlewareImpl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Lấy token từ header Authorization (dạng: 'Bearer TOKEN')
  const token = req.headers.authorization?.split(" ")[1];

  // 1. Kiểm tra token tồn tại
  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    // 2. Xác thực token và giải mã payload
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // KIỂM TRA DANH SÁCH THU HỒI TRONG REDIS
    if (decoded.jti) {
      // isTokenRevoked là hàm bất đồng bộ, có thể ném lỗi
      const isRevoked = await isTokenRevoked(decoded.jti);

      if (isRevoked) {
        // Token bị thu hồi: Dừng ngay lập tức
        return res.status(401).json({ error: "Token has been revoked" });
      }
    }

    // 3. Gán ID người dùng đã xác thực vào request object
    (req as AuthenticatedRequest).userId = decoded.id;

    // 4. Gán VAI TRÒ (ROLE) người dùng vào request object (Tối ưu hiệu suất!)
    (req as AuthenticatedRequest).userRole = decoded.role;

    // Chuyển sang middleware hoặc controller tiếp theo
    next();
  } catch (error) {
    // 5. Xử lý lỗi token không hợp lệ (hết hạn, sai chữ ký,...)
    // Vì lỗi đã được xử lý TẠI ĐÂY, nó sẽ không đi qua asyncHandler.
    return res.status(401).json({ error: "Invalid token" });
  }
};

// ----------------------------------------------------------------------
// 2. EXPORT HÀM ĐÃ ĐƯỢC BỌC BẰNG asyncHandler
// ----------------------------------------------------------------------

/**
 * Xuất phiên bản đã được bọc của authMiddleware.
 * Nó đảm bảo rằng nếu có lỗi không được xử lý (ví dụ: lỗi kết nối Redis)
 * bên ngoài khối try...catch, nó sẽ được chuyển đến next(error).
 */
export const authMiddleware: RequestHandler = asyncHandler(authMiddlewareImpl);
