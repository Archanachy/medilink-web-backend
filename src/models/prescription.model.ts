import mongoose, { Schema, Document } from "mongoose";

export interface IPrescription extends Document {
    _id: mongoose.Types.ObjectId;
    patientId: mongoose.Types.ObjectId | string;
    doctorId: mongoose.Types.ObjectId | string;
    appointmentId?: mongoose.Types.ObjectId | string;
    notes: string;
    status: "active" | "cancelled" | "completed";
    pdfUrl: string;
    pdfFilename: string;
    created_at: Date;
    updated_at: Date;
}

const PrescriptionSchema: Schema<IPrescription> = new Schema<IPrescription>(
    {
        patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
        doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
        appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
        notes: { type: String, default: "" },
        status: { type: String, enum: ["active", "cancelled", "completed"], default: "active" },
        pdfUrl: { type: String, default: "" },
        pdfFilename: { type: String, default: "" },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

PrescriptionSchema.index({ patientId: 1, created_at: -1 });
PrescriptionSchema.index({ doctorId: 1, created_at: -1 });

PrescriptionSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        if (ret.pdfUrl !== undefined) ret.pdf_url = ret.pdfUrl;
        if (ret.pdfFilename !== undefined) ret.pdf_filename = ret.pdfFilename;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.pdfUrl;
        delete ret.pdfFilename;
        return ret;
    },
});

export const PrescriptionModel = mongoose.model<IPrescription>("Prescription", PrescriptionSchema);
