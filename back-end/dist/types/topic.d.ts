import { TopicStatus } from "../models/Topic";
export interface TopicParams {
    id: string;
}
export interface CreateTopicBody {
    name: string;
    description?: string;
    status?: TopicStatus;
}
export interface UpdateTopicBody {
    name?: string;
    description?: string;
    status?: TopicStatus;
}
//# sourceMappingURL=topic.d.ts.map