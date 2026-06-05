"use strict";
// Các hằng số kỹ thuật và cấu hình dùng chung cho toàn bộ Backend
// Chứa các giá trị không đổi, có khả năng thay đổi nhưng không phải là thông tin nhạy cảm.
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMENT_CONTENT_MAX_LENGTH = exports.POST_TITLE_MAX_LENGTH = exports.MIN_PASSWORD_LENGTH = exports.MAX_LIMIT = exports.DEFAULT_LIMIT = exports.DEFAULT_PAGE = exports.JWT_EXPIRATION_SECONDS = exports.JWT_TOKEN_EXPIRES_IN = exports.BCRYPT_SALT_ROUNDS = void 0;
// Hằng số cho Bảo mật
exports.BCRYPT_SALT_ROUNDS = 10;
exports.JWT_TOKEN_EXPIRES_IN = "30d"; // Thời gian hết hạn JWT (30 ngày)
// Thay thế hằng số giả định bằng giá trị thực tế:
exports.JWT_EXPIRATION_SECONDS = 2592000; // 30 ngày tính bằng giây
// Cấu hình Phân trang (Pagination Defaults)
exports.DEFAULT_PAGE = 1;
exports.DEFAULT_LIMIT = 10;
exports.MAX_LIMIT = 50; // Giới hạn tối đa cho query parameter 'limit'
// Cấu hình Nội dung
exports.MIN_PASSWORD_LENGTH = 8;
exports.POST_TITLE_MAX_LENGTH = 100;
exports.COMMENT_CONTENT_MAX_LENGTH = 1000;
//# sourceMappingURL=constants.js.map