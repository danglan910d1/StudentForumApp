"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetPassword = exports.sendOTP = exports.login = exports.register = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const bcrypt_1 = __importDefault(require("bcrypt"));
const constants_1 = require("../config/constants");
const redis_1 = require("../services/common/redis");
const authlLayer_1 = require("../services/users/authlLayer");
const appError_1 = require("../utils/appError");
const User_1 = __importDefault(require("../models/User"));
/** * POST /api/auth/register */
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, password } = req.body;
    const userIp = req.ip || "0.0.0.0";
    if (!name || !email || !password)
        throw new appError_1.AppError(400, "Please enter all fields.");
    if (password.length < constants_1.MIN_PASSWORD_LENGTH) {
        throw new appError_1.AppError(400, `Password must be at least ${constants_1.MIN_PASSWORD_LENGTH} characters long.`);
    }
    const { user, token } = await (0, authlLayer_1.registerService)(name, email, password);
    // Xóa giới hạn IP sau khi đăng ký thành công (Phòng trường hợp user bị chặn do thử đăng ký lỗi nhiều lần)
    await (0, redis_1.clearRateLimitsByIdentifier)(userIp, "rate:auth");
    await (0, redis_1.clearRateLimitsByIdentifier)(userIp, "rate:general");
    res.status(201).json({ ...user, token });
});
/** * POST /api/auth/login */
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const userIp = req.ip || "0.0.0.0";
    if (!email || !password)
        throw new appError_1.AppError(400, "Please provide both email and password.");
    // Service này chịu trách nhiệm: Kiểm tra user, verify pass, kiểm tra lockout trong Redis
    const { user, token } = await (0, authlLayer_1.loginService)(email, password, userIp);
    // Giải phóng IP khỏi rate limit nếu login thành công
    await (0, redis_1.clearRateLimitsByIdentifier)(userIp, "rate:auth");
    await (0, redis_1.clearRateLimitsByIdentifier)(userIp, "rate:general");
    res.json({ ...user, token });
});
exports.sendOTP = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body; // Loại bỏ 'action' khỏi body nếu không dùng đến
    if (!email)
        throw new appError_1.AppError(400, "Email là bắt buộc.");
    const user = await User_1.default.findOne({ email });
    if (!user)
        throw new appError_1.AppError(404, "Không tìm thấy người dùng với email này.");
    // 1. Tạo mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // 2. Lưu vào Redis
    // Vì trong redis.ts đã để action mặc định là "reset-password",
    // bạn chỉ cần truyền userId và otp.
    await (0, redis_1.setOTP)(user.id.toString(), otp);
    // 3. Gửi Email (Hiện tại đang debug console)
    // await mailService.sendOTP(email, otp);
    console.log(`--- [DEBUG] OTP RESET cho ${email} là: ${otp} ---`);
    res.json({
        success: true,
        message: "Mã xác thực đã được gửi đến email của bạn.",
    });
});
exports.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, otpCode, newPassword } = req.body;
    if (!email || !otpCode || !newPassword)
        throw new appError_1.AppError(400, "Email, OTP và mật khẩu mới là bắt buộc.");
    // Tìm user bằng email
    const user = await User_1.default.findOne({ email });
    if (!user)
        throw new appError_1.AppError(404, "Email không tồn tại trên hệ thống.");
    // 1. Xác thực OTP từ Redis (Action: reset-password)
    const storedOtp = await (0, redis_1.getOTP)(user.id.toString(), "reset-password");
    if (!storedOtp || storedOtp !== otpCode)
        throw new appError_1.AppError(400, "Mã OTP không chính xác hoặc đã hết hạn.");
    // 2. Hash mật khẩu mới và lưu
    user.password = await bcrypt_1.default.hash(newPassword, constants_1.BCRYPT_SALT_ROUNDS);
    await user.save();
    // 3. Dọn dẹp OTP
    await (0, redis_1.deleteOTP)(user.id.toString(), "reset-password");
    await (0, redis_1.cacheUser)(user.id.toString(), null, 0);
    res.json({
        success: true,
        message: "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.",
    });
});
/** * POST /api/auth/logout */
exports.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        throw new appError_1.AppError(401, "Token is required for logout.");
    // logoutService sẽ thực hiện addRevokedToken vào Redis với TTL khớp với thời gian còn lại của JWT
    await (0, authlLayer_1.logoutService)(token);
    res.json({ message: "Logged out successfully." });
});
//# sourceMappingURL=authController.js.map