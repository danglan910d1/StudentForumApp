"use strict";
/**
 * CORE: Exception Handlers
 * * Trách nhiệm: Định nghĩa các lỗi tùy chỉnh (Custom Errors) để truyền đạt thông tin lỗi rõ ràng.
 * * Nguyên tắc: Service Layer ném lỗi (throw), Global Error Handler bắt lỗi.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.CustomError = void 0;
// Lỗi cơ sở cho các lỗi tùy chỉnh
class CustomError extends Error {
    statusCode;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
// Lỗi 400: Lỗi dữ liệu không hợp lệ từ Client
class BadRequestError extends CustomError {
    constructor(message) {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
// Lỗi 401: Lỗi xác thực hoặc không có quyền truy cập
class UnauthorizedError extends CustomError {
    constructor(message = "Unauthorized access or invalid credentials.") {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
// Lỗi 403: Lỗi cấm truy cập (Có xác thực nhưng không có quyền)
class ForbiddenError extends CustomError {
    constructor(message = "Access denied. Forbidden.") {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
// Lỗi 404: Không tìm thấy tài nguyên
class NotFoundError extends CustomError {
    constructor(message = "Resource not found.") {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=exceptions.js.map