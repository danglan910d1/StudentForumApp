type UpdatableModelName = "Post" | "Comment";
/**
 * Interface cho dữ liệu cần được cập nhật (Generic)
 */
interface JobData {
    targetId: string;
    targetModelName: UpdatableModelName;
    update: any;
}
/**
 * Mô phỏng việc thêm Job vào Hàng đợi (Producer Logic).
 * @param jobName - Tên của Job (Ví dụ: 'updatePostCounts')
 * @param data - Dữ liệu Job cần xử lý
 */
export declare const addJobToQueue: (jobName: string, data: JobData) => void;
export {};
//# sourceMappingURL=jobQueue.d.ts.map