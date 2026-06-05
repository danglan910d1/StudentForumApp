"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Hàm transform dùng chung cho cả toJSON và toObject
const transformFunc = function (doc, ret) {
    const id = ret._id;
    delete ret._id;
    delete ret.__v;
    return {
        commentId: id,
        ...ret,
    };
};
const CommentSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Post", required: true },
    parentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Comment", default: null },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    likes_count: { type: Number, default: 0, min: 0 },
    replies_count: { type: Number, default: 0, min: 0 },
    is_deleted: { type: Boolean, default: false, index: true },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "approved",
    },
}, {
    timestamps: true,
    toJSON: { virtuals: false, transform: transformFunc },
    toObject: { virtuals: false, transform: transformFunc },
});
CommentSchema.index({ postId: 1, parentId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1, createdAt: -1 });
CommentSchema.index({ status: 1 });
const Comment = mongoose_1.default.model("Comment", CommentSchema);
exports.default = Comment;
//# sourceMappingURL=Comment.js.map