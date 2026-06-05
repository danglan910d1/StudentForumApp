/**
 * Middleware Rate Limiting tùy chỉnh sử dụng Redis.
 * @param limit Số lần truy cập tối đa
 * @param windowInSeconds Khung thời gian
 * @param keyPrefix Tiền tố khóa (ví dụ: 'rate:ip' hoặc 'rate:user')
 */
export declare const redisRateLimiter: (limit: number, windowInSeconds: number, keyPrefix: string) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=rateLimit.d.ts.map