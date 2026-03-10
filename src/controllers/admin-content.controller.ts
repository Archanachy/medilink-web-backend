import { Request, Response } from "express";
import z from "zod";
import { CreateFaqDTO, UpdateFaqDTO } from "../dtos/faq.dto";
import { CreateBannerDTO, UpdateBannerDTO } from "../dtos/banner.dto";
import { ContentService } from "../services/content.service";

const service = new ContentService();

export class AdminContentController {
    async listFaqs(req: Request, res: Response) {
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "25"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 25 : limitRaw, 1), 100);
        const { data, total } = await service.listFaqs({ page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async createFaq(req: Request, res: Response) {
        const parsed = CreateFaqDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const faq = await service.createFaq(parsed.data);
        return res.status(201).json({ success: true, data: faq });
    }

    async updateFaq(req: Request, res: Response) {
        const parsed = UpdateFaqDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const faq = await service.updateFaq(req.params.id, parsed.data);
        return res.status(200).json({ success: true, data: faq });
    }

    async deleteFaq(req: Request, res: Response) {
        await service.deleteFaq(req.params.id);
        return res.status(200).json({ success: true, message: "Deleted" });
    }

    async listBanners(req: Request, res: Response) {
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "25"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 25 : limitRaw, 1), 100);
        const { data, total } = await service.listBanners({ page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async createBanner(req: Request, res: Response) {
        const parsed = CreateBannerDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const banner = await service.createBanner(parsed.data);
        return res.status(201).json({ success: true, data: banner });
    }

    async updateBanner(req: Request, res: Response) {
        const parsed = UpdateBannerDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const banner = await service.updateBanner(req.params.id, parsed.data);
        return res.status(200).json({ success: true, data: banner });
    }

    async deleteBanner(req: Request, res: Response) {
        await service.deleteBanner(req.params.id);
        return res.status(200).json({ success: true, message: "Deleted" });
    }
}
