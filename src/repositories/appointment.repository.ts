import { AppointmentModel, IAppointment } from "../models/appointment.model";

export interface IAppointmentRepository {
    createAppointment(data: Partial<IAppointment>): Promise<IAppointment>;
    getAppointmentById(id: string): Promise<IAppointment | null>;
    getAppointmentsByPatient(patientId: string, params?: { page: number; limit: number }): Promise<{ data: IAppointment[]; total: number }>;
    getAppointmentsByDoctor(doctorId: string, params?: { page: number; limit: number }): Promise<{ data: IAppointment[]; total: number }>;
    getAllAppointments(params: { page: number; limit: number }): Promise<{ data: IAppointment[]; total: number }>;
    getUpcomingAppointments(start: Date, end: Date): Promise<IAppointment[]>;
    getAppointmentsForDate(doctorId: string, start: Date, end: Date): Promise<IAppointment[]>;
    updateAppointment(id: string, data: Partial<IAppointment>): Promise<IAppointment | null>;
    deleteAppointment(id: string): Promise<boolean>;
    getAvailableSlots(doctorId: string, date: Date): Promise<Date[]>;
}

export class AppointmentRepository implements IAppointmentRepository {
    async createAppointment(data: Partial<IAppointment>): Promise<IAppointment> {
        const appointment = new AppointmentModel(data);
        return await appointment.save();
    }

    async getAppointmentById(id: string): Promise<IAppointment | null> {
        return AppointmentModel.findById(id)
            .populate('patientId', 'firstName lastName email phone profileImage dateOfBirth')
            .populate('doctorId', 'firstName lastName email specialization consultationFee profileImage rating');
    }

    async getAppointmentsByPatient(
        patientId: string,
        params?: { page: number; limit: number }
    ): Promise<{ data: IAppointment[]; total: number }> {
        const skip = params ? (params.page - 1) * params.limit : 0;
        const limit = params ? params.limit : 10;
        const [data, total] = await Promise.all([
            AppointmentModel.find({ patientId })
                .sort({ appointmentDate: -1 })
                .skip(skip)
                .limit(limit)
                .populate('patientId', 'firstName lastName email phone profileImage dateOfBirth')
                .populate('doctorId', 'firstName lastName email specialization consultationFee profileImage rating'),
            AppointmentModel.countDocuments({ patientId }),
        ]);
        return { data, total };
    }

    async getAppointmentsByDoctor(
        doctorId: string,
        params?: { page: number; limit: number }
    ): Promise<{ data: IAppointment[]; total: number }> {
        const skip = params ? (params.page - 1) * params.limit : 0;
        const limit = params ? params.limit : 10;
        const [data, total] = await Promise.all([
            AppointmentModel.find({ doctorId })
                .sort({ appointmentDate: -1 })
                .skip(skip)
                .limit(limit)
                .populate('patientId', 'firstName lastName email phone profileImage dateOfBirth')
                .populate('doctorId', 'firstName lastName email specialization consultationFee profileImage rating'),
            AppointmentModel.countDocuments({ doctorId }),
        ]);
        return { data, total };
    }

    async getAllAppointments(params: { page: number; limit: number }): Promise<{ data: IAppointment[]; total: number }> {
        const skip = (params.page - 1) * params.limit;
        const [data, total] = await Promise.all([
            AppointmentModel.find()
                .sort({ appointmentDate: -1 })
                .skip(skip)
                .limit(params.limit)
                .populate('patientId', 'firstName lastName email phone profileImage dateOfBirth')
                .populate('doctorId', 'firstName lastName email specialization consultationFee profileImage rating'),
            AppointmentModel.countDocuments(),
        ]);
        return { data, total };
    }

    async getUpcomingAppointments(start: Date, end: Date): Promise<IAppointment[]> {
        return AppointmentModel.find({
            appointmentDate: { $gte: start, $lte: end },
            status: "scheduled",
            $or: [{ reminderSentAt: { $exists: false } }, { reminderSentAt: null }],
        } as any).sort({ appointmentDate: 1 });
    }

    async getAppointmentsForDate(doctorId: string, start: Date, end: Date): Promise<IAppointment[]> {
        return AppointmentModel.find({
            doctorId,
            appointmentDate: { $gte: start, $lte: end },
            status: { $ne: "cancelled" },
        } as any);
    }

    async updateAppointment(id: string, data: Partial<IAppointment>): Promise<IAppointment | null> {
        return AppointmentModel.findByIdAndUpdate(id, data, { new: true })
            .populate('patientId', 'firstName lastName email phone profileImage dateOfBirth')
            .populate('doctorId', 'firstName lastName email specialization consultationFee profileImage rating');
    }

    async deleteAppointment(id: string): Promise<boolean> {
        const result = await AppointmentModel.findByIdAndDelete(id);
        return !!result;
    }

    async getAvailableSlots(doctorId: string, date: Date): Promise<Date[]> {
        // Get all appointments for the doctor on the given date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const appointments = await AppointmentModel.find({
            doctorId,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: "cancelled" },
        } as any);

        // Generate 30-minute slots for working hours (9 AM - 5 PM)
        const slots: Date[] = [];
        const slotDate = new Date(date);
        slotDate.setHours(9, 0, 0, 0);
        const endTime = new Date(date);
        endTime.setHours(17, 0, 0, 0);

        while (slotDate < endTime) {
            const slotEnd = new Date(slotDate);
            slotEnd.setMinutes(slotEnd.getMinutes() + 30);

            const isBooked = appointments.some(
                (apt) => {
                    const aptDate = new Date(apt.appointmentDate);
                    return aptDate >= slotDate && aptDate < slotEnd;
                }
            );

            if (!isBooked) {
                slots.push(new Date(slotDate));
            }

            slotDate.setMinutes(slotDate.getMinutes() + 30);
        }

        return slots;
    }
}
