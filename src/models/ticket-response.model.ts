import mongoose, { Schema, Document } from "mongoose";

export interface ITicketResponse extends Document {
    _id: mongoose.Types.ObjectId;
    ticketId: mongoose.Types.ObjectId | string;
    userId: mongoose.Types.ObjectId | string; // ID of patient/doctor/admin
    role: "patient" | "doctor" | "admin"; // Role to identify which collection userId refers to
    message: string;
    attachments: Array<{ fileUrl: string; filename: string; mimeType: string; size: number }>;
    created_at: Date;
    updated_at: Date;
}

const TicketResponseSchema: Schema<ITicketResponse> = new Schema<ITicketResponse>(
    {
        ticketId: { type: Schema.Types.ObjectId, ref: "SupportTicket", required: true },
        userId: { type: Schema.Types.ObjectId, required: true }, // No ref, as it can point to Patient/Doctor/Admin
        role: { type: String, enum: ["patient", "doctor", "admin"], required: true },
        message: { type: String, required: true },
        attachments: [
            {
                fileUrl: { type: String, required: true },
                filename: { type: String, required: true },
                mimeType: { type: String, required: true },
                size: { type: Number, required: true },
            },
        ],
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

TicketResponseSchema.index({ ticketId: 1, created_at: 1 });

TicketResponseSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    },
});

export const TicketResponseModel = mongoose.model<ITicketResponse>("TicketResponse", TicketResponseSchema);
