import { PostStatus } from "../models/Post";
import { CommonQuery } from "../services/common/buildCommonFilter";
import { TagApprovalAction } from "../services/posts/adminApprovePost";

// 1. Dùng cho Params (Lấy chi tiết, cập nhật, xóa)
export interface PostParams {
  id: string;
}

// 2. Dùng cho POST /posts (Tạo bài viết)
export interface CreatePostBody {
  topicId: string;
  tags?: string[]; // Mảng ID Tags (string)
  title: string;
  content: string;
}

export interface GetPostsQuery extends CommonQuery {
  topicId?: string; // Dùng khi truyền trực tiếp ID
  topicSlug?: string; // Dùng khi lấy từ URL params của Next.js
  tagId?: string; // Dùng khi truyền trực tiếp ID
  tagSlug?: string; // Dùng khi lọc theo tag trên URL
  is_resolved?: string | boolean;
  userId?: string;
}

// 4. Dùng cho PUT /posts/:id (Cập nhật)
export interface UpdatePostBody {
  topicId?: string;
  tags?: string[];
  title?: string;
  content?: string;
  status?: PostStatus; // Dành cho Admin
  is_resolved?: boolean;
  // is_sticky?: boolean; // Dành cho Admin
}

// Định nghĩa Body cho API toggle is_sticky (Mới)
export interface ToggleStickyBody {
  is_sticky: boolean; // Bắt buộc phải là boolean
}

// Định nghĩa hành động cụ thể cho từng Tag
export interface PendingTagAction {
  tagId: string; // ID của Tag đang pending
  action: TagApprovalAction; // Hành động của Admin (ví dụ: "approve_and_mark_free")
}

/**
 * Cấu trúc Body cho request duyệt bài của Admin (Giai đoạn 3).
 */
export interface AdminApprovePostBody {
  // Mảng chứa các quyết định của Admin trên TỪNG Tag đang pending.
  pendingTagActions: PendingTagAction[];
  keepTagIds: string[];

  // Trạng thái cuối cùng của Bài viết sau khi duyệt Tag xong.
  newPostStatus: "approved" | "rejected";
  reason?: string;
}
