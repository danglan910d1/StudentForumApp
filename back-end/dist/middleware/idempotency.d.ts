import { Request, Response, NextFunction } from "express";
declare global {
    var processingRequests: Set<string>;
}
/**
 * Middleware chống Duplicate Request bằng Idempotency Key (x-request-id).
 * Chỉ nên áp dụng cho các route POST/PUT có tác dụng phụ (side effects).
 */
export declare const preventDuplicateRequest: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=idempotency.d.ts.map