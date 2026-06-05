import mongoose, { Document, Schema, Types } from "mongoose";

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

// Hàm transform dùng chung cho cả toJSON và toObject
const transformFunc = function (doc: Document, ret: any) {
  const id = ret._id;
  delete ret._id;
  delete ret.__v;
  return {
    commentId: id,
    ...ret,
  };
};

const CommentSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    likes_count: { type: Number, default: 0, min: 0 },
    replies_count: { type: Number, default: 0, min: 0 },
    is_deleted: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: false, transform: transformFunc },
    toObject: { virtuals: false, transform: transformFunc },
  }
);

CommentSchema.index({ postId: 1, parentId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1, createdAt: -1 });
CommentSchema.index({ status: 1 });

const Comment = mongoose.model<IComment>("Comment", CommentSchema);
export default Comment;
