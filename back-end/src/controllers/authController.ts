/**
 * CONTROLLER: authController
 * Trách nhiệm: Xử lý Đăng ký, Đăng nhập, Đăng xuất.
 * Chiến lược: Service-layered, Redis-backed Revocation, IP-based Rate Limiting.
 */
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcrypt";
import { BCRYPT_SALT_ROUNDS, MIN_PASSWORD_LENGTH } from "../config/constants";
import { LoginBody, RegisterBody } from "../types/user";
import {
  cacheUser,
  clearRateLimitsByIdentifier,
  deleteOTP,
  getOTP,
  setOTP,
} from "../services/common/redis";
import { AuthenticatedRequest } from "../types/express";
import {
  loginService,
  logoutService,
  registerService,
} from "../services/users/authlLayer";
import { AppError } from "../utils/appError";
import User from "../models/User";

/** * POST /api/auth/register */
export const register = asyncHandler(
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    const { name, email, password } = req.body;
    const userIp = req.ip || "0.0.0.0";

    if (!name || !email || !password)
      throw new AppError(400, "Please enter all fields.");
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(
        400,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      );
    }

    const { user, token } = await registerService(name, email, password);

    // Xóa giới hạn IP sau khi đăng ký thành công (Phòng trường hợp user bị chặn do thử đăng ký lỗi nhiều lần)
    await clearRateLimitsByIdentifier(userIp, "rate:auth");
    await clearRateLimitsByIdentifier(userIp, "rate:general");

    res.status(201).json({ ...user, token });
  },
);

/** * POST /api/auth/login */
export const login = asyncHandler(
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { email, password } = req.body;
    const userIp = req.ip || "0.0.0.0";

    if (!email || !password)
      throw new AppError(400, "Please provide both email and password.");

    // Service này chịu trách nhiệm: Kiểm tra user, verify pass, kiểm tra lockout trong Redis
    const { user, token } = await loginService(email, password, userIp);

    // Giải phóng IP khỏi rate limit nếu login thành công
    await clearRateLimitsByIdentifier(userIp, "rate:auth");
    await clearRateLimitsByIdentifier(userIp, "rate:general");

    res.json({ ...user, token });
  },
);

export const sendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body; // Loại bỏ 'action' khỏi body nếu không dùng đến

  if (!email) throw new AppError(400, "Email là bắt buộc.");

  const user = await User.findOne({ email });
  if (!user)
    throw new AppError(404, "Không tìm thấy người dùng với email này.");

  // 1. Tạo mã OTP 6 số
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 2. Lưu vào Redis
  // Vì trong redis.ts đã để action mặc định là "reset-password",
  // bạn chỉ cần truyền userId và otp.
  await setOTP(user.id.toString(), otp);

  // 3. Gửi Email (Hiện tại đang debug console)
  // await mailService.sendOTP(email, otp);

  console.log(`--- [DEBUG] OTP RESET cho ${email} là: ${otp} ---`);

  res.json({
    success: true,
    message: "Mã xác thực đã được gửi đến email của bạn.",
  });
});

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otpCode, newPassword } = req.body;

    if (!email || !otpCode || !newPassword)
      throw new AppError(400, "Email, OTP và mật khẩu mới là bắt buộc.");

    // Tìm user bằng email

    const user = await User.findOne({ email });

    if (!user) throw new AppError(404, "Email không tồn tại trên hệ thống.");

    // 1. Xác thực OTP từ Redis (Action: reset-password)

    const storedOtp = await getOTP(user.id.toString(), "reset-password");

    if (!storedOtp || storedOtp !== otpCode)
      throw new AppError(400, "Mã OTP không chính xác hoặc đã hết hạn.");

    // 2. Hash mật khẩu mới và lưu

    user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    await user.save();

    // 3. Dọn dẹp OTP

    await deleteOTP(user.id.toString(), "reset-password");

    await cacheUser(user.id.toString(), null, 0);

    res.json({
      success: true,
      message: "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.",
    });
  },
);

/** * POST /api/auth/logout */
export const logout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new AppError(401, "Token is required for logout.");

    // logoutService sẽ thực hiện addRevokedToken vào Redis với TTL khớp với thời gian còn lại của JWT
    await logoutService(token);

    res.json({ message: "Logged out successfully." });
  },
);
