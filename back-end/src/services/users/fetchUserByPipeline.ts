import User from "../../models/User";
import { buildUserAggregationPipeline } from "./userPipeline";

// --- [ UTILS: Hàm bổ trợ lấy User qua Pipeline để đồng nhất dữ liệu ] ---
export const fetchUserByPipeline = async (
  filter: any,
  isAdminView: boolean // Biến này xác định "Người đang xem" có quyền xem pending hay không
) => {
  const pipeline = buildUserAggregationPipeline(filter, {
    includeStats: true, // Luôn luôn tính toán thống kê
    isAdminView: isAdminView, // Truyền vào để pipeline quyết định trả về Object hay Number
  });

  const users = await User.aggregate(pipeline).exec();
  return users[0] || null;
};
