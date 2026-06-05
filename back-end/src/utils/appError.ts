// src/utils/appError.ts
export class AppError extends Error {
  constructor(public statusCode: number, public message: string) {
    super(message);
    // Đảm bảo prototype được thiết lập đúng để instanceOf hoạt động
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
