import { CreateAppointmentDTO, UpdateAppointmentDTO } from "../dtos/appointment.dto";
import { AppointmentRepository } from "../repositories/appointment.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { HttpError } from "../errors/http-error";
import { IAppointment } from "../models/appointment.model";

const appointmentRepo = new AppointmentRepository();
const doctorRepo = new DoctorRepository();

const DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

const parseTimeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return NaN;
    return hours * 60 + minutes;
};

export class AppointmentService {
    async createAppointment(data: CreateAppointmentDTO) {
        // Validate appointment date is in the future
        const appointmentDate = new Date(data.appointmentDate);
        if (appointmentDate < new Date()) {
            throw new HttpError(400, "Appointment date must be in the future");
        }

        // Check for conflicting appointments
        const existingAppointments = await appointmentRepo.getAppointmentsByDoctor(data.doctorId);
        const hasConflict = existingAppointments.data.some((apt) => {
            const existingStart = new Date(apt.appointmentDate).getTime();
            const existingEnd = existingStart + (apt.duration ?? 30) * 60 * 1000;
            const newStart = appointmentDate.getTime();
            const newEnd = newStart + (data.duration ?? 30) * 60 * 1000;

            return (
                apt.status !== "cancelled" &&
                ((newStart >= existingStart && newStart < existingEnd) ||
                    (newEnd > existingStart && newEnd <= existingEnd) ||
                    (newStart <= existingStart && newEnd >= existingEnd))
            );
        });

        if (hasConflict) {
            throw new HttpError(409, "Doctor has a conflicting appointment at this time");
        }

        // Convert string date to Date object for the database
        const appointmentPayload: Partial<IAppointment> = {
            ...data as any,
            appointmentDate: new Date(data.appointmentDate),
        };

        return appointmentRepo.createAppointment(appointmentPayload);
    }

    async getAppointmentById(id: string) {
        const appointment = await appointmentRepo.getAppointmentById(id);
        if (!appointment) throw new HttpError(404, "Appointment not found");
        return appointment;
    }

    async getAppointmentsByPatient(patientId: string, params: { page: number; limit: number }) {
        return appointmentRepo.getAppointmentsByPatient(patientId, params);
    }

    async getAppointmentsByDoctor(doctorId: string, params: { page: number; limit: number }) {
        return appointmentRepo.getAppointmentsByDoctor(doctorId, params);
    }

    async getAllAppointments(params: { page: number; limit: number }) {
        return appointmentRepo.getAllAppointments(params);
    }

    async updateAppointment(id: string, data: UpdateAppointmentDTO) {
        // Convert appointmentDate string to Date if provided
        const updatePayload: Partial<IAppointment> = { ...data as any };
        if (data.appointmentDate && typeof data.appointmentDate === 'string') {
            updatePayload.appointmentDate = new Date(data.appointmentDate);
        }

        const appointment = await appointmentRepo.updateAppointment(id, updatePayload);
        if (!appointment) throw new HttpError(404, "Appointment not found");
        return appointment;
    }

    async cancelAppointment(id: string) {
        const appointment = await appointmentRepo.updateAppointment(id, { status: "cancelled" });
        if (!appointment) throw new HttpError(404, "Appointment not found");
        return appointment;
    }

    async deleteAppointment(id: string) {
        const ok = await appointmentRepo.deleteAppointment(id);
        if (!ok) throw new HttpError(404, "Appointment not found");
        return ok;
    }

    async getAvailableSlots(doctorId: string, date: string) {
        const slotDate = new Date(date);
        if (isNaN(slotDate.getTime())) {
            throw new HttpError(400, "Invalid date format");
        }

        const doctor = await doctorRepo.getDoctorById(doctorId);
        if (!doctor) throw new HttpError(404, "Doctor not found");
        if (!doctor.isAvailable) return [];

        const dayName = DAY_NAMES[slotDate.getUTCDay()];
        const scheduleForDay = (doctor.availabilitySchedule || []).find(
            (day) => day.dayOfWeek === dayName
        );

        if (!scheduleForDay || !scheduleForDay.isAvailable) {
            return [];
        }

        const startOfDay = new Date(slotDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(slotDate);
        endOfDay.setHours(23, 59, 59, 999);
        const appointments = await appointmentRepo.getAppointmentsForDate(
            doctorId,
            startOfDay,
            endOfDay
        );

        const availableSlots: Array<{ startTime: string; endTime: string }> = [];
        const slotDurationMinutes = 30;

        for (const slot of scheduleForDay.timeSlots || []) {
            const startMinutes = parseTimeToMinutes(slot.startTime);
            const endMinutes = parseTimeToMinutes(slot.endTime);
            if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) continue;
            if (endMinutes <= startMinutes) continue;

            for (let t = startMinutes; t + slotDurationMinutes <= endMinutes; t += slotDurationMinutes) {
                const slotStart = new Date(slotDate);
                slotStart.setHours(Math.floor(t / 60), t % 60, 0, 0);
                const slotEnd = new Date(slotStart);
                slotEnd.setMinutes(slotEnd.getMinutes() + slotDurationMinutes);

                const isBooked = appointments.some((apt) => {
                    const aptStart = new Date(apt.appointmentDate).getTime();
                    const aptEnd = aptStart + (apt.duration ?? slotDurationMinutes) * 60 * 1000;
                    return (
                        (slotStart.getTime() >= aptStart && slotStart.getTime() < aptEnd) ||
                        (slotEnd.getTime() > aptStart && slotEnd.getTime() <= aptEnd) ||
                        (slotStart.getTime() <= aptStart && slotEnd.getTime() >= aptEnd)
                    );
                });

                if (!isBooked) {
                    const startStr = slotStart.toISOString().slice(11, 16);
                    const endStr = slotEnd.toISOString().slice(11, 16);
                    availableSlots.push({ startTime: startStr, endTime: endStr });
                }
            }
        }

        return availableSlots;
    }
}
