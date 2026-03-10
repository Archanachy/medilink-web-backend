import { Request, Response } from "express";
import z from "zod";
import { CreateMedicalReportDTO, ShareMedicalReportDTO } from "../dtos/medical-report.dto";
import { MedicalReportService } from "../services/medical-report.service";
import { deleteUploadedFile } from "../utils/file";

const service = new MedicalReportService();

export class MedicalReportController {
    async upload(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Report file is required" });
        }

        const payload = {
            patientId: req.body.patientId,
            fileUrl: `/uploads/medical-reports/${req.file.filename}`,
            filename: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            title: req.body.title ?? "",
            description: req.body.description ?? "",
            sharedWithDoctors: [],
        };

        const parsed = CreateMedicalReportDTO.safeParse(payload);
        if (!parsed.success) {
            deleteUploadedFile(payload.fileUrl, "uploads/medical-reports");
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const report = await service.createReport(parsed.data);
        return res.status(201).json({ success: true, data: report });
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

    async getById(req: Request, res: Response) {
        const report = await service.getReportById(req.params.id);
        return res.status(200).json({ success: true, data: report });
    }

    async delete(req: Request, res: Response) {
        const report = await service.deleteReport(req.params.id);
        deleteUploadedFile(report.fileUrl, "uploads/medical-reports");
        return res.status(200).json({ success: true, message: "Deleted" });
    }

    async share(req: Request, res: Response) {
        const parsed = ShareMedicalReportDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const report = await service.shareReport(req.params.id, parsed.data);
        return res.status(200).json({ success: true, data: report });
    }

    async listSharedWithDoctor(req: Request, res: Response) {
        const patientId = String(req.params.patientId ?? "");
        const doctorId = String(req.query.doctorId ?? "");
        if (!patientId) {
            return res.status(400).json({ success: false, message: "patientId is required" });
        }
        if (!doctorId) {
            return res.status(400).json({ success: false, message: "doctorId query parameter is required" });
        }

        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "10"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 10 : limitRaw, 1), 100);

        const { data, total } = await service.listSharedForDoctorAndPatient(doctorId, patientId, { page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }
}
