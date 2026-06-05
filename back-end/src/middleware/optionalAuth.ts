import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/express";
import { isTokenRevoked } from "../services/common/redis";
import { asyncHandler } from "../utils/asyncHandler";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

interface JwtPayload {
  id: string;
  role: "user" | "admin";
  jti?: string;
}

/**
 * MIDDLEWARE: optionalAuth
 * * Trách nhiệm: Thử xác thực token nếu có.
 * * Nếu có Token hợp lệ: Gán userId và userRole vào req (như authMiddleware).
 * * Nếu KHÔNG có Token hoặc Token lỗi: Vẫn cho đi tiếp (req.userRole sẽ là undefined).
 */

/**
 * MIDDLEWARE: optionalAuth (Tùy chọn)
 * * @description Thử xác thực người dùng. Nếu thành công thì gán quyền, nếu thất bại vẫn cho đi tiếp như khách (Guest).
 * @param {Request} req - Đối tượng Request.
 * @param {Response} res - Đối tượng Response.
 * @param {NextFunction} next - Luôn luôn được gọi bất kể Token có hợp lệ hay không.
 */

export const optionalAuthImpl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  // 1. Nếu không có token, cho đi tiếp luôn (Guest)
  if (!token) {
    return next();
  }

  try {
    // 2. Thử xác thực token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // 3. Kiểm tra danh sách thu hồi trong Redis (Nếu có jti)
    if (decoded.jti) {
      const isRevoked = await isTokenRevoked(decoded.jti);
      if (isRevoked) {
        // Nếu token bị thu hồi, ta coi như không có token (hoặc báo lỗi tùy bạn,
        // nhưng thường optional sẽ coi như guest để không chặn người dùng)
        return next();
      }
    }

    // 4. Gán thông tin vào request nếu mọi thứ OK
    (req as AuthenticatedRequest).userId = decoded.id;
    (req as AuthenticatedRequest).userRole = decoded.role;

    next();
  } catch (error) {
    // 5. Nếu token lỗi (hết hạn, sai key), vẫn cho đi tiếp với tư cách khách
    // Không trả về 401 ở đây vì đây là "Optional"
    console.log("Optional Auth Error:", error);
    next();
  }
};

export const optionalAuth: RequestHandler = asyncHandler(optionalAuthImpl);
