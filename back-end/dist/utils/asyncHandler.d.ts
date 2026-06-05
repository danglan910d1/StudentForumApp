import { RequestHandler } from "express";
/**
 * Hàm bọc (Wrapper) để tự động bắt lỗi cho các Controller bất đồng bộ (async/await).
 * Sử dụng Generics <T> để đại diện cho kiểu Controller HOÀN CHỈNH (Controller Function).
 * @param fn - Hàm Controller gốc (ví dụ: async (req: Request<GetUserParams>, res) => { ... }) (nhận Request, Response, NextFunction)
 */
export declare const asyncHandler: <T extends Function>(fn: T) => RequestHandler;
//# sourceMappingURL=asyncHandler.d.ts.map