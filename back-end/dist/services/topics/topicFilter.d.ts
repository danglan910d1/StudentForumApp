import { AuthContext, CommonQuery } from "../common/buildCommonFilter";
export interface GetTopicsQuery extends CommonQuery {
}
/**
 * Xây dựng đối tượng filter MongoDB đặc thù cho Topic.
 * Sử dụng buildCommonFilter để xử lý logic Status và Search.
 */
export declare const buildTopicFilter: (queryParams: GetTopicsQuery, authContext: AuthContext) => any;
//# sourceMappingURL=topicFilter.d.ts.map