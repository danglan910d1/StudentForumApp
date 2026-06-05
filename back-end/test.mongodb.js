// // // Chọn database của bạn
// // use("test");

// // db.posts.aggregate([
// //   { $match: { _id: ObjectId("69593e3a10ce46fe0797fa01") } }, // Thay ID bài viết ở đây
// //   {
// //     $lookup: {
// //       from: "tags", // Đảm bảo tên collection trong DB đúng là "tags" (viết thường, có s)
// //       localField: "tags",
// //       foreignField: "_id",
// //       as: "debug_tags",
// //     },
// //   },
// //   {
// //     $project: {
// //       title: 1,
// //       tags_in_db: "$tags", // Xem ID lưu trong mảng này là String hay ObjectId
// //       debug_tags: 1,
// //     },
// //   },
// // ]);

// // Chạy trong MongoDB Playground
// use("test");
// db.posts.updateOne(
//   { _id: ObjectId("69593e3a10ce46fe0797fa01") }, // ID bài viết bạn đang check
//   { $set: { tags: [ObjectId("696176a135e2791354ae161a")] } } // Gán ID Tag đang thực sự tồn tại
// );

// use("test");

// db.posts.aggregate([
//   { $match: { _id: ObjectId("69593e3a10ce46fe0797fa01") } },
//   {
//     $lookup: {
//       from: "tags",
//       localField: "tags",
//       foreignField: "_id",
//       as: "debug_tags",
//     },
//   },
//   {
//     $project: {
//       title: 1,
//       tags_hien_tai_trong_db: "$tags",
//       ket_qua_lookup: "$debug_tags", // Nếu cái này có data -> Thành công!
//     },
//   },
// ]);

// Chạy lệnh này trong Playground để xóa sạch tags lỗi cho tất cả các bài viết (chỉ giữ lại tags xịn)
// use("test");
// db.posts.updateMany(
//   {},
//   { $set: { tags: [ObjectId("696176a135e2791354ae161a")] } } // Tạm thời gán 1 tag xịn cho tất cả bài viết để test
// );

// Chạy lệnh này trong Playground để xóa sạch tags lỗi cho tất cả các bài viết (chỉ giữ lại tags xịn)
// use("test");
// const result = db.posts.updateMany(
//   {}, // Update tất cả bài viết
//   { $set: { tags: [ObjectId("696176a135e2791354ae161a")] } }
// );
// print("Số bài viết đã được cập nhật: " + result.modifiedCount);

use("test");
// db.tags.find({ _id: { $in: [ID_CUA_TAG_DO] } });

// db.tags.insertOne({
//   name: "React 19 New",
//   slug: "react-19-new",
//   status: "pending", // QUAN TRỌNG: Status là pending
//   topicId: ObjectId("694fb63a35a29c5eff0b8859"),
//   is_deleted: false,
//   createdAt: new Date(),
// });
// db.posts.updateOne(
//   { _id: ObjectId("69593e3a10ce46fe0797fa01") },
//   {
//     $set: {
//       pending_tags: [ObjectId("697000000000000000000001")],
//     },
//   }
// );

const pendingTag = db.tags.findOne({ slug: "react-19-new" });

// 2. Cập nhật bài viết với ID chuẩn từ bước 1
db.posts.updateOne(
  { _id: ObjectId("69593e3a10ce46fe0797fa01") },
  { $set: { pending_tags: [pendingTag._id] } }
);

// 3. Chạy thử một phần của Pipeline (Lookup) để xem nó có khớp không
db.posts.aggregate([
  { $match: { _id: ObjectId("69593e3a10ce46fe0797fa01") } },
  {
    $lookup: {
      from: "tags",
      localField: "pending_tags",
      foreignField: "_id",
      as: "test_pending_check",
    },
  },
  {
    $project: {
      title: 1,
      pending_tags_raw: "$pending_tags",
      pending_tags_joined: "$test_pending_check",
    },
  },
]);
