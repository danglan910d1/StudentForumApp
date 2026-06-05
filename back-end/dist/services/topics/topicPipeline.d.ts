import { PipelineStage } from "mongoose";
interface TopicPipelineConfig {
    includeUser?: boolean;
    includeProjection?: boolean;
    isAdminView?: boolean;
}
export declare const buildTopicAggregationPipeline: (filter: any, config?: TopicPipelineConfig) => PipelineStage[];
export {};
//# sourceMappingURL=topicPipeline.d.ts.map