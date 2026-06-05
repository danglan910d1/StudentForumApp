import { GetAllUsersQuery } from "../../types/user";
import { AuthContext, buildCommonFilter } from "../common/buildCommonFilter";

/**
 * Xây dựng đối tượng filter MongoDB đặc thù cho User.
 */
export const buildUserFilter = (
  queryParams: GetAllUsersQuery,
  authContext: AuthContext,
) => {
  // 1. Khởi tạo filter bằng bộ lọc chung.
  // Hàm này đã tự xử lý is_deleted, search, và status (active/banned) cho User rồi.
  const filter = buildCommonFilter(queryParams, authContext, "user");

  const { email, name, role } = queryParams;
  const { isAdmin } = authContext;

  // 2. CHỈ THÊM NHỮNG CÁI MÀ HÀM CHUNG KHÔNG CÓ (Logic đặc thù của Admin)
  if (isAdmin) {
    // Lọc chính xác Email (Hàm chung chỉ làm search mờ qua $text)
    if (email) {
      delete filter.$text; // Ưu tiên tìm chính xác theo email
      filter.email = { $regex: email.trim().toLowerCase(), $options: "i" };
    }

    // Lọc chính xác Name
    if (name) {
      filter.name = name.trim();
    }

    // Lọc theo Role (User thường không bao giờ lọc theo role người khác)
    if (role) {
      filter.role = role;
    }
  }

  return filter;
};
