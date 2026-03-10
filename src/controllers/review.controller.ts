import { Request, Response } from "express";
import z from "zod";
import { CreateReviewDTO, UpdateReviewDTO } from "../dtos/review.dto";
import { ReviewService } from "../services/review.service";

const service = new ReviewService();

export class ReviewController {
    async create(req: Request, res: Response) {
        const parsed = CreateReviewDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const review = await service.createReview(parsed.data);
        return res.status(201).json({ success: true, data: review });
    }

    async update(req: Request, res: Response) {
        const parsed = UpdateReviewDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const review = await service.updateReview(req.params.id, parsed.data);
        return res.status(200).json({ success: true, data: review });
    }

    async remove(req: Request, res: Response) {
        await service.deleteReview(req.params.id);
        return res.status(200).json({ success: true, message: "Deleted" });
    }

    async listByPatient(req: Request, res: Response) {
        const patientId = String(req.query.patientId ?? "");
        if (!patientId) {
            return res.status(400).json({ success: false, message: "patientId query parameter is required" });
        }

        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "10"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 10 : limitRaw, 1), 100);

        const { data, total } = await service.getReviewsByPatient(patientId, { page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async listByDoctor(req: Request, res: Response) {
        const doctorId = String(req.query.doctorId ?? "");
        if (!doctorId) {
            return res.status(400).json({ success: false, message: "doctorId query parameter is required" });
        }

        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "10"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 10 : limitRaw, 1), 100);

        const { data, total } = await service.getReviewsByDoctor(doctorId, { page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async getDoctorStats(req: Request, res: Response) {
        const doctorId = String(req.query.doctorId ?? "");
        if (!doctorId) {
            return res.status(400).json({ success: false, message: "doctorId query parameter is required" });
        }

        const stats = await service.getDoctorReviewStats(doctorId);
        return res.status(200).json({ success: true, data: stats });
    }
}
