/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const database = "student-community-forum";
const collections = ["users", "topics", "tags", "posts", "comments", "likes"];

// Create a new database.
use(database);

// Create a new collection.
collections.forEach((name) => {
  db.createCollection(name);
});

// Delete existing data (to avoid duplicates)
collections.forEach((name) => {
  db[name].deleteMany({});
});

// Insert a sample user
const userResult = db.users.insertOne({
  name: "Nguyen Van A",
  email: "a@example.com",
  password: "$2b$10$hashedpassword", // example hashed password
  role: "user",
  avatar: "",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
});
const userId = userResult.insertedId;

// Insert a sample topics
const topicResult = db.topics.insertOne({
  name: "Chia sẻ tài liệu",
  slug: "chia-se-tai-lieu",
  description: "Mục dành cho chia sẻ tài liệu học tập",
  createdBy: userId, // admin userId
  status: "approved", // "pending" | "approved" | "rejected"
  created_at: new Date(),
  updated_at: new Date(),
});
const topicId = topicResult.insertedId;

// Insert a sample tag suggested by user (status pending)
const tagResult = db.tags.insertOne({
  name: "Toán",
  topicId: topicId, // tag phụ thuộc topic
  createdBy: userId, // user gợi ý tag
  status: "approved", // "pending" | "approved" | "rejected"
  created_at: new Date(),
  updated_at: new Date(),
});
const tagId = tagResult.insertedId;

// Insert a sample post
const postResult = db.posts.insertOne({
  userId: userId,
  topicId: topicId, // bắt buộc topic
  tags: [tagId], // chỉ chứa tag đã approved
  title: "Bài viết đầu tiên",
  content: "Nội dung mẫu bài viết.",
  status: "approved", // "pending" | "approved" | "rejected"
  is_sticky: false,
  views_count: 0,
  likes_count: 0,
  comments_count: 0,
  created_at: new Date(),
  updated_at: new Date(),
});
const postId = postResult.insertedId;

// Insert a sample comment
db.comments.insertOne({
  userId: userId,
  postId: postId,
  content: "Bình luận mẫu.",
  likes_count: 0,
  created_at: new Date(),
  updated_at: new Date(),
});

// Insert a sample like (post)
db.likes.insertOne({
  userId: userId,
  targetType: "post", // "post" | "comment"
  targetId: postId,
  created_at: new Date(),
});

// The prototype form to create a collection:
/* db.createCollection( <name>,
  {
    capped: <boolean>,
    autoIndexId: <boolean>,
    size: <number>,
    max: <number>,
    storageEngine: <document>,
    validator: <document>,
    validationLevel: <string>,
    validationAction: <string>,
    indexOptionDefaults: <document>,
    viewOn: <string>,
    pipeline: <pipeline>,
    collation: <document>,
    writeConcern: <document>,
    timeseries: { // Added in MongoDB 5.0
      timeField: <string>, // required for time series collections
      metaField: <string>,
      granularity: <string>,
      bucketMaxSpanSeconds: <number>, // Added in MongoDB 6.3
      bucketRoundingSeconds: <number>, // Added in MongoDB 6.3
    },
    expireAfterSeconds: <number>,
    clusteredIndex: <document>, // Added in MongoDB 5.3
  }
)*/

// More information on the `createCollection` command can be found at:
// https://www.mongodb.com/docs/manual/reference/method/db.createCollection/
