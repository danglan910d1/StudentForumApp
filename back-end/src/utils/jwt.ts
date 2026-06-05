import jwt from "jsonwebtoken";

// Lấy secret key từ biến môi trường
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const TOKEN_EXPIRES = "30d"; // Token hết hạn sau 30 ngày

/**
 * Generates a JSON Web Token (JWT) for user authentication.
 * @param id - The user's MongoDB ID.
 * @param role - The user's role ('user' or 'admin').
 * @returns A signed JWT string.
 */
export const generateToken = (id: string, role: string): string => {
  // Ký token với ID người dùng và Role (Payload)
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES,
  });
};
