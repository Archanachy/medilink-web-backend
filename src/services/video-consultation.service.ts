import { v4 as uuidv4 } from "uuid";
import { AppointmentRepository } from "../repositories/appointment.repository";
import { VideoConsultationRepository } from "../repositories/video-consultation.repository";
import { HttpError } from "../errors/http-error";

const appointmentRepo = new AppointmentRepository();
const videoRepo = new VideoConsultationRepository();

export class VideoConsultationService {
    async startForAppointment(appointmentId: string) {
        const appointment = await appointmentRepo.getAppointmentById(appointmentId);
        if (!appointment) throw new HttpError(404, "Appointment not found");
        if (appointment.consultationType !== "online") {
            throw new HttpError(400, "Video consultation is only available for online appointments");
        }

        const existing = await videoRepo.getByAppointmentId(appointmentId);
        const channelName = `appointment-${appointmentId}`;
        const patientToken = `patient-${uuidv4()}`;
        const doctorToken = `doctor-${uuidv4()}`;

        if (existing) {
            if (existing.status === "ended") {
                throw new HttpError(409, "Video consultation has already ended");
            }
            const updated = await videoRepo.update(String(existing._id), {
                status: "started",
                startedAt: existing.startedAt ?? new Date(),
                metadata: {
                    ...existing.metadata,
                    tokens: { patientToken, doctorToken },
                },
            } as any);

            return {
                consultation: updated,
                tokens: { patientToken, doctorToken },
                channelName,
            };
        }

        const created = await videoRepo.create({
            appointmentId: appointment._id,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            provider: "dummy",
            channelName,
            status: "started",
            startedAt: new Date(),
            metadata: { tokens: { patientToken, doctorToken } },
        } as any);

        return {
            consultation: created,
            tokens: { patientToken, doctorToken },
            channelName,
        };
    }

    async getById(id: string) {
        const consultation = await videoRepo.getById(id);
        if (!consultation) throw new HttpError(404, "Video consultation not found");
        return consultation;
    }

    async endConsultation(id: string, durationSeconds?: number) {
        const consultation = await videoRepo.getById(id);
        if (!consultation) throw new HttpError(404, "Video consultation not found");
        if (consultation.status === "ended") return consultation;

        const now = new Date();
        const effectiveDuration = durationSeconds ??
            (consultation.startedAt ? Math.max(0, Math.floor((now.getTime() - consultation.startedAt.getTime()) / 1000)) : 0);

        const updated = await videoRepo.update(id, {
            status: "ended",
            endedAt: now,
            durationSeconds: effectiveDuration,
        } as any);

        if (!updated) throw new HttpError(404, "Video consultation not found");
        return updated;
    }
}
