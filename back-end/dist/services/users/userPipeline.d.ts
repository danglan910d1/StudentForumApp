import { PipelineStage } from "mongoose";
interface UserPipelineConfig {
    includeStats?: boolean;
    includeProjection?: boolean;
    isAdminView?: boolean;
}
export declare const buildUserAggregationPipeline: (filter: any, config?: UserPipelineConfig) => PipelineStage[];
export {};
//# sourceMappingURL=userPipeline.d.ts.map