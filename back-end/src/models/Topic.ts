// src/models/Topic.ts

import { Schema, model, Types, Document } from "mongoose";
import { generateSlug } from "../utils/text";

// Định nghĩa các loại Status có thể áp dụng cho Topic (Phải khớp với Topic Model)
export type TopicStatus = "pending" | "approved" | "rejected";

// Định nghĩa kiểu dữ liệu TypeScript cho Topic
export interface ITopic extends Document {
  name: string;
  slug: string;
  description?: string | null;
  createdBy: Types.ObjectId; // ID của Admin tạo ra Topic
  status: TopicStatus;
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const transformFunc = function (doc: Document, ret: any) {
  // 1. Đảm bảo 'id' được tạo ra từ '_id'
  const id = ret._id;
  delete ret._id; // Loại bỏ _id
  delete ret.__v; // Loại bỏ __v
  const newRet: any = {
    topicId: id,
    ...ret,
  };
  return newRet;
};

const topicSchema = new Schema<ITopic>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, index: true }, // Dùng cho URL thân thiện
    description: { type: String, default: null },
    // Tham chiếu đến UserSchema
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    is_deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Cho phép các Virtuals (topicId) được bao gồm trong phản hồi JSON
      virtuals: false,
      // Loại bỏ các trường MongoDB nội bộ khỏi phản hồi JSON
      transform: transformFunc,
    },
    toObject: {
      virtuals: false,
      transform: transformFunc,
    },
  },
);

// PRE-SAVE HOOK: Tự động tạo slug trước khi lưu
topicSchema.pre<ITopic>("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    // Sử dụng hàm tiện ích đã tách ra
    this.slug = generateSlug(this.name);
  }
  next();
});

// Thêm Index cho status để Admin lọc nhanh
topicSchema.index({ status: 1 });

// Thêm Text Index để tìm kiếm theo tên topic
topicSchema.index({ name: "text" });

// Thêm Partial Index ở cuối file
topicSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { is_deleted: false } },
);
topicSchema.index({ createdAt: -1 });

export default model<ITopic>("Topic", topicSchema);
