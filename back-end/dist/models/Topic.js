"use strict";
// src/models/Topic.ts
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const text_1 = require("../utils/text");
const transformFunc = function (doc, ret) {
    // 1. Đảm bảo 'id' được tạo ra từ '_id'
    const id = ret._id;
    delete ret._id; // Loại bỏ _id
    delete ret.__v; // Loại bỏ __v
    const newRet = {
        topicId: id,
        ...ret,
    };
    return newRet;
};
const topicSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, index: true }, // Dùng cho URL thân thiện
    description: { type: String, default: null },
    // Tham chiếu đến UserSchema
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
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
});
// PRE-SAVE HOOK: Tự động tạo slug trước khi lưu
topicSchema.pre("save", function (next) {
    if (this.isModified("name") || !this.slug) {
        // Sử dụng hàm tiện ích đã tách ra
        this.slug = (0, text_1.generateSlug)(this.name);
    }
    next();
});
// Thêm Index cho status để Admin lọc nhanh
topicSchema.index({ status: 1 });
// Thêm Text Index để tìm kiếm theo tên topic
topicSchema.index({ name: "text" });
// Thêm Partial Index ở cuối file
topicSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { is_deleted: false } });
topicSchema.index({ createdAt: -1 });
exports.default = (0, mongoose_1.model)("Topic", topicSchema);
//# sourceMappingURL=Topic.js.map