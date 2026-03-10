import z from "zod";
import { TicketResponseSchema } from "../types/ticket-response.type";

export const CreateTicketResponseDTO = TicketResponseSchema.pick({
    message: true,
    attachments: true,
});
export type CreateTicketResponseDTO = z.infer<typeof CreateTicketResponseDTO>;
