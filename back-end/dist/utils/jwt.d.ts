/**
 * Generates a JSON Web Token (JWT) for user authentication.
 * @param id - The user's MongoDB ID.
 * @param role - The user's role ('user' or 'admin').
 * @returns A signed JWT string.
 */
export declare const generateToken: (id: string, role: string) => string;
//# sourceMappingURL=jwt.d.ts.map