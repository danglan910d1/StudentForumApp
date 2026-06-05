/**
 * MIDDLEWARE: authMiddleware
 * * Trách nhiệm: Xác thực token JWT, trích xuất userId và userRole, gán vào req.
 * * Nguyên tắc JWT: Zero-Lookup (Không truy vấn DB để lấy role).
 * * CÓ THÊM BƯỚC TRA CỨU REDIS để kiểm tra Token đã bị Thu hồi (Revoked) chưa.
 */
import { Request, Response, NextFunction, RequestHandler } from "express";
/**
 * MIDDLEWARE: authMiddleware (Bắt buộc)
 * * @description Xác thực JWT, kiểm tra danh sách thu hồi (Redis) và gán danh tính vào Request.
 * @param {Request} req - Đối tượng Request chứa Header Authorization.
 * @param {Response} res - Đối tượng Response trả về lỗi 401 nếu Token không hợp lệ.
 * @param {NextFunction} next - Hàm callback chuyển tiếp.
 * @throws {JsonWebTokenError} Nếu token sai hoặc hết hạn.
 */
export declare const authMiddlewareImpl: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Xuất phiên bản đã được bọc của authMiddleware.
 * Nó đảm bảo rằng nếu có lỗi không được xử lý (ví dụ: lỗi kết nối Redis)
 * bên ngoài khối try...catch, nó sẽ được chuyển đến next(error).
 */
export declare const authMiddleware: RequestHandler;
//# sourceMappingURL=auth.d.ts.map