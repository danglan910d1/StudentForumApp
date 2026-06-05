import "dotenv/config";

import express from "express";
import cors from "cors";
import { initializeConfig } from "./config";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRouters";
import topicRoutes from "./routes/topicRoutes";
import tagRoutes from "./routes/tagRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import likeRoutes from "./routes/likeRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import { globalErrorHandler } from "./middleware/error";
import { initSyncStatsJob } from "./core/scheduler";

// Khởi tạo ứng dụng Express
const app = express();

// --- 1. MIDDLEWARE TOÀN CỤC ---
app.use(
  cors({
    exposedHeaders: ["x-request-id"], // Cực kỳ quan trọng để FE đọc được ID
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. ĐỊNH TUYẾN (ROUTING) ---
// Áp dụng Rate Limiter cho các route nhạy cảm (Auth)
app.use("/api/auth", authRoutes); // Áp dụng Rate Limiter
app.use("/api/users", userRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/notifications", notificationRoutes);

// --- 3. GLOBAL ERROR HANDLER ---
// Bắt các lỗi được ném ra từ asyncHandler (ví dụ: lỗi DB, lỗi Logic)
app.use(globalErrorHandler);
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error("GLOBAL ERROR HANDLER:", err.stack);
//   // Trả về lỗi 500 (Server) hoặc lỗi tùy chỉnh nếu bạn muốn
//   res.status(500).json({
//     message: "An unexpected error occurred.",
//     error: err.message,
//   });
// });

// --- 4. KHỞI CHẠY SERVER & DB ---
const PORT = process.env.PORT || 5000;

// Sử dụng initializeConfig để kết nối DB và tải Env an toàn
initializeConfig()
  .then(() => {
    console.log("--- CHECK CLOUDINARY ENV ---");
    // console.log("Name:", process.env.CLOUDINARY_NAME);
    // console.log("Key:", process.env.CLOUDINARY_KEY);
    // console.log("Secret length:", process.env.CLOUDINARY_SECRET?.length);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    initSyncStatsJob();
    console.log("Background jobs initialized successfully");
  })
  .catch((err) => {
    console.error("Failed to start server due to configuration error:", err);
    process.exit(1);
  });
