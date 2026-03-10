import { Request, Response } from "express";
import z from "zod";
import { CreateAppointmentDTO, UpdateAppointmentDTO } from "../dtos/appointment.dto";
import { AppointmentService } from "../services/appointment.service";

const service = new AppointmentService();

export class AppointmentController {
    async create(req: Request, res: Response) {
        const parsed = CreateAppointmentDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const appointment = await service.createAppointment(parsed.data);
        return res.status(201).json({ success: true, data: appointment });
    }

    async getById(req: Request, res: Response) {
        const appointment = await service.getAppointmentById(req.params.id);
        return res.status(200).json({ success: true, data: appointment });
    }

    async getByPatient(req: Request, res: Response) {
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "10"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 10 : limitRaw, 1), 100);

        const { data, total } = await service.getAppointmentsByPatient(req.params.patientId, { page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({
            success: true,
            data,
            meta: { page, limit, total, totalPages },
        });
    }

    async getByDoctor(req: Request, res: Response) {
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "10"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 10 : limitRaw, 1), 100);

        const { data, total } = await service.getAppointmentsByDoctor(req.params.doctorId, { page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({
            success: true,
            data,
            meta: { page, limit, total, totalPages },
        });
    }

    async list(req: Request, res: Response) {
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "10"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 10 : limitRaw, 1), 100);

        const { data, total } = await service.getAllAppointments({ page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({
            success: true,
            data,
            meta: { page, limit, total, totalPages },
        });
    }

    async update(req: Request, res: Response) {
        const parsed = UpdateAppointmentDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const appointment = await service.updateAppointment(req.params.id, parsed.data);
        return res.status(200).json({ success: true, data: appointment });
    }

    async cancel(req: Request, res: Response) {
        const appointment = await service.cancelAppointment(req.params.id);
        return res.status(200).json({ success: true, data: appointment, message: "Appointment cancelled" });
    }

    async remove(req: Request, res: Response) {
        await service.deleteAppointment(req.params.id);
        return res.status(200).json({ success: true, message: "Deleted" });
    }

    async getAvailableSlots(req: Request, res: Response) {
        const { doctorId, date } = req.query;
        if (!doctorId || typeof doctorId !== "string") {
            return res.status(400).json({ success: false, message: "doctorId query parameter is required" });
        }
        if (!date || typeof date !== "string") {
            return res.status(400).json({ success: false, message: "date query parameter is required" });
        }

        const slots = await service.getAvailableSlots(doctorId, date);
        return res.status(200).json({ success: true, data: slots });
    }
}
