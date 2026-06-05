import { Types } from "mongoose";
// Giả định import CommentStatus từ Model

// 1. Dùng cho Params (cập nhật, xóa)
export interface CommentParams {
  commentId: string;
}

// 2. Dùng cho POST /comments (Tạo bình luận)
export interface CreateCommentBody {
  postId: string; // ID của Bài viết (Bắt buộc)
  parentId?: string; // ID của Comment cha (Nếu là reply)
  content: string; // Nội dung
}

// 3. Dùng cho GET /comments (Danh sách, lọc, phân trang)
export interface GetCommentsQuery {
  postId?: string;
  parentId?: string;
  status?: "pending" | "approved" | "rejected"; // Thêm dòng này
  page?: string;
  limit?: string;
  search?: string;
}
