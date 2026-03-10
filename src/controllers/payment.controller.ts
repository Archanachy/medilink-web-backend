import { Request, Response } from "express";
import z from "zod";
import { CreatePaymentIntentDTO, ConfirmPaymentDTO, WebhookPaymentDTO } from "../dtos/payment.dto";
import { PaymentService } from "../services/payment.service";

const service = new PaymentService();

export class PaymentController {
    async createIntent(req: Request, res: Response) {
        const parsed = CreatePaymentIntentDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const payment = await service.createIntent(parsed.data);
        return res.status(201).json({ success: true, data: payment });
    }

    async confirm(req: Request, res: Response) {
        const parsed = ConfirmPaymentDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const payment = await service.confirmPayment(parsed.data);
        return res.status(200).json({ success: true, data: payment });
    }

    async listForPatient(req: Request, res: Response) {
        const patientId = String(req.query.patientId ?? "");
        if (!patientId) {
            return res.status(400).json({ success: false, message: "patientId query parameter is required" });
        }

        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "10"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 10 : limitRaw, 1), 100);

        const { data, total } = await service.listByPatient(patientId, { page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async listForDoctor(req: Request, res: Response) {
        const doctorId = String(req.query.doctorId ?? "");
        if (!doctorId) {
            return res.status(400).json({ success: false, message: "doctorId query parameter is required" });
        }

        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "10"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 10 : limitRaw, 1), 100);

        const { data, total } = await service.listByDoctor(doctorId, { page, limit });
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

    async webhook(req: Request, res: Response) {
        const parsed = WebhookPaymentDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const payment = await service.handleWebhook(parsed.data.providerReference, parsed.data.status);
        return res.status(200).json({ success: true, data: payment });
    }

    async getDoctorRevenue(req: Request, res: Response) {
        try {
            const doctorId = (req as any).user?.id;
            if (!doctorId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const period = String(req.query.period ?? "monthly");
            const revenue = await service.getDoctorRevenue(doctorId, period);
            return res.status(200).json({ success: true, data: revenue });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }
}
