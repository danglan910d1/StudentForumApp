import { Types } from "mongoose";
import { UserStatus } from "../../models/User";

export type GlobalStatus = "pending" | "approved" | "rejected";

export interface CommonQuery {
  status?: GlobalStatus | UserStatus | string;
  search?: string;
  myPosts?: string;
  page?: string;
  limit?: string;
  showDeleted?: string; // Bổ sung để Admin có thể xem thùng rác
  startDate?: string; // ISO String
  endDate?: string;
  slug?: string;
}

export interface AuthContext {
  userId?: string | undefined;
  isAdmin: boolean;
}

/**
 * buildCommonFilter: Xây dựng bộ lọc MongoDB dùng chung cho toàn bộ hệ thống.
 */
export const buildCommonFilter = (
  queryParams: CommonQuery,
  authContext: AuthContext,
  modelType: "post" | "topic" | "tag" | "user" | "comment",
) => {
  const { status, search, myPosts, showDeleted, startDate, endDate, slug } =
    queryParams;
  const { userId, isAdmin } = authContext;

  const filter: any = {};

  // --- 2. LOGIC TRUY CẬP THEO QUYỀN HẠN & TRẠNG THÁI ---
  const isViewingOwnContent = myPosts === "true" && !!userId;

  // --- 1. XỬ LÝ SOFT DELETE (Thùng rác) ---
  if (showDeleted === "true" && (isViewingOwnContent || isAdmin)) {
    filter.is_deleted = true;
  } else {
    filter.is_deleted = { $ne: true };
  }

  if (isViewingOwnContent) {
    // TRƯỜNG HỢP 1: XEM NỘI DUNG CỦA CHÍNH MÌNH (Profile/My Posts)
    if (modelType === "user") {
      filter._id = new Types.ObjectId(userId);
    } else {
      const creatorField =
        modelType === "post" || modelType === "comment"
          ? "userId"
          : "createdBy";
      filter[creatorField] = new Types.ObjectId(userId);
      // Khi tự xem đồ của mình, mặc định không chặn status (để thấy bài chờ duyệt)
      // Nếu có truyền status cụ thể thì lọc theo cái đó, không thì thôi
      if (status) filter.status = status;
    }
  } else {
    // TRƯỜNG HỢP XEM CHUNG
    if (modelType === "user") {
      if (isAdmin && status) filter.status = status;
      else if (!isAdmin) filter.status = "active";
    } else {
      if (isAdmin && status) filter.status = status;
      else if (!isAdmin) filter.status = "approved";
    }
  }

  if (slug) {
    // Sử dụng RegExp để tìm kiếm gần đúng (case-insensitive)
    filter.slug = { $regex: slug, $options: "i" };
  }

  // --- 3. TÌM KIẾM TỪ KHÓA ---
  if (search) {
    // Lưu ý: Để dùng $text, bạn phải tạo Text Index trong Mongoose Schema
    filter.$text = { $search: search as string };
  }

  if (startDate || endDate) {
    filter.createdAt = {};

    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        filter.createdAt.$gte = start;
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        // Đặt mốc thời gian cuối ngày để lấy trọn vẹn dữ liệu ngày đó
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
  }

  return filter;
};
