import z from "zod";

export const SupportTicketSchema = z.object({
    createdBy: z.string(),
    role: z.enum(["patient", "doctor", "admin"]).default("patient"),
    subject: z.string().min(1),
    description: z.string().min(1),
    status: z.enum(["open", "pending", "closed"]).default("open"),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    category: z.string().optional().default(""),
    assignedTo: z.string().optional(),
    ticketNumber: z.string().min(1),
    attachments: z.array(z.object({
        fileUrl: z.string(),
        filename: z.string(),
        mimeType: z.string(),
        size: z.number(),
    })).optional().default([]),
    lastResponseAt: z.date().optional(),
});

export type SupportTicketType = z.infer<typeof SupportTicketSchema>;
