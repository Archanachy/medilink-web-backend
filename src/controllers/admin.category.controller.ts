import { Request, Response } from "express";
import z from "zod";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../dtos/category.dto";
import { CategoryService } from "../services/category.service";

const service = new CategoryService();

export class AdminCategoryController {
    async create(req: Request, res: Response) {
        const parsed = CreateCategoryDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const category = await service.createCategory(parsed.data);
        return res.status(201).json({ success: true, data: category });
    }

    async list(req: Request, res: Response) {
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "25"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 25 : limitRaw, 1), 100);
        const { data, total } = await service.listCategories({ page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async update(req: Request, res: Response) {
        const parsed = UpdateCategoryDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const category = await service.updateCategory(req.params.id, parsed.data);
        return res.status(200).json({ success: true, data: category });
    }

    async remove(req: Request, res: Response) {
        await service.deleteCategory(req.params.id);
        return res.status(200).json({ success: true, message: "Deleted" });
    }
}
