import mongoose, { Schema, Document } from "mongoose";

export interface IDoctorDocument extends Document {
    _id: mongoose.Types.ObjectId;
    doctorId: mongoose.Types.ObjectId | string;
    docType: string;
    fileUrl: string;
    filename: string;
    mimeType: string;
    size: number;
    status: "pending" | "approved" | "rejected";
    notes: string;
    created_at: Date;
    updated_at: Date;
}

const DoctorDocumentSchema: Schema<IDoctorDocument> = new Schema<IDoctorDocument>(
    {
        doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
        docType: { type: String, required: true },
        fileUrl: { type: String, required: true },
        filename: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        notes: { type: String, default: "" },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

DoctorDocumentSchema.index({ doctorId: 1, created_at: -1 });
DoctorDocumentSchema.index({ status: 1, created_at: -1 });

DoctorDocumentSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        if (ret.mimeType !== undefined) ret.mime_type = ret.mimeType;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.mimeType;
        return ret;
    },
});

export const DoctorDocumentModel = mongoose.model<IDoctorDocument>("DoctorDocument", DoctorDocumentSchema);
