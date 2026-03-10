import { Request, Response } from "express";
import z from "zod";
import { CreateDoctorDocumentDTO, UpdateDoctorDocumentStatusDTO } from "../dtos/doctor-document.dto";
import { DoctorDocumentService } from "../services/doctor-document.service";
import { deleteUploadedFile } from "../utils/file";

const service = new DoctorDocumentService();

export class DoctorDocumentController {
    async upload(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Document file is required" });
        }

        const payload = {
            doctorId: req.body.doctorId,
            docType: req.body.docType,
            fileUrl: `/uploads/doctor-documents/${req.file.filename}`,
            filename: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            status: "pending",
            notes: "",
        };

        const parsed = CreateDoctorDocumentDTO.safeParse(payload);
        if (!parsed.success) {
            deleteUploadedFile(payload.fileUrl, "uploads/doctor-documents");
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const doc = await service.createDocument(parsed.data);
        return res.status(201).json({ success: true, data: doc });
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

    async updateStatus(req: Request, res: Response) {
        const parsed = UpdateDoctorDocumentStatusDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const doc = await service.updateStatus(req.params.id, parsed.data);
        return res.status(200).json({ success: true, data: doc });
    }

    async remove(req: Request, res: Response) {
        const doc = await service.getById(req.params.id);
        await service.deleteDocument(req.params.id);
        deleteUploadedFile(doc.fileUrl, "uploads/doctor-documents");
        return res.status(200).json({ success: true, message: "Deleted" });
    }
}
