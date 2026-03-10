import { CreateReviewDTO, UpdateReviewDTO } from "../dtos/review.dto";
import { ReviewRepository } from "../repositories/review.repository";
import { AppointmentRepository } from "../repositories/appointment.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { HttpError } from "../errors/http-error";

const reviewRepo = new ReviewRepository();
const appointmentRepo = new AppointmentRepository();
const doctorRepo = new DoctorRepository();

export class ReviewService {
    async createReview(data: CreateReviewDTO) {
        const appointment = await appointmentRepo.getAppointmentById(data.appointmentId);
        if (!appointment) {
            throw new HttpError(404, "Appointment not found");
        }
        if (String(appointment.patientId) !== data.patientId || String(appointment.doctorId) !== data.doctorId) {
            throw new HttpError(403, "Appointment does not match patient or doctor");
        }
        if (appointment.status !== "completed") {
            throw new HttpError(400, "Review allowed only for completed appointments");
        }

        const existingReview = await reviewRepo.getReviewByAppointmentId(data.appointmentId);
        if (existingReview) {
            throw new HttpError(409, "Review already submitted for this appointment");
        }

        const review = await reviewRepo.createReview(data);
        await this.refreshDoctorRating(String(review.doctorId));
        return review;
    }

    async getReviewById(id: string) {
        const review = await reviewRepo.getReviewById(id);
        if (!review) throw new HttpError(404, "Review not found");
        return review;
    }

    async getReviewsByPatient(patientId: string, params: { page: number; limit: number }) {
        return reviewRepo.getReviewsByPatient(patientId, params);
    }

    async getReviewsByDoctor(doctorId: string, params: { page: number; limit: number }) {
        return reviewRepo.getReviewsByDoctor(doctorId, params);
    }

    async updateReview(id: string, data: UpdateReviewDTO) {
        const review = await reviewRepo.updateReview(id, data);
        if (!review) throw new HttpError(404, "Review not found");
        await this.refreshDoctorRating(String(review.doctorId));
        return review;
    }

    async deleteReview(id: string) {
        const review = await reviewRepo.getReviewById(id);
        if (!review) throw new HttpError(404, "Review not found");
        const ok = await reviewRepo.deleteReview(id);
        if (!ok) throw new HttpError(404, "Review not found");
        await this.refreshDoctorRating(String(review.doctorId));
        return ok;
    }

    async getDoctorReviewStats(doctorId: string) {
        return reviewRepo.getDoctorRatingStats(doctorId);
    }

    private async refreshDoctorRating(doctorId: string) {
        const stats = await reviewRepo.getDoctorRatingStats(doctorId);
        await doctorRepo.updateDoctor(doctorId, {
            ratingAverage: stats.ratingAverage,
            ratingCount: stats.ratingCount,
        } as any);
    }
}
