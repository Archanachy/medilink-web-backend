import { Request, Response } from "express";
import { AuditLogService } from "../services/audit-log.service";

const service = new AuditLogService();

export class AuditLogController {
    async list(req: Request, res: Response) {
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "25"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 25 : limitRaw, 1), 100);
        const { data, total } = await service.list({ page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async listByUser(req: Request, res: Response) {
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "25"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 25 : limitRaw, 1), 100);
        const { data, total } = await service.listByUser(req.params.userId, { page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async export(req: Request, res: Response) {
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "100"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 100 : limitRaw, 1), 500);
        const csv = await service.exportCsv({ page, limit });
        res.setHeader("Content-Type", "text/csv");
        return res.status(200).send(csv);
    }
}
