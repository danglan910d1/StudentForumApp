// Các hằng số kỹ thuật và cấu hình dùng chung cho toàn bộ Backend
// Chứa các giá trị không đổi, có khả năng thay đổi nhưng không phải là thông tin nhạy cảm.

// Hằng số cho Bảo mật
export const BCRYPT_SALT_ROUNDS = 10;
export const JWT_TOKEN_EXPIRES_IN = "30d"; // Thời gian hết hạn JWT (30 ngày)
// Thay thế hằng số giả định bằng giá trị thực tế:
export const JWT_EXPIRATION_SECONDS = 2592000; // 30 ngày tính bằng giây

// Cấu hình Phân trang (Pagination Defaults)
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50; // Giới hạn tối đa cho query parameter 'limit'

// Cấu hình Nội dung
export const MIN_PASSWORD_LENGTH = 8;
export const POST_TITLE_MAX_LENGTH = 100;
export const COMMENT_CONTENT_MAX_LENGTH = 1000;
