// src/services/postService.ts
import { Types } from "mongoose";
import { GetPostsQuery } from "../../types/post"; // Đã sửa type file
import { buildCommonFilter, AuthContext } from "../common/buildCommonFilter";
import Topic from "../../models/Topic";
import Tag from "../../models/Tag";

/**
 * Xây dựng đối tượng filter MongoDB đặc thù cho Post.
 * Nó gọi hàm chung để xử lý Status và Search, sau đó thêm lọc đặc thù.
 */
export const buildPostFilter = async (
  queryParams: GetPostsQuery,
  authContext: AuthContext
) => {
  // 1. Lấy khung filter chung (status, search, myPosts, is_deleted)
  const filter = buildCommonFilter(queryParams, authContext, "post");

  // 2. Thêm logic đặc thù (Destructuring lấy các trường riêng của Post)
  const { topicId, tagId, is_resolved, topicSlug, tagSlug, userId } =
    queryParams;
  // Lọc theo Topic (Ưu tiên ID, sau đó đến Slug)
  if (topicId && Types.ObjectId.isValid(topicId)) {
    filter.topicId = new Types.ObjectId(topicId);
  } else if (topicSlug) {
    // Tìm ID từ Slug trước khi filter
    const topic = await Topic.findOne({ slug: topicSlug }).select("_id");
    filter.topicId = topic ? topic._id : new Types.ObjectId();
  }
  // Lọc theo Tag (Trong mảng tags)
  if (tagId && Types.ObjectId.isValid(tagId)) {
    filter.tags = new Types.ObjectId(tagId);
  } else if (tagSlug) {
    // Tìm ID của Tag từ Slug
    const tag = await Tag.findOne({ slug: tagSlug }).select("_id");
    filter.tags = tag ? tag._id : new Types.ObjectId();
  }

  if (is_resolved === "true" || is_resolved === true) {
    filter.is_resolved = true;
  }

  // Nếu có userId trong query (User A xem User B) và không phải chế độ myPosts
  if (userId && Types.ObjectId.isValid(userId)) {
    filter.userId = new Types.ObjectId(userId);
    // Khi xem người khác, bắt buộc chỉ xem bài approved (tránh hacker mò ID)
    if (
      !authContext.isAdmin &&
      filter.userId.toString() !== authContext.userId
    ) {
      filter.status = "approved";
    }
  }

  return filter;
};
