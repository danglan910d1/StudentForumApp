/**
 * CORE: Exception Handlers
 * * Trách nhiệm: Định nghĩa các lỗi tùy chỉnh (Custom Errors) để truyền đạt thông tin lỗi rõ ràng.
 * * Nguyên tắc: Service Layer ném lỗi (throw), Global Error Handler bắt lỗi.
 */

// Lỗi cơ sở cho các lỗi tùy chỉnh
export class CustomError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Lỗi 400: Lỗi dữ liệu không hợp lệ từ Client
export class BadRequestError extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}

// Lỗi 401: Lỗi xác thực hoặc không có quyền truy cập
export class UnauthorizedError extends CustomError {
  constructor(message: string = "Unauthorized access or invalid credentials.") {
    super(message, 401);
  }
}

// Lỗi 403: Lỗi cấm truy cập (Có xác thực nhưng không có quyền)
export class ForbiddenError extends CustomError {
  constructor(message: string = "Access denied. Forbidden.") {
    super(message, 403);
  }
}

// Lỗi 404: Không tìm thấy tài nguyên
export class NotFoundError extends CustomError {
  constructor(message: string = "Resource not found.") {
    super(message, 404);
  }
}
