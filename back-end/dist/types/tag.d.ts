import { TagStatus } from "../models/Tag";
export interface TagParams {
    id: string;
}
export interface CreateTagBody {
    name: string;
    topicId: string;
}
export interface GetTagsQuery {
    topicId?: string;
    page?: string;
    limit?: string;
    status?: TagStatus;
    adminView?: string | boolean;
}
export interface UpdateTagBody {
    name?: string;
    topicId?: string | null;
    status?: TagStatus;
}
//# sourceMappingURL=tag.d.ts.map