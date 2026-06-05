import { IPost } from "../../models/Post";
export type TagApprovalAction = "approve_and_add_topic" | "approve_and_mark_free" | "approve_topic_and_reject_from_post" | "approve_global_and_reject_from_post" | "reject_tag";
export interface PendingTagAction {
    tagId: string;
    action: TagApprovalAction;
}
export declare const adminApprovePost: (postId: string, adminId: string, pendingTagActions: PendingTagAction[], newPostStatus: "approved" | "rejected", keepTagIds?: string[]) => Promise<IPost>;
//# sourceMappingURL=adminApprovePost.d.ts.map