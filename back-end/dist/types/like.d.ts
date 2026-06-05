import { TargetType } from "../models/Like";
/**
 * TYPES: Like API Payloads
 * * Mô tả: Chứa các Interfaces cho dữ liệu đầu vào của Like Controller.
 * * Nguyên tắc: Đảm bảo Type Safety cho req.params và req.query.
 */
export interface ToggleLikeParams {
    targetType: TargetType;
    targetId: string;
}
export interface GetLikeStatusQuery {
    targetType: TargetType;
    targetId: string;
}
//# sourceMappingURL=like.d.ts.map