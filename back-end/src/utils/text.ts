import slugify from "slugify";
import Post from "../models/Post";

/**
 * Tạo slug từ một chuỗi, đảm bảo tính nhất quán (chữ thường và loại bỏ dấu).
 * @param text Chuỗi đầu vào (ví dụ: Tên Tag).
 * @returns Slug đã chuẩn hóa.
 */
export const generateSlug = (text: string): string => {
  return slugify(text, {
    lower: true,
    locale: "vi",
    remove: /[*+~.()'"!:@]/g,
  }).replace(/[^a-z0-9]/g, ""); // Xóa sạch dấu gạch ngang, dấu cách, ký tự lạ
  // Kết quả: "node-js" hay "node js" đều thành "nodejs"
};
/**
 * Hàm nâng cao: Tạo slug không trùng lặp cho Bài viết
 * Dùng riêng cho: Post Controller
 */
/**
 * Tạo slug duy nhất bằng cách kiểm tra các slug hiện có trong Database
 */
export const generateUniqueSlugForPost = async (
  title: string
): Promise<string> => {
  const baseSlug = generateSlug(title);

  // Tìm các slug có cùng base và suffix số (ví dụ: "slug", "slug-1", "slug-2")
  const escapedBaseSlug = baseSlug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const slugRegex = new RegExp(`^${escapedBaseSlug}(-[0-9]+)?$`, "i");

  const existingSlugs = await Post.find({
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
    if (p.slug === baseSlug) return 0;
    const parts = p.slug.split("-");
    const lastPart = parts[parts.length - 1] || "";
    const num = parseInt(lastPart);
    return isNaN(num) ? 0 : num;
  });

  const maxSuffix = Math.max(...numbers);

  // Trả về slug mới với số thứ tự tiếp theo
  return `${baseSlug}-${maxSuffix + 1}`;
};

export function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
