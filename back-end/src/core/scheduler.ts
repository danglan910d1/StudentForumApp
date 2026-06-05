import cron from "node-cron";
import redisClient from "../services/common/redis";
import Post from "../models/Post";

/**
 * Job đồng bộ dữ liệu từ Redis xuống MongoDB
 * Chạy định kỳ mỗi 10 phút
 */
export const initSyncStatsJob = () => {
  cron.schedule("*/10 * * * *", async () => {
    console.log("--- [Cron] Bắt đầu đồng bộ View/Like từ Redis ---");

    try {
      // 1. Sử dụng SCAN thay vì KEYS để an toàn cho hiệu năng
      let cursor = "0";
      const viewUpdates: Record<string, number> = {};

      do {
        const reply = await redisClient.scan(cursor, {
          MATCH: "views:*",
          COUNT: 100,
        });

        cursor = reply.cursor;

        for (const key of reply.keys) {
          const postId = key.split(":")[1];
          if (postId) {
            const count = await redisClient.get(key);
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

        await Post.bulkWrite(bulkOps);

        // 3. Xóa các key đã đồng bộ trên Redis
        const keysToDelete = postIds.map((id) => `views:${id}`);
        await redisClient.del(keysToDelete);

        console.log(`--- [Cron] Đã cập nhật ${postIds.length} bài viết ---`);
      } else {
        console.log("--- [Cron] Không có dữ liệu mới để đồng bộ ---");
      }
    } catch (error) {
      console.error("--- [Cron] Lỗi đồng bộ stats:", error);
    }
  });
};
