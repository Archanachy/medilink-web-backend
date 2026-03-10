import mongoose, { Schema, Document } from "mongoose";

export interface IVideoConsultation extends Document {
    _id: mongoose.Types.ObjectId;
    appointmentId: mongoose.Types.ObjectId | string;
    patientId: mongoose.Types.ObjectId | string;
    doctorId: mongoose.Types.ObjectId | string;
    provider: "dummy" | "agora" | "twilio" | "webrtc";
    channelName: string;
    status: "scheduled" | "started" | "ended" | "cancelled";
    startedAt?: Date;
    endedAt?: Date;
    durationSeconds?: number;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}

const VideoConsultationSchema: Schema<IVideoConsultation> = new Schema<IVideoConsultation>(
    {
        appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
        patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
        doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
        provider: { type: String, enum: ["dummy", "agora", "twilio", "webrtc"], default: "dummy" },
        channelName: { type: String, required: true },
        status: { type: String, enum: ["scheduled", "started", "ended", "cancelled"], default: "scheduled" },
        startedAt: { type: Date, default: null },
        endedAt: { type: Date, default: null },
        durationSeconds: { type: Number, default: 0 },
        metadata: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

VideoConsultationSchema.index({ patientId: 1, created_at: -1 });
VideoConsultationSchema.index({ doctorId: 1, created_at: -1 });
VideoConsultationSchema.index({ status: 1, created_at: -1 });

VideoConsultationSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        if (ret.startedAt) ret.started_at = ret.startedAt;
        if (ret.endedAt) ret.ended_at = ret.endedAt;
        if (ret.durationSeconds !== undefined) ret.duration_seconds = ret.durationSeconds;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.startedAt;
        delete ret.endedAt;
        delete ret.durationSeconds;
        return ret;
    },
});

export const VideoConsultationModel = mongoose.model<IVideoConsultation>("VideoConsultation", VideoConsultationSchema);
