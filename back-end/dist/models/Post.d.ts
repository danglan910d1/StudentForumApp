import { Types, Document } from "mongoose";
export type PostStatus = "pending" | "approved" | "rejected";
export interface IPost extends Document {
    userId: Types.ObjectId;
    topicId: Types.ObjectId;
    tags: Types.ObjectId[];
    title: string;
    slug: string;
    content: string;
    status: PostStatus;
    is_resolved: boolean;
    is_sticky: boolean;
    views_count: number;
    likes_count: number;
    comments_count: number;
    is_deleted: boolean;
    pending_tags: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<IPost, {}, {}, {}, Document<unknown, {}, IPost, {}, {}> & IPost & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Post.d.ts.map