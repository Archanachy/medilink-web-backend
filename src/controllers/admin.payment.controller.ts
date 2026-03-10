import { Request, Response } from "express";
import { PaymentService } from "../services/payment.service";

const service = new PaymentService();

export class AdminPaymentController {
    async list(req: Request, res: Response) {
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "25"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 25 : limitRaw, 1), 100);

        const { data, total } = await service.listAll({ page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async getById(req: Request, res: Response) {
        const payment = await service.getPaymentById(req.params.id);
        return res.status(200).json({ success: true, data: payment });
    }

    async refund(req: Request, res: Response) {
        const payment = await service.refund(req.params.id);
        return res.status(200).json({ success: true, data: payment });
    }

    async stats(req: Request, res: Response) {
        const stats = await service.getStats();
        return res.status(200).json({ success: true, data: stats });
    }
}
