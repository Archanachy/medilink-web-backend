import { AppointmentModel } from "../models/appointment.model";
import { DoctorModel } from "../models/doctor.model";
import { PatientModel } from "../models/patient.model";
import { UserModel } from "../models/user.model";
import { PaymentModel } from "../models/payment.model";

type DateRange = { start?: Date; end?: Date };

function parseRange(start?: string, end?: string): DateRange {
    const result: DateRange = {};
    if (start) {
        const startDate = new Date(start);
        if (!isNaN(startDate.getTime())) result.start = startDate;
    }
    if (end) {
        const endDate = new Date(end);
        if (!isNaN(endDate.getTime())) result.end = endDate;
    }
    return result;
}

function buildDateFilter(range: DateRange) {
    const filter: any = {};
    if (range.start || range.end) {
        filter.created_at = {};
        if (range.start) filter.created_at.$gte = range.start;
        if (range.end) filter.created_at.$lte = range.end;
    }
    return filter;
}

export class AdvancedAnalyticsService {
    parseRange = parseRange;

    async overview(range: DateRange) {
        const filter = buildDateFilter(range);
        const [users, doctors, patients, appointments, payments] = await Promise.all([
            UserModel.countDocuments(filter),
            DoctorModel.countDocuments(filter),
            PatientModel.countDocuments(filter),
            AppointmentModel.countDocuments(filter),
            PaymentModel.aggregate([
                { $match: { status: "paid", ...(filter.created_at ? { created_at: filter.created_at } : {}) } },
                { $group: { _id: null, amount: { $sum: "$amount" } } },
            ]),
        ]);

        return {
            users,
            doctors,
            patients,
            appointments,
            revenue: payments?.[0]?.amount ?? 0,
        };
    }

    async users(range: DateRange) {
        const filter = buildDateFilter(range);
        const [total, active, inactive] = await Promise.all([
            UserModel.countDocuments(filter),
            UserModel.countDocuments({ ...filter, isActive: true }),
            UserModel.countDocuments({ ...filter, isActive: false }),
        ]);
        return { total, active, inactive };
    }

    async revenue(range: DateRange) {
        const filter = buildDateFilter(range);
        const payments = await PaymentModel.aggregate([
            { $match: { status: "paid", ...(filter.created_at ? { created_at: filter.created_at } : {}) } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        return { total: payments?.[0]?.total ?? 0, currency: "USD" };
    }

    async appointments(range: DateRange) {
        const filter = buildDateFilter(range);
        const [total, scheduled, completed, cancelled] = await Promise.all([
            AppointmentModel.countDocuments(filter),
            AppointmentModel.countDocuments({ ...filter, status: "scheduled" }),
            AppointmentModel.countDocuments({ ...filter, status: "completed" }),
            AppointmentModel.countDocuments({ ...filter, status: "cancelled" }),
        ]);
        return { total, scheduled, completed, cancelled };
    }

    async doctors(range: DateRange) {
        const filter = buildDateFilter(range);
        const [total, verified, pending] = await Promise.all([
            DoctorModel.countDocuments(filter),
            DoctorModel.countDocuments({ ...filter, verificationStatus: "verified" }),
            DoctorModel.countDocuments({ ...filter, verificationStatus: "pending" }),
        ]);
        return { total, verified, pending };
    }

    async geolocation() {
        return { heatmap: [], summary: [] };
    }

    async exportCsv(range: DateRange) {
        const overview = await this.overview(range);
        const rows = ["metric,value", `users,${overview.users}`, `doctors,${overview.doctors}`, `patients,${overview.patients}`, `appointments,${overview.appointments}`, `revenue,${overview.revenue}`];
        return rows.join("\n");
    }
}
