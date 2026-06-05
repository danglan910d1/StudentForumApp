import { Types } from "mongoose";
import { GetCommentsQuery } from "../../types/comment";
import { AuthContext, buildCommonFilter } from "../common/buildCommonFilter";

export const buildCommentFilter = (
  queryParams: GetCommentsQuery,
  authContext: AuthContext
): any => {
  const { postId, parentId } = queryParams;

  // 1. Build common filter (search, is_deleted, status mặc định)
  const filter = buildCommonFilter(queryParams, authContext, "comment");

  // 2. Validate PostId (Fail-fast)
  if (!postId || !Types.ObjectId.isValid(postId)) {
    return { error: "Valid postId is required." };
  }
  filter.postId = new Types.ObjectId(postId);

  // 3. Xử lý ParentId (Phân cấp)
  if (parentId) {
    if (!Types.ObjectId.isValid(parentId))
      return { error: "Invalid parentId." };
    filter.parentId = new Types.ObjectId(parentId);
  } else {
    filter.parentId = null; // Lấy comment gốc
  }

  return filter;
};
