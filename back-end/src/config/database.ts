// // Logic Kết nối DB
// // Chịu trách nhiệm cho logic kết nối và xử lý lỗi khởi tạo Database (DB). Nó tải MONGO_URI từ biến môi trường.

import mongoose from "mongoose";

// KHÔNG cần khai báo const MONGO_URI ở đây nữa vì nó đã được chuyển vào trong hàm.
/**
 * Initializes the MongoDB connection using Mongoose.
 * CHỈNH SỬA: Lấy biến môi trường BÊN TRONG hàm để đảm bảo dotenv đã tải xong.
 */
export const connectDB = async () => {
  // 1. Lấy MONGO_URI từ biến môi trường (Bắt buộc)
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error(
      "FATAL: MONGO_URI is not defined in environment variables. Database connection failed."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected successfully.`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};
