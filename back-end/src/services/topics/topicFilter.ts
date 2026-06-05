import {
  AuthContext,
  buildCommonFilter,
  CommonQuery,
} from "../common/buildCommonFilter"; // Sử dụng CommonQuery

// Giả định Topic Query chỉ cần các trường chung
export interface GetTopicsQuery extends CommonQuery {
  // Không có trường đặc thù nào ngoài CommonQuery
}

/**
 * Xây dựng đối tượng filter MongoDB đặc thù cho Topic.
 * Sử dụng buildCommonFilter để xử lý logic Status và Search.
 */
export const buildTopicFilter = (
  queryParams: GetTopicsQuery,
  authContext: AuthContext
) => {
  // Topic hiện tại không có trường đặc thù, chỉ dùng chung logic với Common
  // Truyền thẳng queryParams vào là xong
  return buildCommonFilter(queryParams, authContext, "topic");
};
