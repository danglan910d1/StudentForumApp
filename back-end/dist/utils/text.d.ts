/**
 * Tạo slug từ một chuỗi, đảm bảo tính nhất quán (chữ thường và loại bỏ dấu).
 * @param text Chuỗi đầu vào (ví dụ: Tên Tag).
 * @returns Slug đã chuẩn hóa.
 */
export declare const generateSlug: (text: string) => string;
/**
 * Hàm nâng cao: Tạo slug không trùng lặp cho Bài viết
 * Dùng riêng cho: Post Controller
 */
/**
 * Tạo slug duy nhất bằng cách kiểm tra các slug hiện có trong Database
 */
export declare const generateUniqueSlugForPost: (title: string) => Promise<string>;
export declare function escapeRegex(text: string): string;
//# sourceMappingURL=text.d.ts.map