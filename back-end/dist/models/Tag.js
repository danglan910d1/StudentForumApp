"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/Tag.ts
const mongoose_1 = require("mongoose");
const text_1 = require("../utils/text");
const transformFunc = function (doc, ret) {
    const id = ret._id;
    delete ret._id;
    delete ret.__v;
    return {
        tagId: id, // Trả về tagId đồng nhất
        ...ret,
    };
};
const tagSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, index: true }, // Dùng cho URL thân thiện
    topicId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Topic",
        required: false,
        index: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
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
tagSchema.pre("save", function (next) {
    if (this.isModified("name") || !this.slug) {
        // Sử dụng hàm tiện ích đã tách ra
        this.slug = (0, text_1.generateSlug)(this.name);
    }
    next();
});
tagSchema.index({ topicId: 1, status: 1 });
tagSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { is_deleted: false } });
tagSchema.index({ createdAt: -1 });
exports.default = (0, mongoose_1.model)("Tag", tagSchema);
//# sourceMappingURL=Tag.js.map