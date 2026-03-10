import { Request, Response } from "express";
import z from "zod";
import { CreateSupportTicketDTO } from "../dtos/support-ticket.dto";
import { CreateTicketResponseDTO } from "../dtos/ticket-response.dto";
import { SupportTicketService } from "../services/support-ticket.service";

const service = new SupportTicketService();

export class PatientSupportController {
    async create(req: Request, res: Response) {
        const parsed = CreateSupportTicketDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const ticket = await service.createTicket(parsed.data, userId, req.user?.role === "doctor" ? "doctor" : "patient");
        return res.status(201).json({ success: true, data: ticket });
    }

    async list(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "10"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 10 : limitRaw, 1), 100);

        const { data, total } = await service.listForUser(userId, { page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async getById(req: Request, res: Response) {
        const ticket = await service.getTicketById(req.params.id);
        return res.status(200).json({ success: true, data: ticket });
    }

    async addResponse(req: Request, res: Response) {
        const parsed = CreateTicketResponseDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const userId = req.user?.id;
        const role = req.user?.role === "doctor" ? "doctor" : "patient";
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const response = await service.addResponse(req.params.id, userId, role, parsed.data.message, parsed.data.attachments);
        return res.status(201).json({ success: true, data: response });
    }

    async close(req: Request, res: Response) {
        const ticket = await service.closeTicket(req.params.id);
        return res.status(200).json({ success: true, data: ticket });
    }
}
