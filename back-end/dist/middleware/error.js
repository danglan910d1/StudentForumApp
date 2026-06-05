"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const appError_1 = require("../utils/appError");
const globalErrorHandler = (err, req, res, next) => {
    // 1. Nếu là lỗi do mình chủ động ném ra (AppError - 400, 401, 403, 409...)
    if (err instanceof appError_1.AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
        });
    }
    // 2. Nếu là lỗi kỹ thuật không mong muốn (Lỗi 500)
    // Trong môi trường development nên log err.stack để dễ debug
    console.error("ERROR:", err);
    res.status(500).json({
        error: "Something went wrong on our end!",
        // message: err.message // Chỉ bật dòng này khi đang code (dev), tắt khi chạy thật (prod)
    });
};
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=error.js.map