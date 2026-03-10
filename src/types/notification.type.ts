import z from "zod";

export const NotificationSchema = z.object({
    userId: z.string(),
    role: z.enum(["patient", "doctor", "admin"]).optional(),
    title: z.string().min(1),
    message: z.string().min(1),
    type: z.string().optional().default("general"),
    data: z.record(z.string(), z.any()).optional().default({}),
    isRead: z.boolean().optional().default(false),
});

export type NotificationType = z.infer<typeof NotificationSchema>;
