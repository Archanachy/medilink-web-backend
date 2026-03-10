import { Request, Response } from "express";
import z from "zod";
import { UpdateSystemSettingDTO } from "../dtos/system-setting.dto";
import { SystemSettingService } from "../services/system-setting.service";

const service = new SystemSettingService();

export class AdminSettingsController {
    async list(req: Request, res: Response) {
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "25"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 25 : limitRaw, 1), 100);
        const { data, total } = await service.list({ page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async getByKey(req: Request, res: Response) {
        const setting = await service.getByKey(req.params.key);
        return res.status(200).json({ success: true, data: setting });
    }

    async update(req: Request, res: Response) {
        const parsed = UpdateSystemSettingDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const payload = { ...parsed.data, updatedBy: req.user?.id };
        const setting = await service.updateByKey(req.params.key, payload);
        return res.status(200).json({ success: true, data: setting });
    }
}
