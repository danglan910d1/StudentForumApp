import { NotificationType } from "../models/Notification";
export declare const generateNotificationContent: (type: NotificationType, data: {
    title?: string | undefined;
    reason?: string | undefined;
    userName?: string | undefined;
    targetType?: "post" | "comment" | undefined;
}) => string;
//# sourceMappingURL=notificationHelper.d.ts.map