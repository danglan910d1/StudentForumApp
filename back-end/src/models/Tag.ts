// src/models/Tag.ts
import { Schema, model, Types, Document } from "mongoose";
import { generateSlug } from "../utils/text";

// Định nghĩa các loại Status có thể áp dụng cho Tag (Phải khớp với Tag Model)
export type TagStatus = "pending" | "approved" | "rejected";
export interface ITag extends Document {
  name: string;
  slug: string;
  topicId?: Types.ObjectId | null; // Tag có thể thuộc về một Topic cụ thể (null = freeTag)
  createdBy: Types.ObjectId; // ID của User/Admin gợi ý Tag
  status: TagStatus;
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const transformFunc = function (doc: Document, ret: any) {
  const id = ret._id;
  delete ret._id;
  delete ret.__v;
  return {
    tagId: id, // Trả về tagId đồng nhất
    ...ret,
  };
};

const tagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, index: true }, // Dùng cho URL thân thiện
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: false,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
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
tagSchema.pre<ITag>("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    // Sử dụng hàm tiện ích đã tách ra
    this.slug = generateSlug(this.name);
  }
  next();
});

tagSchema.index({ topicId: 1, status: 1 });
tagSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { is_deleted: false } },
);
tagSchema.index({ createdAt: -1 });

export default model<ITag>("Tag", tagSchema);
