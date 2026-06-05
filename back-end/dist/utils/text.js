"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueSlugForPost = exports.generateSlug = void 0;
exports.escapeRegex = escapeRegex;
const slugify_1 = __importDefault(require("slugify"));
const Post_1 = __importDefault(require("../models/Post"));
/**
 * Tạo slug từ một chuỗi, đảm bảo tính nhất quán (chữ thường và loại bỏ dấu).
 * @param text Chuỗi đầu vào (ví dụ: Tên Tag).
 * @returns Slug đã chuẩn hóa.
 */
const generateSlug = (text) => {
    return (0, slugify_1.default)(text, {
        lower: true,
        locale: "vi",
        remove: /[*+~.()'"!:@]/g,
    }).replace(/[^a-z0-9]/g, ""); // Xóa sạch dấu gạch ngang, dấu cách, ký tự lạ
    // Kết quả: "node-js" hay "node js" đều thành "nodejs"
};
exports.generateSlug = generateSlug;
/**
 * Hàm nâng cao: Tạo slug không trùng lặp cho Bài viết
 * Dùng riêng cho: Post Controller
 */
/**
 * Tạo slug duy nhất bằng cách kiểm tra các slug hiện có trong Database
 */
const generateUniqueSlugForPost = async (title) => {
    const baseSlug = (0, exports.generateSlug)(title);
    // Tìm các slug có cùng base và suffix số (ví dụ: "slug", "slug-1", "slug-2")
    const escapedBaseSlug = baseSlug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const slugRegex = new RegExp(`^${escapedBaseSlug}(-[0-9]+)?$`, "i");
    const existingSlugs = await Post_1.default.find({
        slug: slugRegex,
        is_deleted: { $ne: true },
    })
        .select("slug")
        .lean();
    if (existingSlugs.length === 0) {
        return baseSlug;
    }
    // Tách số suffix và tìm số lớn nhất (max)
    const numbers = existingSlugs.map((p) => {
        if (p.slug === baseSlug)
            return 0;
        const parts = p.slug.split("-");
        const lastPart = parts[parts.length - 1] || "";
        const num = parseInt(lastPart);
        return isNaN(num) ? 0 : num;
    });
    const maxSuffix = Math.max(...numbers);
    // Trả về slug mới với số thứ tự tiếp theo
    return `${baseSlug}-${maxSuffix + 1}`;
};
exports.generateUniqueSlugForPost = generateUniqueSlugForPost;
function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
//# sourceMappingURL=text.js.map