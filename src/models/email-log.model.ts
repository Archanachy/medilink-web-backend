import mongoose, { Schema, Document } from "mongoose";

export interface IEmailLog extends Document {
    _id: mongoose.Types.ObjectId;
    to: string;
    subject: string;
    template: string;
    status: "sent" | "failed";
    error: string;
    created_at: Date;
    updated_at: Date;
}

const EmailLogSchema: Schema<IEmailLog> = new Schema<IEmailLog>(
    {
        to: { type: String, required: true },
        subject: { type: String, required: true },
        template: { type: String, default: "" },
        status: { type: String, enum: ["sent", "failed"], required: true },
        error: { type: String, default: "" },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

EmailLogSchema.index({ to: 1, created_at: -1 });

EmailLogSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    },
});

export const EmailLogModel = mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);
