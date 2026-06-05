/**
 * CORE: Exception Handlers
 * * Trách nhiệm: Định nghĩa các lỗi tùy chỉnh (Custom Errors) để truyền đạt thông tin lỗi rõ ràng.
 * * Nguyên tắc: Service Layer ném lỗi (throw), Global Error Handler bắt lỗi.
 */
export declare class CustomError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
export declare class BadRequestError extends CustomError {
    constructor(message: string);
}
export declare class UnauthorizedError extends CustomError {
    constructor(message?: string);
}
export declare class ForbiddenError extends CustomError {
    constructor(message?: string);
}
export declare class NotFoundError extends CustomError {
    constructor(message?: string);
}
//# sourceMappingURL=exceptions.d.ts.map