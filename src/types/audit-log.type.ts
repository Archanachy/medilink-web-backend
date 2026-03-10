import z from "zod";

export const AuditLogSchema = z.object({
    userId: z.string().optional(),
    action: z.string().min(1),
    resourceType: z.string().optional().default(""),
    resourceId: z.string().optional().default(""),
    oldValue: z.any().optional(),
    newValue: z.any().optional(),
    ipAddress: z.string().optional().default(""),
    userAgent: z.string().optional().default(""),
});

export type AuditLogType = z.infer<typeof AuditLogSchema>;
