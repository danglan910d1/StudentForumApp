"use strict";
// Định nghĩa Schema người dùng
// Lưu trữ thông tin cơ bản: name, email (duy nhất), password (hashed).
// Là trung tâm xác thực (Authentication).
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose"); // Import(thêm) Types để dùng cho TypeScript Interface
const userTransformFunc = function (doc, ret) {
    // 1. Đảm bảo 'id' được tạo ra từ '_id'
    const id = ret._id;
    delete ret._id; // Loại bỏ _id
    delete ret.__v; // Loại bỏ __v
    const newRet = {
        userId: id,
        ...ret,
    };
    return newRet;
};
// Định nghĩa Schema Mongoose (Quy tắc Cơ sở dữ liệu)
/*Cấu trúc new Schema<IUser>({}, {})
  Tham số thứ nhất (First {}): definition (Định nghĩa field). Định nghĩa chi tiết từng field (Field definition).
  Tham số thứ hai (Second {}): options (Tùy chọn Schema). Cấu hình chung của Schema (Schema options).
*/
const userSchema = new mongoose_1.Schema(
// Định nghĩa các field và quy tắc của chúng
{
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false, // Quy tắc của password: Ẩn mật khẩu khi query mặc định
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: {
        type: String,
        default: "",
    },
    status: { type: String, enum: ["active", "banned"], default: "active" },
    is_deleted: { type: Boolean, default: false, index: true },
    // Loại bỏ định nghĩa thủ công
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
}, {
    // Tham số 2: Các tùy chọn cấu hình Schema tổng thể
    // Sử dụng timestamps để tự động quản lý
    timestamps: true, // Tuỳ chọn này áp dụng cho tất cả các field
    toJSON: {
        // Không phép các Virtuals (userId) được bao gồm trong phản hồi JSON
        virtuals: false,
        // Loại bỏ các trường MongoDB nội bộ khỏi phản hồi JSON
        transform: userTransformFunc,
    },
    // ÁP DỤNG CƠ CHẾ NỘI BỘ (Đề phòng trường hợp gọi .toObject())
    toObject: {
        virtuals: false,
        transform: userTransformFunc,
    },
});
// ÁP DỤNG COLLATION TRÊN INDEX EMAIL ĐỂ BỎ QUA CHỮ HOA/THƯỜNG
// Nếu muốn đảm bảo tính duy nhất không phân biệt chữ hoa/thường (case-insensitive uniqueness)
userSchema.index({ email: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
userSchema.methods.getUserResponseData = function () {
    // Gọi toJSON để áp dụng transformFunc và ép kiểu
    return this.toJSON();
};
userSchema.index({ name: "text", email: "text" });
exports.default = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=User.js.map