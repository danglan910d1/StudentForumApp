import { PipelineStage } from "mongoose";
interface NotificationPipelineConfig {
    includeSender?: boolean;
}
export declare const buildNotificationAggregationPipeline: (filter: any, config?: NotificationPipelineConfig) => PipelineStage[];
export {};
//# sourceMappingURL=notificationPipeline.d.ts.map