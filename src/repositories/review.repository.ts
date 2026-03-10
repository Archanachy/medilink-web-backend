import mongoose from "mongoose";
import { ReviewModel, IReview } from "../models/review.model";

export interface IReviewRepository {
    createReview(data: Partial<IReview>): Promise<IReview>;
    getReviewById(id: string): Promise<IReview | null>;
    getReviewByAppointmentId(appointmentId: string): Promise<IReview | null>;
    getReviewsByPatient(patientId: string, params?: { page: number; limit: number }): Promise<{ data: IReview[]; total: number }>;
    getReviewsByDoctor(doctorId: string, params?: { page: number; limit: number }): Promise<{ data: IReview[]; total: number }>;
    updateReview(id: string, data: Partial<IReview>): Promise<IReview | null>;
    deleteReview(id: string): Promise<boolean>;
    getDoctorRatingStats(doctorId: string): Promise<{ ratingAverage: number; ratingCount: number }>;
}

export class ReviewRepository implements IReviewRepository {
    async createReview(data: Partial<IReview>): Promise<IReview> {
        const review = new ReviewModel(data);
        return review.save();
    }

    async getReviewById(id: string): Promise<IReview | null> {
        return ReviewModel.findById(id);
    }

    async getReviewByAppointmentId(appointmentId: string): Promise<IReview | null> {
        return ReviewModel.findOne({ appointmentId });
    }

    async getReviewsByPatient(
        patientId: string,
        params?: { page: number; limit: number }
    ): Promise<{ data: IReview[]; total: number }> {
        const skip = params ? (params.page - 1) * params.limit : 0;
        const limit = params ? params.limit : 10;
        const [data, total] = await Promise.all([
            ReviewModel.find({ patientId }).sort({ created_at: -1 }).skip(skip).limit(limit),
            ReviewModel.countDocuments({ patientId }),
        ]);
        return { data, total };
    }

    async getReviewsByDoctor(
        doctorId: string,
        params?: { page: number; limit: number }
    ): Promise<{ data: IReview[]; total: number }> {
        const skip = params ? (params.page - 1) * params.limit : 0;
        const limit = params ? params.limit : 10;
        const [data, total] = await Promise.all([
            ReviewModel.find({ doctorId }).sort({ created_at: -1 }).skip(skip).limit(limit),
            ReviewModel.countDocuments({ doctorId }),
        ]);
        return { data, total };
    }

    async updateReview(id: string, data: Partial<IReview>): Promise<IReview | null> {
        return ReviewModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteReview(id: string): Promise<boolean> {
        const result = await ReviewModel.findByIdAndDelete(id);
        return !!result;
    }

    async getDoctorRatingStats(doctorId: string): Promise<{ ratingAverage: number; ratingCount: number }> {
        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
        const results = await ReviewModel.aggregate([
            { $match: { doctorId: doctorObjectId } },
            {
                $group: {
                    _id: "$doctorId",
                    ratingAverage: { $avg: "$rating" },
                    ratingCount: { $sum: 1 },
                },
            },
        ]);

        if (!results.length) {
            return { ratingAverage: 0, ratingCount: 0 };
        }

        return {
            ratingAverage: Number(results[0].ratingAverage ?? 0),
            ratingCount: Number(results[0].ratingCount ?? 0),
        };
    }
}
