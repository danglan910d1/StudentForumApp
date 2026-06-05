"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
/**
 * Hàm bọc (Wrapper) để tự động bắt lỗi cho các Controller bất đồng bộ (async/await).
 * Sử dụng Generics <T> để đại diện cho kiểu Controller HOÀN CHỈNH (Controller Function).
 * @param fn - Hàm Controller gốc (ví dụ: async (req: Request<GetUserParams>, res) => { ... }) (nhận Request, Response, NextFunction)
 */
const asyncHandler = (fn) => (req, res, next) => {
    // Lấy hàm gốc và bọc nó trong Promise.
    // Ép kiểu (type casting) req thành kiểu mà hàm gốc (fn) mong đợi (req as T)
    // là nguyên nhân gây ra lỗi Type Incompatibility.
    // Chúng ta sẽ gọi hàm gốc với các tham số gốc của Express và để lỗi tự xảy ra,
    // sau đó bắt lỗi bằng .catch(next)
    // Sử dụng Promise.resolve().catch(next) là mô hình tiêu chuẩn để bắt lỗi async.
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=asyncHandler.js.map