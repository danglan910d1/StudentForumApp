import { PipelineStage } from "mongoose";
interface CommentPipelineConfig {
    includeUser?: boolean;
    includePost?: boolean;
    includeParent?: boolean;
    includeProjection?: boolean;
    isAdminView?: boolean;
    currentUserId?: string;
}
/**
 * Xây dựng Aggregation Pipeline cho Comment Model.
 * Hỗ trợ hiển thị content và tự động lookup danh sách replies.
 */
export declare const buildCommentAggregationPipeline: (filter: any, config?: CommentPipelineConfig) => PipelineStage[];
export {};
//# sourceMappingURL=commentPipeline.d.ts.map