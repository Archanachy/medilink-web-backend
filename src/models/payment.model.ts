import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
    _id: mongoose.Types.ObjectId;
    patientId: mongoose.Types.ObjectId | string;
    doctorId?: mongoose.Types.ObjectId | string;
    appointmentId?: mongoose.Types.ObjectId | string;
    amount: number;
    currency: string;
    status: "pending" | "authorized" | "paid" | "failed" | "refunded";
    provider: string;
    providerReference: string;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}

const PaymentSchema: Schema<IPayment> = new Schema<IPayment>(
    {
        patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
        doctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
        appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
        amount: { type: Number, required: true },
        currency: { type: String, default: "USD" },
        status: {
            type: String,
            enum: ["pending", "authorized", "paid", "failed", "refunded"],
            default: "pending",
        },
        provider: { type: String, default: "dummy" },
        providerReference: { type: String, default: "" },
        metadata: { type: Schema.Types.Mixed, default: {} },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

PaymentSchema.index({ patientId: 1, created_at: -1 });
PaymentSchema.index({ doctorId: 1, created_at: -1 });
PaymentSchema.index({ status: 1, created_at: -1 });

PaymentSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    },
});

export const PaymentModel = mongoose.model<IPayment>("Payment", PaymentSchema);
