import mongoose, { Document, Types } from "mongoose";
export type TargetType = "post" | "comment";
export interface ILike extends Document {
    userId: Types.ObjectId;
    targetId: Types.ObjectId;
    targetType: TargetType;
    createdAt: Date;
}
declare const Like: mongoose.Model<ILike, {}, {}, {}, mongoose.Document<unknown, {}, ILike, {}, {}> & ILike & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Like;
//# sourceMappingURL=Like.d.ts.map