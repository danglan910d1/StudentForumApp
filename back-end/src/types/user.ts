// Định nghĩa Cốt lõi (Base Type): Tạo một Interface chứa các trường cơ bản, chung nhất, được sử dụng trong nhiều API khác nhau

import { UserRole, UserStatus } from "../models/User";
import { CommonQuery } from "../services/common/buildCommonFilter";

// Interface chứa các trường dữ liệu người dùng cơ bản (Base)
interface UserBaseData {
  name: string;
  email: string;
  password: string;
  avatar?: string | null;
}

// --- AUTH CONTROLLER PAYLOADS ---
// Sử dụng Pick: Dùng Pick<BaseType, 'field1' | 'field2'> để chọn ra các trường cần thiết
// 1. Dùng cho POST /register (Bắt buộc tất cả các trường)
// Loại bỏ avatar vì nó có giá trị default trong Model
export interface RegisterBody
  extends Pick<UserBaseData, "name" | "email" | "password"> {
  avatar?: string;
}

// Dùng cho POST /login
export interface LoginBody extends Pick<UserBaseData, "email" | "password"> {}

// Sử dụng Partial: Dùng Partial<T> để chỉ ra rằng các trường đó là tùy chọn (optional), điều này là cần thiết cho các thao tác UPDATE
// 2. Dùng cho PUT /profile (Tất cả đều optional và chỉ chọn name, avatar)
// Sử dụng Partial để làm cho tất cả các trường là optional (?)
export interface UpdateProfileBody
  extends Partial<Pick<UserBaseData, "name" | "avatar">> {}

// 3. Dùng cho PUT /password
export interface UpdatePasswordBody {
  oldPassword: string;
  newPassword: string;
}

// 3. Dùng cho GET /:id (Params)
export interface GetUserParams {
  id: string;
}

// 4. Dùng cho PUT /:id/status (Admin)
export interface UpdateUserStatusBody {
  status?: UserStatus; // Role chỉ là tùy chọn
  role?: UserRole;
}

// Vừa search vừa lọc
export interface GetAllUsersQuery extends CommonQuery {
  role?: UserRole;
  email?: string; // Thêm để lọc chính xác email
  name?: string; // Thêm để lọc chính xác tên (nếu cần)
}

// -----------------------------------------------------------
// --- INTERFACE ĐẦU RA (OUTPUT) ---
// Định nghĩa kiểu dữ liệu cho đối tượng User sau khi đã qua TRANSFORM (.toJSON())
// Nó không còn _id hay password, mà có userId
export interface UserResponseData {
  userId: string; // Đã được đổi từ _id
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
