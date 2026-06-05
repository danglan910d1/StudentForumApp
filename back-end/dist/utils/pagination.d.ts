import { Model, Document, PipelineStage } from "mongoose";
interface PaginationResult<T> {
    items: T[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
}
/**
 * Hàm tiện ích để thực hiện truy vấn và tính toán phân trang chung.
 *
 * @param Model - Mongoose Model (User, Post, Comment)
 * @param filter - Bộ lọc truy vấn MongoDB
 * @param sort - Quy tắc sắp xếp
 * @param pageStr - Số trang hiện tại (string từ req.query)
 * @param limitStr - Số lượng item trên mỗi trang (string từ req.query)
 * @param selectFields - Các trường cần chọn (optional)
 * @returns PaginationResult
 */
export declare const paginate: <T extends Document>(Model: Model<T>, filter: any, sort: any, pageStr: string | undefined, limitStr: string | undefined, selectFields?: string | null, populateFields?: {
    path: string;
    select: string;
}[]) => Promise<PaginationResult<T>>;
/**
 * Hàm tiện ích để thực hiện phân trang sử dụng MongoDB Aggregation Pipeline.
 * Dùng cho các truy vấn phức tạp (như getPosts) để loại bỏ N+1 Query bằng $lookup.
 *
 * @param Model - Mongoose Model
 * @param pipeline - Mảng các Aggregation Stages
 * @param pageStr - Số trang hiện tại
 * @param limitStr - Số lượng item trên mỗi trang
 * @returns PaginationResult
 */
export declare const paginateAggregation: <T>(Model: Model<any>, pipeline: PipelineStage[], pageStr: string | undefined, limitStr: string | undefined) => Promise<PaginationResult<T>>;
export {};
//# sourceMappingURL=pagination.d.ts.map