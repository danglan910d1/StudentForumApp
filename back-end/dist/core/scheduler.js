"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSyncStatsJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const redis_1 = __importDefault(require("../services/common/redis"));
const Post_1 = __importDefault(require("../models/Post"));
/**
 * Job đồng bộ dữ liệu từ Redis xuống MongoDB
 * Chạy định kỳ mỗi 10 phút
 */
const initSyncStatsJob = () => {
    node_cron_1.default.schedule("*/10 * * * *", async () => {
        console.log("--- [Cron] Bắt đầu đồng bộ View/Like từ Redis ---");
        try {
            // 1. Sử dụng SCAN thay vì KEYS để an toàn cho hiệu năng
            let cursor = "0";
            const viewUpdates = {};
            do {
                const reply = await redis_1.default.scan(cursor, {
                    MATCH: "views:*",
                    COUNT: 100,
                });
                cursor = reply.cursor;
                for (const key of reply.keys) {
                    const postId = key.split(":")[1];
                    if (postId) {
                        const count = await redis_1.default.get(key);
                        if (count) {
                            viewUpdates[postId] =
                                (viewUpdates[postId] || 0) + parseInt(count);
                        }
                    }
                }
            } while (cursor !== "0");
            // 2. Gom tất cả vào một lệnh bulkWrite để tối ưu Database
            const postIds = Object.keys(viewUpdates);
            if (postIds.length > 0) {
                const bulkOps = postIds.map((id) => ({
                    updateOne: {
                        filter: { _id: id },
                        update: { $inc: { views_count: viewUpdates[id] } },
                    },
                }));
                await Post_1.default.bulkWrite(bulkOps);
                // 3. Xóa các key đã đồng bộ trên Redis
                const keysToDelete = postIds.map((id) => `views:${id}`);
                await redis_1.default.del(keysToDelete);
                console.log(`--- [Cron] Đã cập nhật ${postIds.length} bài viết ---`);
            }
            else {
                console.log("--- [Cron] Không có dữ liệu mới để đồng bộ ---");
            }
        }
        catch (error) {
            console.error("--- [Cron] Lỗi đồng bộ stats:", error);
        }
    });
};
exports.initSyncStatsJob = initSyncStatsJob;
//# sourceMappingURL=scheduler.js.map