import { TopicStatus } from "../models/Topic";

// 1. Dùng cho Params (Lấy chi tiết, cập nhật)
export interface TopicParams {
  id: string;
}

// 2. Dùng cho POST /admin (Tạo Topic mới)
export interface CreateTopicBody {
  name: string;
  description?: string;
  status?: TopicStatus;
}

// 3. Dùng cho PUT /admin/:id (Cập nhật Topic)
export interface UpdateTopicBody {
  name?: string;
  description?: string;
  status?: TopicStatus; // Dùng cho admin duyệt/cập nhật
}
