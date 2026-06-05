import mongoose, { Document, Types } from "mongoose";
export declare enum NotificationType {
    POST_APPROVED = "post_approved",
    POST_REJECTED = "post_rejected",
    POST_SUBMITTED = "post_submitted",// Khi User gửi bài mới chờ duyệt
    NEW_COMMENT = "new_comment",
    NEW_REPLY = "new_reply",
    NEW_LIKE = "new_like",
    SYSTEM_ALERT = "system_alert"
}
export interface INotification extends Document {
    recipientId: Types.ObjectId;
    senderId?: Types.ObjectId;
    type: NotificationType;
    entityId: Types.ObjectId;
    entityType: "post" | "comment";
    content: string;
    is_read: boolean;
    createdAt: Date;
}
declare const _default: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Notification.d.ts.map