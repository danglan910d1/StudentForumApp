"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addJobToQueue = void 0;
const Post_1 = __importDefault(require("../../models/Post"));
const Comment_1 = __importDefault(require("../../models/Comment"));
// Map tên Model (string) sang đối tượng Model của Mongoose
// LƯU Ý: Thêm các Model khác (Topic, User,...) vào đây khi cần cập nhật bất đồng bộ
const updatableModels = {
    Post: Post_1.default,
    Comment: Comment_1.default,
};
/**
 * Mô phỏng việc thêm Job vào Hàng đợi (Producer Logic).
 * @param jobName - Tên của Job (Ví dụ: 'updatePostCounts')
 * @param data - Dữ liệu Job cần xử lý
 */
const addJobToQueue = (jobName, data) => {
    const Model = updatableModels[data.targetModelName];
    if (!Model) {
        console.error(`[JOB QUEUE MOCK] Invalid Model Name: ${data.targetModelName}. Job rejected.`);
        return;
    }
    // --- MOCK LOGIC (THAY THẾ BẰNG BullMQ HOẶC Kue) ---
    console.log(`[JOB QUEUE MOCK] Job added: ${jobName} for ${data.targetModelName} ID: ${data.targetId}`);
    // Dùng setTimeout để mô phỏng sự bất đồng bộ của Worker Process
    setTimeout(() => {
        // Sử dụng Model được xác định động
        Model.updateOne({ _id: data.targetId }, data.update)
            .exec()
            .then(() => {
            console.log(`[JOB QUEUE MOCK] Worker executed update for ${data.targetModelName} ${data.targetId}`);
        })
            .catch((err) => {
            console.error(`[JOB QUEUE MOCK] Worker failed for ${data.targetModelName} ${data.targetId}:`, err);
            // Logic retry hoặc DLQ (Dead Letter Queue) sẽ được xử lý ở đây
        });
    }, 50); // Mô phỏng độ trễ vài mili giây của Worker
    // ---------------------------------------------------
};
exports.addJobToQueue = addJobToQueue;
//# sourceMappingURL=jobQueue.js.map