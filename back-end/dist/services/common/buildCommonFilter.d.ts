import { UserStatus } from "../../models/User";
export type GlobalStatus = "pending" | "approved" | "rejected";
export interface CommonQuery {
    status?: GlobalStatus | UserStatus | string;
    search?: string;
    myPosts?: string;
    page?: string;
    limit?: string;
    showDeleted?: string;
    startDate?: string;
    endDate?: string;
    slug?: string;
}
export interface AuthContext {
    userId?: string | undefined;
    isAdmin: boolean;
}
/**
 * buildCommonFilter: Xây dựng bộ lọc MongoDB dùng chung cho toàn bộ hệ thống.
 */
export declare const buildCommonFilter: (queryParams: CommonQuery, authContext: AuthContext, modelType: "post" | "topic" | "tag" | "user" | "comment") => any;
//# sourceMappingURL=buildCommonFilter.d.ts.map