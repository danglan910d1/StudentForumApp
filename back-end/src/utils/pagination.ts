import { Model, Document, PipelineStage } from "mongoose";
import { DEFAULT_PAGE, DEFAULT_LIMIT } from "../config/constants"; // Sử dụng hằng số

// Định nghĩa Interface cho kết quả phân trang
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
export const paginate = async <T extends Document>(
  Model: Model<T>,
  filter: any,
  sort: any,
  pageStr: string | undefined,
  limitStr: string | undefined,
  selectFields?: string | null,
  populateFields?: { path: string; select: string }[]
): Promise<PaginationResult<T>> => {
  const pageNum = parseInt(pageStr as string) || DEFAULT_PAGE;
  const limitNum = parseInt(limitStr as string) || DEFAULT_LIMIT;
  const skip = (pageNum - 1) * limitNum;

  // 1. Tính tổng số lượng (Tốn kém I/O)
  const totalItems = await Model.countDocuments(filter);

  // 2. Xây dựng truy vấn chính
  let query = Model.find(filter).sort(sort).skip(skip).limit(limitNum);

  if (selectFields) {
    query = query.select(selectFields);
  }

  if (populateFields && populateFields.length > 0) {
    populateFields.forEach((p) => {
      query = query.populate(p);
    });
  }

  // 3. Thực hiện truy vấn và trả về kết quả
  const items = await query.exec();

  return {
    items: items as T[],
    currentPage: pageNum,
    totalPages: Math.ceil(totalItems / limitNum),
    totalItems: totalItems,
    limit: limitNum,
  };
};

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
export const paginateAggregation = async <T>(
  Model: Model<any>,
  pipeline: PipelineStage[],
  pageStr: string | undefined,
  limitStr: string | undefined
): Promise<PaginationResult<T>> => {
  const pageNum = parseInt(pageStr as string) || DEFAULT_PAGE;
  const limitNum = parseInt(limitStr as string) || DEFAULT_LIMIT;
  const skip = (pageNum - 1) * limitNum;

  // 1. Tạo Pipeline để lấy dữ liệu (áp dụng $skip và $limit)
  const dataPipeline: PipelineStage[] = [
    ...pipeline,
    { $skip: skip },
    { $limit: limitNum },
  ];

  // 2. Tạo Pipeline để tính tổng số lượng (dùng $count)
  const countPipeline: PipelineStage[] = [...pipeline, { $count: "total" }];

  // 3. Thực hiện truy vấn song song (Đảm bảo hiệu suất)
  const [itemsResult, countResult] = await Promise.all([
    Model.aggregate(dataPipeline).exec(),
    Model.aggregate(countPipeline).exec(),
  ]);

  const totalItems = countResult.length > 0 ? countResult[0].total : 0;

  return {
    items: itemsResult as T[],
    currentPage: pageNum,
    totalPages: Math.ceil(totalItems / limitNum),
    totalItems: totalItems,
    limit: limitNum,
  };
};
