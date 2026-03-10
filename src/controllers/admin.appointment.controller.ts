import { Request, Response } from "express";
import { AppointmentService } from "../services/appointment.service";
import { AppointmentModel } from "../models/appointment.model";

const appointmentService = new AppointmentService();

export class AdminAppointmentController {
    async list(req: Request, res: Response) {
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "10"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 10 : limitRaw, 1), 100);
        const { data, total } = await appointmentService.getAllAppointments({ page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({ success: true, data, meta: { page, limit, total, totalPages } });
    }

    async getById(req: Request, res: Response) {
        const appointment = await appointmentService.getAppointmentById(req.params.id);
        return res.status(200).json({ success: true, data: appointment });
    }

    async cancel(req: Request, res: Response) {
        const appointment = await appointmentService.cancelAppointment(req.params.id);
        return res.status(200).json({ success: true, data: appointment });
    }

    async stats(req: Request, res: Response) {
        const [total, scheduled, completed, cancelled, noShow] = await Promise.all([
            AppointmentModel.countDocuments(),
            AppointmentModel.countDocuments({ status: "scheduled" }),
            AppointmentModel.countDocuments({ status: "completed" }),
            AppointmentModel.countDocuments({ status: "cancelled" }),
            AppointmentModel.countDocuments({ status: "no-show" }),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                total,
                scheduled,
                completed,
                cancelled,
                noShow,
            },
        });
    }
}
