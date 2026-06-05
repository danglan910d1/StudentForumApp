import { Response } from "express";
import * as core from "express-serve-static-core";

// 1. Mở rộng Request gốc của Express (cho authMiddleware gán giá trị)
declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
    // Tùy chọn, cho phép là undefined khi request mới tới
    userRole?: "user" | "admin" | "banned";
  }
}

// // 2. Định nghĩa một kiểu Request mới cho các Controllers đã được bảo vệ
// export interface AuthenticatedRequest extends Express.Request {
//   // BẮT BUỘC: Ghi đè trường userId để yêu cầu nó phải tồn tại
//   userId: string;
// } // Có thể gây lỗi khi resquest cần những field khác ngoài userId

// 2. Định nghĩa một kiểu Request mới cho các Controllers đã được bảo vệ
// Kế thừa tất cả các Generics của Request gốc
export interface AuthenticatedRequest<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any, // <--- Đảm bảo Body được truyền qua
  ReqQuery = core.Query
  // Kế thừa từ core.Request để đảm bảo tất cả thuộc tính đều có Generics
> extends core.Request<P, ResBody, ReqBody, ReqQuery> {
  // BẮT BUỘC: Ghi đè trường userId để yêu cầu nó phải tồn tại
  userId: string;
  // Tùy chọn: Thêm userRole. Nó chỉ được gán nếu có adminMiddleware hoặc logic kiểm tra role
  userRole?: "user" | "admin" | "banned"; // <--- Bổ sung userRole để TS nhận diện
}
