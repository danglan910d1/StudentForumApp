"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutService = exports.loginService = exports.registerService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../../models/User"));
const constants_1 = require("../../config/constants");
const fetchUserByPipeline_1 = require("./fetchUserByPipeline");
const jwt_1 = require("../../utils/jwt");
const appError_1 = require("../../utils/appError"); // Import AppError của bạn
const redis_1 = require("../common/redis");
const registerService = async (name, email, password) => {
    const processedEmail = email.trim().toLowerCase();
    const userExists = await User_1.default.findOne({ email: processedEmail });
    if (userExists) {
        // 409: Conflict (Tài khoản đã tồn tại)
        throw new appError_1.AppError(409, "User already exists.");
    }
    const salt = await bcrypt_1.default.genSalt(constants_1.BCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt_1.default.hash(password, salt);
    const newUser = await User_1.default.create({
        name: name.trim(),
        email: processedEmail,
        password: hashedPassword,
    });
    const userResponse = await (0, fetchUserByPipeline_1.fetchUserByPipeline)({ _id: newUser._id }, true);
    const token = (0, jwt_1.generateToken)(userResponse.userId, userResponse.role);
    await (0, redis_1.cacheUser)(userResponse.userId, userResponse);
    return { user: userResponse, token };
};
exports.registerService = registerService;
const loginService = async (email, password, ip) => {
    const processedEmail = email.trim().toLowerCase();
    const user = await User_1.default.findOne({ email: processedEmail }).select("+password");
    // Kiểm tra khóa tài khoản
    const isLocked = await (0, redis_1.isAccountLockedOut)(processedEmail);
    if (isLocked) {
        console.log(`[LOCKOUT] Account ${processedEmail} is currently locked.`);
        throw new appError_1.AppError(401, "Account is temporarily locked. Please try again later.");
    }
    // Kiểm tra mật khẩu & handle failure
    if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
        if (user)
            await (0, redis_1.handleLoginFailure)(processedEmail, ip);
        throw new appError_1.AppError(401, "Invalid email or password.");
    }
    // Kiểm tra banned
    if (user.status === "banned") {
        throw new appError_1.AppError(403, "Your account has been banned. Please contact admin.");
    }
    const userResponse = await (0, fetchUserByPipeline_1.fetchUserByPipeline)({ _id: user._id }, true);
    const token = (0, jwt_1.generateToken)(userResponse.userId, userResponse.role);
    await (0, redis_1.clearLoginFailure)(processedEmail);
    await (0, redis_1.cacheUser)(userResponse.userId, userResponse);
    return { user: userResponse, token };
};
exports.loginService = loginService;
const logoutService = async (token) => {
    if (!token) {
        throw new appError_1.AppError(400, "No token provided.");
    }
    // Lưu token vào danh sách bị thu hồi trong Redis
    // JWT_EXPIRATION_SECONDS nên khớp với thời gian sống của JWT
    await (0, redis_1.addRevokedToken)(token, constants_1.JWT_EXPIRATION_SECONDS);
    return true;
};
exports.logoutService = logoutService;
//# sourceMappingURL=authlLayer.js.map