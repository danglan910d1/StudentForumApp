"use strict";
// src/models/Post.ts
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const text_1 = require("../utils/text");
const postTransformFunc = function (doc, ret) {
    // 1. Đảm bảo 'id' được tạo ra từ '_id'
    const id = ret._id;
    delete ret._id; // Loại bỏ _id
    delete ret.__v; // Loại bỏ __v
    const newRet = {
        postId: id, // <-- Đổi tên từ _id sang postId
        ...ret,
    };
    return newRet;
};
const postSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    topicId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Topic",
        required: true,
    },
    tags: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Tag",
            required: false, // tags là optional, nhưng nếu có thì phải là ObjectId hợp lệ
        },
    ],
    pending_tags: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: "Tag", required: false },
    ],
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
    },
    slug: { type: String, required: true, index: true }, // Dùng cho URL thân thiện
    content: { type: String, required: true, minlength: 10 },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending", // QUY TẮC: User tạo -> Mặc định chờ duyệt
    },
    is_sticky: { type: Boolean, default: false }, // Chỉ Admin mới có thể ghim
    is_resolved: { type: Boolean, default: false },
    views_count: { type: Number, default: 0 },
    likes_count: { type: Number, default: 0 },
    comments_count: { type: Number, default: 0 },
    is_deleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: {
        // Cho phép các Virtuals (postId) được bao gồm trong phản hồi JSON
        virtuals: false,
        // Loại bỏ các trường MongoDB nội bộ khỏi phản hồi JSON
        transform: postTransformFunc,
    },
    // ÁP DỤNG CƠ CHẾ NỘI BỘ (Đề phòng trường hợp gọi .toObject())
    toObject: {
        virtuals: false,
        transform: postTransformFunc,
    },
});
// PRE-SAVE HOOK: Chỉ tạo slug nếu chưa có slug nào được cung cấp
postSchema.pre("save", function (next) {
    // Chỉ tự động tạo slug nếu slug hoàn toàn trống
    // KHÔNG kiểm tra isModified("title") ở đây vì Controller đã đảm nhận việc xử lý slug khi title đổi
    if (!this.slug) {
        this.slug = (0, text_1.generateSlug)(this.title);
    }
    next();
});
// --- CẬP NHẬT INDEX ĐỂ CHỐNG DUP LEVEL DB---
// Slug duy nhất trên toàn hệ thống nhưng chỉ tính các bài chưa xóa
postSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { is_deleted: false } });
// Tạo Index cho các trường thường dùng để truy vấn/lọc
postSchema.index({ topicId: 1, status: 1 });
postSchema.index({ tags: 1, status: 1 });
postSchema.index({ title: "text", content: "text" }, { weights: { title: 10, content: 1 } });
postSchema.index({ is_sticky: -1, views_count: -1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
exports.default = (0, mongoose_1.model)("Post", postSchema);
//# sourceMappingURL=Post.js.map