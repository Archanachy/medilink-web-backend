import mongoose, { Schema, Document } from "mongoose";

export interface ISupportTicket extends Document {
    _id: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId | string;
    role: "patient" | "doctor" | "admin";
    subject: string;
    description: string;
    status: "open" | "pending" | "closed";
    priority: "low" | "medium" | "high" | "urgent";
    category: string;
    assignedTo?: mongoose.Types.ObjectId | string;
    ticketNumber: string;
    attachments: Array<{ fileUrl: string; filename: string; mimeType: string; size: number }>;
    lastResponseAt?: Date;
    created_at: Date;
    updated_at: Date;
}

const SupportTicketSchema: Schema<ISupportTicket> = new Schema<ISupportTicket>(
    {
        createdBy: { type: Schema.Types.ObjectId, required: true }, // No ref, can be Patient/Doctor/Admin ID
        role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
        subject: { type: String, required: true },
        description: { type: String, required: true },
        status: { type: String, enum: ["open", "pending", "closed"], default: "open" },
        priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
        category: { type: String, default: "" },
        assignedTo: { type: Schema.Types.ObjectId }, // No ref, can be Patient/Doctor/Admin ID
        ticketNumber: { type: String, required: true, unique: true },
        attachments: [
            {
                fileUrl: { type: String, required: true },
                filename: { type: String, required: true },
                mimeType: { type: String, required: true },
                size: { type: Number, required: true },
            },
        ],
        lastResponseAt: { type: Date, default: null },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

SupportTicketSchema.index({ createdBy: 1, created_at: -1 });
SupportTicketSchema.index({ status: 1, created_at: -1 });
SupportTicketSchema.index({ priority: 1, created_at: -1 });

SupportTicketSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        if (ret.lastResponseAt) ret.last_response_at = ret.lastResponseAt;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.lastResponseAt;
        return ret;
    },
});

export const SupportTicketModel = mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);
