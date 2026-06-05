// Định nghĩa Schema người dùng
// Lưu trữ thông tin cơ bản: name, email (duy nhất), password (hashed).
// Là trung tâm xác thực (Authentication).

import { Schema, model, Document } from "mongoose"; // Import(thêm) Types để dùng cho TypeScript Interface
import { UserResponseData } from "../types/user";

export type UserRole = "user" | "admin";
export type UserStatus = "active" | "banned";
// Định nghĩa kiểu dữ liệu TypeScript
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole; // Phân quyền người dùng
  avatar?: string | null; // URL ảnh đại diện
  status: UserStatus; // Trạng thái tài khoản
  createdAt: Date; // Mongoose tự động thêm với timestamps: true
  updatedAt: Date; // Mongoose tự động thêm với timestamps: true
  is_deleted: boolean;
  // THÊM: Định nghĩa lại phương thức toJSON và toObject để TypeScript biết kiểu trả về
  toJSON(): Omit<IUser, "password" | "__v" | "_id"> & { userId: string };
  toObject(): Omit<IUser, "password" | "__v" | "_id"> & { userId: string };
  getUserResponseData(): UserResponseData;
}

const userTransformFunc = function (doc: Document, ret: any) {
  // 1. Đảm bảo 'id' được tạo ra từ '_id'
  const id = ret._id;
  delete ret._id; // Loại bỏ _id
  delete ret.__v; // Loại bỏ __v
  const newRet: any = {
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
const userSchema = new Schema<IUser>(
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
  },
  {
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
  }
);

// ÁP DỤNG COLLATION TRÊN INDEX EMAIL ĐỂ BỎ QUA CHỮ HOA/THƯỜNG
// Nếu muốn đảm bảo tính duy nhất không phân biệt chữ hoa/thường (case-insensitive uniqueness)
userSchema.index(
  { email: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

userSchema.methods.getUserResponseData = function (): UserResponseData {
  // Gọi toJSON để áp dụng transformFunc và ép kiểu
  return this.toJSON() as UserResponseData;
};
userSchema.index({ name: "text", email: "text" });

export default model<IUser>("User", userSchema);
