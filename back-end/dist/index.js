"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRouters_1 = __importDefault(require("./routes/userRouters"));
const topicRoutes_1 = __importDefault(require("./routes/topicRoutes"));
const tagRoutes_1 = __importDefault(require("./routes/tagRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const likeRoutes_1 = __importDefault(require("./routes/likeRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const error_1 = require("./middleware/error");
const scheduler_1 = require("./core/scheduler");
// Khởi tạo ứng dụng Express
const app = (0, express_1.default)();
// --- 1. MIDDLEWARE TOÀN CỤC ---
app.use((0, cors_1.default)({
    exposedHeaders: ["x-request-id"], // Cực kỳ quan trọng để FE đọc được ID
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// --- 2. ĐỊNH TUYẾN (ROUTING) ---
// Áp dụng Rate Limiter cho các route nhạy cảm (Auth)
app.use("/api/auth", authRoutes_1.default); // Áp dụng Rate Limiter
app.use("/api/users", userRouters_1.default);
app.use("/api/topics", topicRoutes_1.default);
app.use("/api/tags", tagRoutes_1.default);
app.use("/api/posts", postRoutes_1.default);
app.use("/api/comments", commentRoutes_1.default);
app.use("/api/likes", likeRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
// --- 3. GLOBAL ERROR HANDLER ---
// Bắt các lỗi được ném ra từ asyncHandler (ví dụ: lỗi DB, lỗi Logic)
app.use(error_1.globalErrorHandler);
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
(0, config_1.initializeConfig)()
    .then(() => {
    console.log("--- CHECK CLOUDINARY ENV ---");
    // console.log("Name:", process.env.CLOUDINARY_NAME);
    // console.log("Key:", process.env.CLOUDINARY_KEY);
    // console.log("Secret length:", process.env.CLOUDINARY_SECRET?.length);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    (0, scheduler_1.initSyncStatsJob)();
    console.log("Background jobs initialized successfully");
})
    .catch((err) => {
    console.error("Failed to start server due to configuration error:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map