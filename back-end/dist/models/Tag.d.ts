import { Types, Document } from "mongoose";
export type TagStatus = "pending" | "approved" | "rejected";
export interface ITag extends Document {
    name: string;
    slug: string;
    topicId?: Types.ObjectId | null;
    createdBy: Types.ObjectId;
    status: TagStatus;
    is_deleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<ITag, {}, {}, {}, Document<unknown, {}, ITag, {}, {}> & ITag & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Tag.d.ts.map