"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Lấy secret key từ biến môi trường
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const TOKEN_EXPIRES = "30d"; // Token hết hạn sau 30 ngày
/**
 * Generates a JSON Web Token (JWT) for user authentication.
 * @param id - The user's MongoDB ID.
 * @param role - The user's role ('user' or 'admin').
 * @returns A signed JWT string.
 */
const generateToken = (id, role) => {
    // Ký token với ID người dùng và Role (Payload)
    return jsonwebtoken_1.default.sign({ id, role }, JWT_SECRET, {
        expiresIn: TOKEN_EXPIRES,
    });
};
exports.generateToken = generateToken;
//# sourceMappingURL=jwt.js.map