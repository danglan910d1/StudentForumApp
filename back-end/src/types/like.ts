import { TargetType } from "../models/Like"; // Import TargetType từ Model

/**
 * TYPES: Like API Payloads
 * * Mô tả: Chứa các Interfaces cho dữ liệu đầu vào của Like Controller.
 * * Nguyên tắc: Đảm bảo Type Safety cho req.params và req.query.
 */

// 1. Dùng cho POST /likes/:targetType/:targetId
export interface ToggleLikeParams {
  targetType: TargetType;
  targetId: string;
}

// 2. Dùng cho GET /likes?targetType=...&targetId=...
export interface GetLikeStatusQuery {
  targetType: TargetType;
  targetId: string;
}
