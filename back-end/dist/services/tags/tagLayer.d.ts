import { Types } from "mongoose";
export interface ProcessedTagsResult {
    validTagIds: Types.ObjectId[];
    pendingTagIds: Types.ObjectId[];
    warning?: string | undefined;
}
/**
 * Xử lý đầu vào Tag hỗn hợp (ID và Tên) để phân loại và tạo Tag mới (Pending) nếu cần.
 * Đây là logic nghiệp vụ cốt lõi về kiểm soát tính duy nhất của Tag.
 * @param tags Mảng IDs và Tên Tag từ input của người dùng.
 * @param userId ID của người dùng tạo bài viết (để gán Tag mới).
 * @param topicId ID của Topic liên quan (để gán cho Tag mới).
 * @returns Object chứa hai mảng ID đã được phân loại (validTagIds và pendingTagIds).
 */
export declare const processTags: (tags: string[], userId: string, topicId: Types.ObjectId) => Promise<ProcessedTagsResult>;
//# sourceMappingURL=tagLayer.d.ts.map