import * as dotenv from "dotenv";

// Nạp biến môi trường NGAY LẬP TỨC khi file này được import ở bất cứ đâu
dotenv.config();

import { connectDB } from "./database";

export const initializeConfig = async () => {
  console.log("--- Starting Server Configuration ---");
  await connectDB();
  console.log(`Current Environment: ${process.env.NODE_ENV || "Development"}`);
  console.log(`JWT Secret Loaded: ${!!process.env.JWT_SECRET}`);
  console.log("--- Configuration Complete ---");
};
