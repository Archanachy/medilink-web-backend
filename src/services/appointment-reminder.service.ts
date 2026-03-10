import { AppointmentRepository } from "../repositories/appointment.repository";
import { PatientRepository } from "../repositories/patient.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { EmailService } from "./email.service";
import { NotificationService } from "./notification.service";
import { REMINDER_INTERVAL_MINUTES, REMINDER_LOOKAHEAD_HOURS } from "../configs";

const appointmentRepo = new AppointmentRepository();
const patientRepo = new PatientRepository();
const doctorRepo = new DoctorRepository();
const emailService = new EmailService();
const notificationService = new NotificationService();

export class AppointmentReminderService {
    async sendUpcomingReminders() {
        const now = new Date();
        const end = new Date(now.getTime() + REMINDER_LOOKAHEAD_HOURS * 60 * 60 * 1000);

        const upcoming = await appointmentRepo.getUpcomingAppointments(now, end);
        if (!upcoming.length) return;

        for (const appointment of upcoming) {
            const patient = await patientRepo.getPatientById(String(appointment.patientId));
            const doctor = await doctorRepo.getDoctorById(String(appointment.doctorId));

            const appointmentDate = new Date(appointment.appointmentDate);
            const dateLabel = appointmentDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            const timeLabel = appointmentDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });

            if (patient?.email) {
                await emailService.sendEmail({
                    to: patient.email,
                    subject: "Appointment Reminder",
                    text: `You have an appointment on ${dateLabel} at ${timeLabel}.`,
                    html: `<p>You have an appointment on <strong>${dateLabel}</strong> at <strong>${timeLabel}</strong>.</p>`,
                    template: "appointment-reminder",
                });

                await notificationService.createNotification({
                    userId: String(patient._id),
                    role: "patient",
                    title: "Appointment Reminder",
                    message: `Your appointment is scheduled for ${dateLabel} at ${timeLabel}.`,
                    type: "appointment",
                    data: { appointmentId: String(appointment._id) },
                    isRead: false,
                });
            }

            if (doctor?.email) {
                await emailService.sendEmail({
                    to: doctor.email,
                    subject: "Upcoming Appointment",
                    text: `You have an appointment on ${dateLabel} at ${timeLabel}.`,
                    html: `<p>You have an appointment on <strong>${dateLabel}</strong> at <strong>${timeLabel}</strong>.</p>`,
                    template: "appointment-reminder-doctor",
                });

                await notificationService.createNotification({
                    userId: String(doctor._id),
                    role: "doctor",
                    title: "Upcoming Appointment",
                    message: `You have an appointment on ${dateLabel} at ${timeLabel}.`,
                    type: "appointment",
                    data: { appointmentId: String(appointment._id) },
                    isRead: false,
                });
            }

            await appointmentRepo.updateAppointment(String(appointment._id), { reminderSentAt: new Date() } as any);
        }
    }
}

export function startAppointmentReminderScheduler() {
    const service = new AppointmentReminderService();
    const intervalMs = REMINDER_INTERVAL_MINUTES * 60 * 1000;

    service.sendUpcomingReminders().catch((error) => {
        console.error("Appointment reminder job failed:", error);
    });

    setInterval(() => {
        service.sendUpcomingReminders().catch((error) => {
            console.error("Appointment reminder job failed:", error);
        });
    }, intervalMs);
}
