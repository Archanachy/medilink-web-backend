import mongoose, { Schema, Document } from "mongoose";
import { AppointmentType } from "../types/appointment.type";

export interface IAppointment extends Document {
    _id: mongoose.Types.ObjectId;
    patientId: mongoose.Types.ObjectId | string;
    doctorId: mongoose.Types.ObjectId | string;
    appointmentDate: Date;
    duration: number;
    status: "scheduled" | "completed" | "cancelled" | "no-show";
    notes: string;
    consultationType: "in-person" | "online";
    reminderSentAt?: Date;
    created_at: Date;
    updated_at: Date;
}

const AppointmentSchema: Schema<IAppointment> = new Schema<IAppointment>(
    {
        patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
        doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
        appointmentDate: { type: Date, required: true },
        duration: { type: Number, default: 30 },
        status: {
            type: String,
            enum: ["scheduled", "completed", "cancelled", "no-show"],
            default: "scheduled",
        },
        notes: { type: String, default: "" },
        consultationType: { type: String, enum: ["in-person", "online"], default: "in-person" },
        reminderSentAt: { type: Date, default: null },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

AppointmentSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        if (ret.appointmentDate) ret.appointment_date = ret.appointmentDate;
        if (ret.consultationType !== undefined) ret.consultation_type = ret.consultationType;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.appointmentDate;
        delete ret.consultationType;
        return ret;
    },
});

export const AppointmentModel = mongoose.model<IAppointment>("Appointment", AppointmentSchema);
