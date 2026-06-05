"use strict";
/**
 * CORE: Standardized API Responses
 * * Trách nhiệm: Chuẩn hóa mọi phản hồi JSON thành công.
 * * Nguyên tắc: Controller luôn trả về một đối tượng Response chuẩn (sử dụng Factory Function thay vì Class).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuccessResponse = void 0;
/**
 * Hàm tạo (Factory Function) để chuẩn hóa đối tượng phản hồi thành công.
 *
 * @param statusCode Mã trạng thái HTTP (Ví dụ: 200, 201).
 * @param message Thông báo kết quả.
 * @param data Dữ liệu chính cần trả về.
 * @param meta Thông tin phân trang hoặc bổ sung.
 * @returns Đối tượng phản hồi JSON chuẩn hóa.
 */
const createSuccessResponse = (statusCode, message, data = {}, meta = {}) => {
    return {
        statusCode: statusCode,
        message: message,
        data: data,
        meta: meta,
    };
};
exports.createSuccessResponse = createSuccessResponse;
//# sourceMappingURL=response.js.map