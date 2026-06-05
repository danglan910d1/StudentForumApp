export interface CommentParams {
    commentId: string;
}
export interface CreateCommentBody {
    postId: string;
    parentId?: string;
    content: string;
}
export interface GetCommentsQuery {
    postId?: string;
    parentId?: string;
    status?: "pending" | "approved" | "rejected";
    page?: string;
    limit?: string;
    search?: string;
}
//# sourceMappingURL=comment.d.ts.map