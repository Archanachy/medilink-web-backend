import z from "zod";

export const TicketResponseSchema = z.object({
    ticketId: z.string(),
    userId: z.string(),
    message: z.string().min(1),
    attachments: z.array(z.object({
        fileUrl: z.string(),
        filename: z.string(),
        mimeType: z.string(),
        size: z.number(),
    })).optional().default([]),
});

export type TicketResponseType = z.infer<typeof TicketResponseSchema>;
