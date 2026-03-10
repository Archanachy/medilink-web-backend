import mongoose, { Schema, Document } from "mongoose";

export interface IMedicalReport extends Document {
    _id: mongoose.Types.ObjectId;
    patientId: mongoose.Types.ObjectId | string;
    fileUrl: string;
    filename: string;
    mimeType: string;
    size: number;
    title: string;
    description: string;
    sharedWithDoctors: Array<mongoose.Types.ObjectId | string>;
    created_at: Date;
    updated_at: Date;
}

const MedicalReportSchema: Schema<IMedicalReport> = new Schema<IMedicalReport>(
    {
        patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
        fileUrl: { type: String, required: true },
        filename: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        sharedWithDoctors: [{ type: Schema.Types.ObjectId, ref: "Doctor" }],
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

MedicalReportSchema.index({ patientId: 1, created_at: -1 });
MedicalReportSchema.index({ sharedWithDoctors: 1 });

MedicalReportSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        if (ret.mimeType !== undefined) ret.mime_type = ret.mimeType;
        if (ret.sharedWithDoctors !== undefined) ret.shared_with_doctors = ret.sharedWithDoctors;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.mimeType;
        delete ret.sharedWithDoctors;
        return ret;
    },
});

export const MedicalReportModel = mongoose.model<IMedicalReport>("MedicalReport", MedicalReportSchema);
