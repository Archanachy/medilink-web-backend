import z from "zod";
import { NotificationSchema } from "../types/notification.type";

export const CreateNotificationDTO = NotificationSchema;
export type CreateNotificationDTO = z.infer<typeof CreateNotificationDTO>;

export const MarkNotificationReadDTO = z.object({
    isRead: z.boolean().default(true),
});
export type MarkNotificationReadDTO = z.infer<typeof MarkNotificationReadDTO>;
