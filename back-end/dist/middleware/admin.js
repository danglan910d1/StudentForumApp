"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
// KHÔNG cần import Users, KHÔNG cần truy vấn DB (Zero-Lookup)
/**
 * MIDDLEWARE: adminMiddleware
 * * @description Kiểm tra quyền Admin dựa trên userRole đã được gán từ authMiddleware.
 * @param {Request} req - Đối tượng Request từ Express (Phải được ép kiểu về AuthenticatedRequest).
 * @param {Response} res - Đối tượng Response để trả về lỗi 403 nếu không đủ quyền.
 * @param {NextFunction} next - Hàm callback để chuyển sang Middleware/Controller tiếp theo.
 * @returns {void}
 */
// Middleware kiểm tra quyền Admin (Zero-Lookup)
const adminMiddleware = (req, res, next) => {
    // Giả định: authMiddleware đã chạy trước và gán userId/userRole
    const userRole = req.userRole;
    // Kiểm tra quyền admin
    if (userRole === "admin") {
        // Nếu là Admin, cho phép đi tiếp
        next();
    }
    else {
        // Nếu không phải Admin hoặc User không tồn tại/role không đủ
        res.status(403).json({ error: "Access denied. Admin rights required." });
    }
};
exports.adminMiddleware = adminMiddleware;
//# sourceMappingURL=admin.js.map