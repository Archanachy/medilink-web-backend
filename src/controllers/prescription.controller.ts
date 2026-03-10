import { Request, Response } from "express";
import z from "zod";
import { CreatePrescriptionDTO, UpdatePrescriptionDTO, UpdatePrescriptionItemsDTO } from "../dtos/prescription.dto";
import { PrescriptionService } from "../services/prescription.service";

const service = new PrescriptionService();

export class PrescriptionController {
    async create(req: Request, res: Response) {
        const parsed = CreatePrescriptionDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const prescription = await service.createPrescription(parsed.data);
        return res.status(201).json({ success: true, data: prescription });
    }

    async getById(req: Request, res: Response) {
        const prescription = await service.getPrescriptionById(req.params.id);
        return res.status(200).json({ success: true, data: prescription });
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

        const { data, total } = await service.listByDoctor(doctorId, { page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
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

        const { data, total } = await service.listByPatient(patientId, { page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async update(req: Request, res: Response) {
        const parsed = UpdatePrescriptionDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const prescription = await service.updatePrescription(req.params.id, parsed.data);
        return res.status(200).json({ success: true, data: prescription });
    }

    async updateItems(req: Request, res: Response) {
        const parsed = UpdatePrescriptionItemsDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const prescription = await service.updatePrescriptionItems(req.params.id, parsed.data);
        return res.status(200).json({ success: true, data: prescription });
    }

    async remove(req: Request, res: Response) {
        await service.deletePrescription(req.params.id);
        return res.status(200).json({ success: true, message: "Deleted" });
    }

    async download(req: Request, res: Response) {
        const pdf = await service.getPrescriptionPdf(req.params.id);
        return res.download(pdf.filePath, pdf.filename);
    }
}
