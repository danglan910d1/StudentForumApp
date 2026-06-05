import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./src/models/User";
import dotenv from "dotenv";

// 1. Tải các biến môi trường từ file .env
dotenv.config();

// 2. Lấy biến từ process.env (Sử dụng cú pháp an toàn)
// LƯU Ý: Phải có các biến này trong file .env
const MONGO_URI = process.env.MONGO_URI || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ADMIN_NAME = process.env.ADMIN_NAME || "Super Admin"; // Name có thể có giá trị mặc định

// 3. Kiểm tra các biến bắt buộc
if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "FATAL: Please define MONGO_URI, ADMIN_EMAIL, and ADMIN_PASSWORD in your .env file."
  );
  process.exit(1); // Dừng script nếu thiếu thông tin nhạy cảm
}

const SALT_ROUNDS = 10; // Giữ nguyên, đây là hằng số kỹ thuật

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB via .env variable.");

    // Kiểm tra xem Admin đã tồn tại chưa
    const adminExists = await User.findOne({ email: ADMIN_EMAIL });

    if (adminExists) {
      console.log("Super Admin already exists. Skipping creation.");
      return;
    }

    // 1. Băm mật khẩu (Bước bảo mật bắt buộc)
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

    // 2. Tạo User Admin
    const newAdmin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin", // Gán vai trò Admin
      status: "active",
    });

    console.log(`Super Admin created successfully!`);
    console.log(`ID: ${newAdmin._id}`);
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Name: ${newAdmin.name}`);
    console.log(`Password FE: ${ADMIN_PASSWORD}`);
    console.log(`Password BE: ${newAdmin.password}`);
  } catch (error) {
    console.error("Error during admin seeding:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Chạy hàm seed
seedAdmin();
