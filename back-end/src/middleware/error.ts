import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Nếu là lỗi do mình chủ động ném ra (AppError - 400, 401, 403, 409...)
  if (err instanceof AppError) {
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
