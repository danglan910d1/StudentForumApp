"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateAggregation = exports.paginate = void 0;
const constants_1 = require("../config/constants"); // Sử dụng hằng số
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
const paginate = async (Model, filter, sort, pageStr, limitStr, selectFields, populateFields) => {
    const pageNum = parseInt(pageStr) || constants_1.DEFAULT_PAGE;
    const limitNum = parseInt(limitStr) || constants_1.DEFAULT_LIMIT;
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
        items: items,
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems: totalItems,
        limit: limitNum,
    };
};
exports.paginate = paginate;
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
const paginateAggregation = async (Model, pipeline, pageStr, limitStr) => {
    const pageNum = parseInt(pageStr) || constants_1.DEFAULT_PAGE;
    const limitNum = parseInt(limitStr) || constants_1.DEFAULT_LIMIT;
    const skip = (pageNum - 1) * limitNum;
    // 1. Tạo Pipeline để lấy dữ liệu (áp dụng $skip và $limit)
    const dataPipeline = [
        ...pipeline,
        { $skip: skip },
        { $limit: limitNum },
    ];
    // 2. Tạo Pipeline để tính tổng số lượng (dùng $count)
    const countPipeline = [...pipeline, { $count: "total" }];
    // 3. Thực hiện truy vấn song song (Đảm bảo hiệu suất)
    const [itemsResult, countResult] = await Promise.all([
        Model.aggregate(dataPipeline).exec(),
        Model.aggregate(countPipeline).exec(),
    ]);
    const totalItems = countResult.length > 0 ? countResult[0].total : 0;
    return {
        items: itemsResult,
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems: totalItems,
        limit: limitNum,
    };
};
exports.paginateAggregation = paginateAggregation;
//# sourceMappingURL=pagination.js.map