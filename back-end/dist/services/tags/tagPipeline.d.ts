import { PipelineStage } from "mongoose";
interface TagPipelineConfig {
    includeTopic?: boolean;
    includeUser?: boolean;
    includeProjection?: boolean;
    isAdminView?: boolean;
}
/**
 * Xây dựng các Aggregation Pipeline Stages cho Tag Model.
 * Hỗ trợ đồng nhất tagId, postCount và bảo mật thông tin theo View.
 */
export declare const buildTagAggregationPipeline: (filter: any, config?: TagPipelineConfig) => PipelineStage[];
export {};
//# sourceMappingURL=tagPipeline.d.ts.map