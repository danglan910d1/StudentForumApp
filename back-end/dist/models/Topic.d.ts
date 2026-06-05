import { Types, Document } from "mongoose";
export type TopicStatus = "pending" | "approved" | "rejected";
export interface ITopic extends Document {
    name: string;
    slug: string;
    description?: string | null;
    createdBy: Types.ObjectId;
    status: TopicStatus;
    is_deleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<ITopic, {}, {}, {}, Document<unknown, {}, ITopic, {}, {}> & ITopic & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Topic.d.ts.map