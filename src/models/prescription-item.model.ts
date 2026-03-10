import mongoose, { Schema, Document } from "mongoose";

export interface IPrescriptionItem extends Document {
    _id: mongoose.Types.ObjectId;
    prescriptionId: mongoose.Types.ObjectId | string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    created_at: Date;
    updated_at: Date;
}

const PrescriptionItemSchema: Schema<IPrescriptionItem> = new Schema<IPrescriptionItem>(
    {
        prescriptionId: { type: Schema.Types.ObjectId, ref: "Prescription", required: true },
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: { type: String, default: "" },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

PrescriptionItemSchema.index({ prescriptionId: 1 });

PrescriptionItemSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    },
});

export const PrescriptionItemModel = mongoose.model<IPrescriptionItem>("PrescriptionItem", PrescriptionItemSchema);
