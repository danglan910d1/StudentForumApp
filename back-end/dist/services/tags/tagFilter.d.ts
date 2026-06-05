import { AuthContext, CommonQuery } from "../common/buildCommonFilter";
export interface GetTagsQuery extends CommonQuery {
    topicId?: string;
    topicSlug?: string;
}
/**
 * Xây dựng đối tượng filter MongoDB đặc thù cho Tag.
 * Sử dụng buildCommonFilter để xử lý logic Status, Search, và MyPosts (nếu có).
 */
export declare const buildTagFilter: (queryParams: GetTagsQuery, authContext: AuthContext) => Promise<any>;
//# sourceMappingURL=tagFilter.d.ts.map