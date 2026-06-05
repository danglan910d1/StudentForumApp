require("dotenv").config(); // <-- THÊM DÒNG NÀY ĐẦU FILE
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;
// 2. Định nghĩa Schema (Phải khớp với Model Topic của bạn)
const topicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: String,
    status: { type: String, default: "approved" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
); // Tự động tạo createdAt và updatedAt

const Topic = mongoose.model("Topic", topicSchema);

// 3. Dữ liệu của bạn kèm ID Admin
const ADMIN_ID = "691ee87e6a33ec17edb4170b";

const data = [
  {
    name: "Lập trình & Thuật toán",
    slug: "lap-trinh-thuat-toan",
    description:
      "Nền tảng ngôn ngữ C/C++, Java và tư duy cấu trúc dữ liệu, giải thuật.",
    status: "approved",
    createdBy: ADMIN_ID,
  },
  {
    name: "Phát triển Web",
    slug: "phat-trien-web",
    description:
      "Thiết kế giao diện (Frontend) và xây dựng hệ thống (Backend) website.",
    status: "approved",
    createdBy: ADMIN_ID,
  },
  {
    name: "Cơ sở dữ liệu",
    slug: "co-so-du-lieu",
    description: "Thiết kế, truy vấn SQL và quản trị các hệ thống dữ liệu.",
    status: "approved",
    createdBy: ADMIN_ID,
  },
  {
    name: "Kỹ thuật phần mềm",
    slug: "ky-thuat-phan-mem",
    description:
      "Quy trình phát triển phần mềm, quản lý mã nguồn và thực hiện đồ án.",
    status: "approved",
    createdBy: ADMIN_ID,
  },
  {
    name: "Lập trình ứng dụng",
    slug: "lap-trinh-ung-dung",
    description:
      "Xây dựng ứng dụng Desktop (Java, C#) và các ứng dụng thực tế.",
    status: "approved",
    createdBy: ADMIN_ID,
  },
  {
    name: "Hệ thống & Bảo mật",
    slug: "he-thong-bao-mat",
    description: "Mạng máy tính, an toàn thông tin và kỹ thuật phần cứng.",
    status: "approved",
    createdBy: ADMIN_ID,
  },
  {
    name: "Kỹ năng & Việc làm",
    slug: "ky-nang-viec-lam",
    description:
      "Kỹ năng mềm, tiếng Anh chuyên ngành và kinh nghiệm tuyển dụng, thực tập.",
    status: "approved",
    createdBy: ADMIN_ID,
  },
  {
    name: "Góc sinh viên",
    slug: "goc-sinh-vien",
    description:
      "Nơi giao lưu, thảo luận về đời sống sinh viên, hoạt động ngoại khóa và tin tức trường học.",
    status: "approved",
    createdBy: ADMIN_ID,
  },
];

// 4. Hàm thực thi
async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🚀 Đã kết nối MongoDB thành công.");

    // Xóa sạch dữ liệu cũ trong collection topics
    await Topic.deleteMany({});
    console.log("🧹 Đã dọn dẹp collection Topic cũ.");

    // Chèn dữ liệu mới
    // Dùng .create() để Mongoose tự kích hoạt timestamps
    await Topic.create(data);
    console.log(
      "✅ Đã chèn 8 Topics mới thành công với đầy đủ timestamps và createdBy."
    );
  } catch (error) {
    console.error("❌ Lỗi khi seed data:", error);
  } finally {
    mongoose.connection.close();
    console.log("🔌 Đã ngắt kết nối.");
    process.exit();
  }
}

seedDB();
