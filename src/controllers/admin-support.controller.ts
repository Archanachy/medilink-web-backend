import { Request, Response } from "express";
import z from "zod";
import { AssignSupportTicketDTO, UpdateSupportTicketStatusDTO } from "../dtos/support-ticket.dto";
import { CreateTicketResponseDTO } from "../dtos/ticket-response.dto";
import { SupportTicketService } from "../services/support-ticket.service";

const service = new SupportTicketService();

export class AdminSupportController {
    async list(req: Request, res: Response) {
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "25"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 25 : limitRaw, 1), 100);
        const status = typeof req.query.status === "string" ? req.query.status : undefined;

        const { data, total } = await service.listAll({ page, limit, status });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async stats(_req: Request, res: Response) {
        const stats = await service.getStats();
        return res.status(200).json({ success: true, data: stats });
    }

    async assign(req: Request, res: Response) {
        const parsed = AssignSupportTicketDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const ticket = await service.assignTicket(req.params.id, parsed.data.assignedTo);
        return res.status(200).json({ success: true, data: ticket });
    }

    async updateStatus(req: Request, res: Response) {
        const parsed = UpdateSupportTicketStatusDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const ticket = await service.updateStatus(req.params.id, parsed.data.status);
        return res.status(200).json({ success: true, data: ticket });
    }

    async addResponse(req: Request, res: Response) {
        const parsed = CreateTicketResponseDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const response = await service.addResponse(req.params.id, userId, "admin", parsed.data.message, parsed.data.attachments);
        return res.status(201).json({ success: true, data: response });
    }
}
