import { Request, Response } from "express";
import { DoctorService } from "../services/doctor.service";
import { DoctorDocumentService } from "../services/doctor-document.service";
import { DoctorModel } from "../models/doctor.model";

const doctorService = new DoctorService();
const documentService = new DoctorDocumentService();

export class AdminDoctorController {
    async list(req: Request, res: Response) {
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "10"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 10 : limitRaw, 1), 100);
        const { data, total } = await doctorService.getAllDoctors({ page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async listPending(req: Request, res: Response) {
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "10"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 10 : limitRaw, 1), 100);
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            DoctorModel.find({ verificationStatus: "pending" }).sort({ created_at: -1 }).skip(skip).limit(limit),
            DoctorModel.countDocuments({ verificationStatus: "pending" }),
        ]);
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async getById(req: Request, res: Response) {
        const doctor = await doctorService.getDoctorById(req.params.id);
        return res.status(200).json({ success: true, data: doctor });
    }

    async verify(req: Request, res: Response) {
        const doctor = await doctorService.updateDoctor(req.params.id, {
            verificationStatus: "verified",
            verificationNotes: req.body?.notes ?? "",
        } as any);
        return res.status(200).json({ success: true, data: doctor });
    }

    async reject(req: Request, res: Response) {
        const doctor = await doctorService.updateDoctor(req.params.id, {
            verificationStatus: "rejected",
            verificationNotes: req.body?.notes ?? "",
        } as any);
        return res.status(200).json({ success: true, data: doctor });
    }

    async update(req: Request, res: Response) {
        const doctor = await doctorService.updateDoctor(req.params.id, req.body);
        return res.status(200).json({ success: true, data: doctor });
    }

    async remove(req: Request, res: Response) {
        await doctorService.deleteDoctor(req.params.id);
        return res.status(200).json({ success: true, message: "Deleted" });
    }

    async listDocuments(req: Request, res: Response) {
        const doctorId = req.params.id;
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "10"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 10 : limitRaw, 1), 100);
        const { data, total } = await documentService.listByDoctor(doctorId, { page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }
}
