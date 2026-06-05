const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ten_database_cua_ban";
const ADMIN_ID = "691ee87e6a33ec17edb4170b";

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    status: { type: String, default: "approved" },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      default: null,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Tag = mongoose.model("Tag", tagSchema);

const tagsData = [
  // 1. Lập trình & Thuật toán (694fb63a35a29c5eff0b8858)
  { name: "C++", slug: "c-plus-plus", topicId: "694fb63a35a29c5eff0b8858" },
  {
    name: "Algorithms",
    slug: "algorithms",
    topicId: "694fb63a35a29c5eff0b8858",
  },
  {
    name: "Data Structures",
    slug: "data-structures",
    topicId: "694fb63a35a29c5eff0b8858",
  },

  // 2. Phát triển Web (694fb63a35a29c5eff0b8859)
  { name: "React", slug: "react", topicId: "694fb63a35a29c5eff0b8859" },
  {
    name: "JavaScript",
    slug: "javascript",
    topicId: "694fb63a35a29c5eff0b8859",
  },
  { name: "NodeJS", slug: "node-js", topicId: "694fb63a35a29c5eff0b8859" },

  // 3. Cơ sở dữ liệu (694fb63a35a29c5eff0b885a)
  { name: "SQL", slug: "sql", topicId: "694fb63a35a29c5eff0b885a" },
  { name: "NoSQL", slug: "nosql", topicId: "694fb63a35a29c5eff0b885a" },
  { name: "Query", slug: "query", topicId: "694fb63a35a29c5eff0b885a" },

  // 4. Kỹ thuật phần mềm (694fb63a35a29c5eff0b885b)
  { name: "Git", slug: "git", topicId: "694fb63a35a29c5eff0b885b" },
  {
    name: "Clean Code",
    slug: "clean-code",
    topicId: "694fb63a35a29c5eff0b885b",
  },
  { name: "UML", slug: "uml", topicId: "694fb63a35a29c5eff0b885b" },

  // 5. Lập trình ứng dụng (694fb63a35a29c5eff0b885c)
  { name: "Java", slug: "java", topicId: "694fb63a35a29c5eff0b885c" },
  { name: "C#", slug: "c-sharp", topicId: "694fb63a35a29c5eff0b885c" },
  { name: "OOP", slug: "oop", topicId: "694fb63a35a29c5eff0b885c" },

  // 6. Hệ thống & Bảo mật (694fb63a35a29c5eff0b885d)
  {
    name: "Networking",
    slug: "networking",
    topicId: "694fb63a35a29c5eff0b885d",
  },
  { name: "Security", slug: "security", topicId: "694fb63a35a29c5eff0b885d" },
  { name: "Docker", slug: "docker", topicId: "694fb63a35a29c5eff0b885d" },

  // 7. Kỹ năng & Việc làm (694fb63a35a29c5eff0b885e)
  { name: "CV", slug: "cv", topicId: "694fb63a35a29c5eff0b885e" },
  { name: "English", slug: "english", topicId: "694fb63a35a29c5eff0b885e" },
  {
    name: "Internship",
    slug: "internship",
    topicId: "694fb63a35a29c5eff0b885e",
  },

  // 8. Góc sinh viên (694fb63a35a29c5eff0b885f)
  { name: "Giao lưu", slug: "giao-luu", topicId: "694fb63a35a29c5eff0b885f" },
  { name: "Tin tức", slug: "tin-tuc", topicId: "694fb63a35a29c5eff0b885f" },

  // 9. TAG TỰ DO (topicId: null)
  { name: "Tài liệu", slug: "tai-lieu", topicId: null },
  { name: "Hỏi đáp", slug: "hoi-dap", topicId: null },
  { name: "Hot", slug: "hot", topicId: null },
].map((tag) => ({ ...tag, createdBy: ADMIN_ID, status: "approved" }));

async function seedTags() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🚀 Kết nối DB thành công.");

    await Tag.deleteMany({}); // Cẩn thận: Xóa hết tag cũ
    console.log("🧹 Đã dọn dẹp Tags.");

    await Tag.create(tagsData);
    console.log(`✅ Đã chèn thành công ${tagsData.length} Tags.`);
  } catch (err) {
    console.error("❌ Lỗi:", err);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
}

seedTags();
