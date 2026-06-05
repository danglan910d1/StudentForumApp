"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUserFilter = void 0;
const buildCommonFilter_1 = require("../common/buildCommonFilter");
/**
 * Xây dựng đối tượng filter MongoDB đặc thù cho User.
 */
const buildUserFilter = (queryParams, authContext) => {
    // 1. Khởi tạo filter bằng bộ lọc chung.
    // Hàm này đã tự xử lý is_deleted, search, và status (active/banned) cho User rồi.
    const filter = (0, buildCommonFilter_1.buildCommonFilter)(queryParams, authContext, "user");
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
exports.buildUserFilter = buildUserFilter;
//# sourceMappingURL=userFilter.js.map