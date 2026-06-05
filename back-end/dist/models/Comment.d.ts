import mongoose, { Document, Types } from "mongoose";
export interface IComment extends Document {
    userId: Types.ObjectId;
    postId: Types.ObjectId;
    parentId?: Types.ObjectId | null;
    content: string;
    likes_count: number;
    replies_count: number;
    is_deleted: boolean;
    status: "pending" | "approved" | "rejected";
    createdAt: Date;
    updatedAt: Date;
}
declare const Comment: mongoose.Model<IComment, {}, {}, {}, mongoose.Document<unknown, {}, IComment, {}, {}> & IComment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Comment;
//# sourceMappingURL=Comment.d.ts.map