import mongoose, { Document, Schema, Types } from "mongoose";

export type TargetType = "post" | "comment";

export interface ILike extends Document {
  userId: Types.ObjectId;
  targetId: Types.ObjectId;
  targetType: TargetType;
  createdAt: Date;
}

const transformFunc = function (doc: Document, ret: any) {
  const id = ret._id;
  delete ret._id;
  delete ret.__v;
  return {
    likeId: id,
    ...ret,
  };
};

const LikeSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetType: { type: String, enum: ["post", "comment"], required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { transform: transformFunc },
    toObject: { transform: transformFunc },
  }
);

// Index để truy vấn nhanh và đảm bảo mỗi user chỉ like 1 lần
LikeSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });
LikeSchema.index({ targetId: 1, targetType: 1 }); // Hỗ trợ đếm like nếu cần

const Like = mongoose.model<ILike>("Like", LikeSchema);
export default Like;
