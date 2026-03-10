import { Request, Response } from "express";
import { ContentService } from "../services/content.service";

const service = new ContentService();

export class ContentController {
    async listFaqs(_req: Request, res: Response) {
        const { data } = await service.listFaqsPublic();
        return res.status(200).json({ success: true, data });
    }

    async listBanners(_req: Request, res: Response) {
        const { data } = await service.listBannersPublic();
        return res.status(200).json({ success: true, data });
    }
}
