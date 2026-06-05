import bcrypt from "bcrypt";
import User from "../../models/User";
import {
  BCRYPT_SALT_ROUNDS,
  JWT_EXPIRATION_SECONDS,
} from "../../config/constants";
import { fetchUserByPipeline } from "./fetchUserByPipeline";
import { generateToken } from "../../utils/jwt";
import { AppError } from "../../utils/appError"; // Import AppError của bạn
import {
  addRevokedToken,
  cacheUser,
  clearLoginFailure,
  handleLoginFailure,
  isAccountLockedOut,
} from "../common/redis";

export const registerService = async (
  name: string,
  email: string,
  password: string
) => {
  const processedEmail = email.trim().toLowerCase();

  const userExists = await User.findOne({ email: processedEmail });
  if (userExists) {
    // 409: Conflict (Tài khoản đã tồn tại)
    throw new AppError(409, "User already exists.");
  }

  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name: name.trim(),
    email: processedEmail,
    password: hashedPassword,
  });

  const userResponse = await fetchUserByPipeline({ _id: newUser._id }, true);
  const token = generateToken(userResponse.userId, userResponse.role);
  await cacheUser(userResponse.userId, userResponse);

  return { user: userResponse, token };
};

export const loginService = async (
  email: string,
  password: string,
  ip: string
) => {
  const processedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: processedEmail }).select(
    "+password"
  );

  // Kiểm tra khóa tài khoản
  const isLocked = await isAccountLockedOut(processedEmail);
  if (isLocked) {
    console.log(`[LOCKOUT] Account ${processedEmail} is currently locked.`);
    throw new AppError(
      401,
      "Account is temporarily locked. Please try again later."
    );
  }

  // Kiểm tra mật khẩu & handle failure
  if (!user || !(await bcrypt.compare(password, user.password))) {
    if (user) await handleLoginFailure(processedEmail, ip);
    throw new AppError(401, "Invalid email or password.");
  }

  // Kiểm tra banned
  if (user.status === "banned") {
    throw new AppError(
      403,
      "Your account has been banned. Please contact admin."
    );
  }

  const userResponse = await fetchUserByPipeline({ _id: user._id }, true);
  const token = generateToken(userResponse.userId, userResponse.role);

  await clearLoginFailure(processedEmail);
  await cacheUser(userResponse.userId, userResponse);

  return { user: userResponse, token };
};

export const logoutService = async (token: string) => {
  if (!token) {
    throw new AppError(400, "No token provided.");
  }

  // Lưu token vào danh sách bị thu hồi trong Redis
  // JWT_EXPIRATION_SECONDS nên khớp với thời gian sống của JWT
  await addRevokedToken(token, JWT_EXPIRATION_SECONDS);

  return true;
};
