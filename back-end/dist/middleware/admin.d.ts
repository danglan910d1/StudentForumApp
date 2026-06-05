/**
 * MIDDLEWARE: adminMiddleware
 * * Trách nhiệm: Kiểm tra quyền Admin (Sử dụng Zero-Lookup từ JWT payload).
 * * Nguyên tắc RBAC: Quyền 403 (Forbidden) nếu user không phải Admin.
 */
import { Request, Response, NextFunction } from "express";
/**
 * MIDDLEWARE: adminMiddleware
 * * @description Kiểm tra quyền Admin dựa trên userRole đã được gán từ authMiddleware.
 * @param {Request} req - Đối tượng Request từ Express (Phải được ép kiểu về AuthenticatedRequest).
 * @param {Response} res - Đối tượng Response để trả về lỗi 403 nếu không đủ quyền.
 * @param {NextFunction} next - Hàm callback để chuyển sang Middleware/Controller tiếp theo.
 * @returns {void}
 */
export declare const adminMiddleware: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=admin.d.ts.map