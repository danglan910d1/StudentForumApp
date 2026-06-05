import mongoose from "mongoose";
import * as dotenv from "dotenv";
import User from "./src/models/User"; // Đảm bảo đường dẫn này đúng

// 1. Tải các biến môi trường từ file .env
dotenv.config();

// 2. Lấy biến từ process.env
const MONGO_URI = process.env.MONGO_URI || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // Lấy email admin cần xóa

// 3. Kiểm tra các biến bắt buộc
if (!MONGO_URI || !ADMIN_EMAIL) {
  console.error(
    "FATAL: Please define MONGO_URI and ADMIN_EMAIL in your .env file."
  );
  process.exit(1);
}

async function deleteAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    // 1. Tìm và xóa tài khoản Admin dựa trên email và role
    // Sử dụng findOneAndDelete để đảm bảo chỉ xóa đúng tài khoản Admin gốc
    const deletedUser = await User.findOneAndDelete({
      email: ADMIN_EMAIL,
      role: "admin",
    });

    if (deletedUser) {
      console.log(
        `Successfully deleted Admin: ${deletedUser.name} (${deletedUser.email}).`
      );
      console.log("Run Seed");
    } else {
      console.log(`No matching Super Admin found with email: ${ADMIN_EMAIL}.`);
    }
  } catch (error) {
    console.error("Error during admin deletion:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Chạy hàm xóa
deleteAdmin();
