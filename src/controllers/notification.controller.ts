import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";

const service = new NotificationService();

export class NotificationController {
    async listForCurrentUser(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "10"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 10 : limitRaw, 1), 100);

        const { data, total } = await service.listByUser(userId, { page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async markRead(req: Request, res: Response) {
        const notification = await service.markAsRead(req.params.id);
        return res.status(200).json({ success: true, data: notification });
    }
}
