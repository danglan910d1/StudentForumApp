export interface GetNotificationsQuery {
  page?: string;
  limit?: string;
  is_read?: string; // Ví dụ: User muốn lọc riêng các thông báo chưa đọc
  type?: string; // Ví dụ: Chỉ xem thông báo về "like" hoặc "comment"
  targetId?: string;
}
