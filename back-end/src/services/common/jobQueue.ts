import Post from "../../models/Post";
import Comment from "../../models/Comment";
import { Model } from "mongoose";

// Định nghĩa các Model có thể được cập nhật qua Job Queue
type UpdatableModelName = "Post" | "Comment";

// Map tên Model (string) sang đối tượng Model của Mongoose
// LƯU Ý: Thêm các Model khác (Topic, User,...) vào đây khi cần cập nhật bất đồng bộ
const updatableModels: { [key in UpdatableModelName]: Model<any> } = {
  Post: Post,
  Comment: Comment,
};

/**
 * Interface cho dữ liệu cần được cập nhật (Generic)
 */
interface JobData {
  targetId: string; // ID của đối tượng mục tiêu (Post ID, Comment ID,...)
  targetModelName: UpdatableModelName; // Tên Model để xác định Collection
  update: any; // Ví dụ: { $inc: { views_count: 1 } }
}

/**
 * Mô phỏng việc thêm Job vào Hàng đợi (Producer Logic).
 * @param jobName - Tên của Job (Ví dụ: 'updatePostCounts')
 * @param data - Dữ liệu Job cần xử lý
 */
export const addJobToQueue = (jobName: string, data: JobData): void => {
  const Model = updatableModels[data.targetModelName];

  if (!Model) {
    console.error(
      `[JOB QUEUE MOCK] Invalid Model Name: ${data.targetModelName}. Job rejected.`
    );
    return;
  }

  // --- MOCK LOGIC (THAY THẾ BẰNG BullMQ HOẶC Kue) ---
  console.log(
    `[JOB QUEUE MOCK] Job added: ${jobName} for ${data.targetModelName} ID: ${data.targetId}`
  );

  // Dùng setTimeout để mô phỏng sự bất đồng bộ của Worker Process
  setTimeout(() => {
    // Sử dụng Model được xác định động
    Model.updateOne({ _id: data.targetId }, data.update)
      .exec()
      .then(() => {
        console.log(
          `[JOB QUEUE MOCK] Worker executed update for ${data.targetModelName} ${data.targetId}`
        );
      })
      .catch((err) => {
        console.error(
          `[JOB QUEUE MOCK] Worker failed for ${data.targetModelName} ${data.targetId}:`,
          err
        );
        // Logic retry hoặc DLQ (Dead Letter Queue) sẽ được xử lý ở đây
      });
  }, 50); // Mô phỏng độ trễ vài mili giây của Worker
  // ---------------------------------------------------
};
