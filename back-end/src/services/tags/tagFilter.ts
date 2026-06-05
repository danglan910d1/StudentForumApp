import { Types } from "mongoose";
import {
  AuthContext,
  buildCommonFilter,
  CommonQuery,
} from "../common/buildCommonFilter"; // Sử dụng CommonQuery
import Topic from "../../models/Topic";

// Giả định GetTagsQuery được mở rộng từ CommonQuery
export interface GetTagsQuery extends CommonQuery {
  topicId?: string;
  topicSlug?: string;
}

/**
 * Xây dựng đối tượng filter MongoDB đặc thù cho Tag.
 * Sử dụng buildCommonFilter để xử lý logic Status, Search, và MyPosts (nếu có).
 */
export const buildTagFilter = async (
  queryParams: GetTagsQuery,
  authContext: AuthContext
) => {
  const filter = buildCommonFilter(queryParams, authContext, "tag");
  const { topicId, topicSlug } = queryParams;

  if (topicId) {
    if (topicId === "null") {
      filter.topicId = null; // Tìm các tag không thuộc topic nào
    } else if (Types.ObjectId.isValid(topicId)) {
      filter.topicId = new Types.ObjectId(topicId);
    }
  } else if (topicSlug) {
    // Tìm ID của Topic trước khi lọc Tag
    const topic = await Topic.findOne({ slug: topicSlug }).select("_id");
    filter.topicId = topic ? topic._id : new Types.ObjectId();
  }

  return filter;
};
