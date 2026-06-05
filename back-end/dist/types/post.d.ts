import { PostStatus } from "../models/Post";
import { CommonQuery } from "../services/common/buildCommonFilter";
import { TagApprovalAction } from "../services/posts/adminApprovePost";
export interface PostParams {
    id: string;
}
export interface CreatePostBody {
    topicId: string;
    tags?: string[];
    title: string;
    content: string;
}
export interface GetPostsQuery extends CommonQuery {
    topicId?: string;
    topicSlug?: string;
    tagId?: string;
    tagSlug?: string;
    is_resolved?: string | boolean;
    userId?: string;
}
export interface UpdatePostBody {
    topicId?: string;
    tags?: string[];
    title?: string;
    content?: string;
    status?: PostStatus;
    is_resolved?: boolean;
}
export interface ToggleStickyBody {
    is_sticky: boolean;
}
export interface PendingTagAction {
    tagId: string;
    action: TagApprovalAction;
}
/**
 * Cấu trúc Body cho request duyệt bài của Admin (Giai đoạn 3).
 */
export interface AdminApprovePostBody {
    pendingTagActions: PendingTagAction[];
    keepTagIds: string[];
    newPostStatus: "approved" | "rejected";
    reason?: string;
}
//# sourceMappingURL=post.d.ts.map