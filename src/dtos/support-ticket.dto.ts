import z from "zod";
import { SupportTicketSchema } from "../types/support-ticket.type";

export const CreateSupportTicketDTO = SupportTicketSchema.pick({
    subject: true,
    description: true,
    priority: true,
    category: true,
    attachments: true,
});
export type CreateSupportTicketDTO = z.infer<typeof CreateSupportTicketDTO>;

export const UpdateSupportTicketStatusDTO = z.object({
    status: z.enum(["open", "pending", "closed"]),
});
export type UpdateSupportTicketStatusDTO = z.infer<typeof UpdateSupportTicketStatusDTO>;

export const AssignSupportTicketDTO = z.object({
    assignedTo: z.string(),
});
export type AssignSupportTicketDTO = z.infer<typeof AssignSupportTicketDTO>;
