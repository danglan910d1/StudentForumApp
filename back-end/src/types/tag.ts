import { TagStatus } from "../models/Tag"; // <-- Import TagStatus từ Model

// Định nghĩa các loại Status có thể áp dụng cho Post

// 1. Dùng cho Params (Lấy chi tiết, cập nhật, xóa)
export interface TagParams {
  id: string;
}

// 2. Dùng cho POST /tags (Tạo tag)
export interface CreateTagBody {
  name: string;
  topicId: string; // Mảng ID Tags (string)
}

// 3. Dùng cho GET /tags (Danh sách, lọc, phân trang)
export interface GetTagsQuery {
  topicId?: string;
  page?: string;
  limit?: string; // BỔ SUNG FIX LỖI: Thêm trường status vào GetTagsQuery
  status?: TagStatus;
  adminView?: string | boolean;
}

// 4. Dùng cho PUT /tags/:id (Cập nhật)
export interface UpdateTagBody {
  name?: string;
  topicId?: string | null; // Cho phép null để xóa liên kết topic
  status?: TagStatus; // Dành cho Admin
}
