import { Request, Response, NextFunction, RequestHandler } from "express";
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
export declare const optionalAuthImpl: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: RequestHandler;
//# sourceMappingURL=optionalAuth.d.ts.map