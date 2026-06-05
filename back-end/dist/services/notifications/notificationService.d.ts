import { Types } from "mongoose";
import { NotificationType } from "../../models/Notification";
export interface ICreateNotificationInput {
    recipientId: string | Types.ObjectId;
    senderId?: string | Types.ObjectId;
    type: NotificationType;
    entityId: string | Types.ObjectId;
    entityType: "post" | "comment";
    content: string;
}
export declare const createNotification: (data: ICreateNotificationInput) => Promise<(import("mongoose").Document<unknown, {}, import("../../models/Notification").INotification, {}, {}> & import("../../models/Notification").INotification & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | undefined>;
export declare const markAllAsReadService: (userId: string | Types.ObjectId) => Promise<import("mongoose").UpdateWriteOpResult>;
export declare const deleteNotificationService: (notificationId: string, userId: string | Types.ObjectId) => Promise<(import("mongoose").Document<unknown, {}, import("../../models/Notification").INotification, {}, {}> & import("../../models/Notification").INotification & Required<{
    _id: unknown;
}> & {
    __v: number;
}) | null>;
//# sourceMappingURL=notificationService.d.ts.map