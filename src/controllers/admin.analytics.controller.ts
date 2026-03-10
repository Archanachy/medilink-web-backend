import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { DoctorModel } from "../models/doctor.model";
import { PatientModel } from "../models/patient.model";
import { AppointmentModel } from "../models/appointment.model";
import { PaymentRepository } from "../repositories/payment.repository";

const paymentRepo = new PaymentRepository();

export class AdminAnalyticsController {
    async overview(_req: Request, res: Response) {
        const [users, doctors, patients, appointments, paymentStats] = await Promise.all([
            UserModel.countDocuments(),
            DoctorModel.countDocuments(),
            PatientModel.countDocuments(),
            AppointmentModel.countDocuments(),
            paymentRepo.getStats(),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                users,
                doctors,
                patients,
                appointments,
                revenue: paymentStats.amountPaid,
            },
        });
    }

    async users(_req: Request, res: Response) {
        const [total, active, inactive] = await Promise.all([
            UserModel.countDocuments(),
            UserModel.countDocuments({ isActive: true }),
            UserModel.countDocuments({ isActive: false }),
        ]);

        return res.status(200).json({ success: true, data: { total, active, inactive } });
    }

    async revenue(_req: Request, res: Response) {
        const stats = await paymentRepo.getStats();
        return res.status(200).json({ success: true, data: { total: stats.amountPaid, currency: "USD" } });
    }

    async appointments(_req: Request, res: Response) {
        const [total, scheduled, completed, cancelled] = await Promise.all([
            AppointmentModel.countDocuments(),
            AppointmentModel.countDocuments({ status: "scheduled" }),
            AppointmentModel.countDocuments({ status: "completed" }),
            AppointmentModel.countDocuments({ status: "cancelled" }),
        ]);

        return res.status(200).json({ success: true, data: { total, scheduled, completed, cancelled } });
    }
}
