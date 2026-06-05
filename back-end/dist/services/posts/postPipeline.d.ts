import { PipelineStage } from "mongoose";
interface PostPipelineConfig {
    includeUser?: boolean;
    includeTopic?: boolean;
    includeTags?: boolean;
    includeProjection?: boolean;
    isAdminView?: boolean;
    currentUserId?: string;
}
export declare const buildPostAggregationPipeline: (filter: any, config?: PostPipelineConfig) => PipelineStage[];
export {};
//# sourceMappingURL=postPipeline.d.ts.map