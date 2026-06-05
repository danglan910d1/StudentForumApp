/**
 * CORE: Standardized API Responses
 * * Trách nhiệm: Chuẩn hóa mọi phản hồi JSON thành công.
 * * Nguyên tắc: Controller luôn trả về một đối tượng Response chuẩn (sử dụng Factory Function thay vì Class).
 */
interface SuccessResponseData {
    statusCode: number;
    message: string;
    data: any;
    meta: any;
}
/**
 * Hàm tạo (Factory Function) để chuẩn hóa đối tượng phản hồi thành công.
 *
 * @param statusCode Mã trạng thái HTTP (Ví dụ: 200, 201).
 * @param message Thông báo kết quả.
 * @param data Dữ liệu chính cần trả về.
 * @param meta Thông tin phân trang hoặc bổ sung.
 * @returns Đối tượng phản hồi JSON chuẩn hóa.
 */
export declare const createSuccessResponse: (statusCode: number, message: string, data?: any, meta?: any) => SuccessResponseData;
export {};
//# sourceMappingURL=response.d.ts.map