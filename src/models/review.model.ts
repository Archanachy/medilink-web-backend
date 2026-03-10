import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
    _id: mongoose.Types.ObjectId;
    patientId: mongoose.Types.ObjectId | string;
    doctorId: mongoose.Types.ObjectId | string;
    appointmentId: mongoose.Types.ObjectId | string;
    rating: number;
    comment: string;
    created_at: Date;
    updated_at: Date;
}

const ReviewSchema: Schema<IReview> = new Schema<IReview>(
    {
        patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
        doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
        appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: "" },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

ReviewSchema.index({ doctorId: 1, created_at: -1 });
ReviewSchema.index({ patientId: 1, created_at: -1 });

ReviewSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    },
});

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);
