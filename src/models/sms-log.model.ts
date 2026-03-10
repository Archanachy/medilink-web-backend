import mongoose, { Schema, Document } from "mongoose";

export interface ISmsLog extends Document {
    _id: mongoose.Types.ObjectId;
    to: string;
    message: string;
    status: "sent" | "failed";
    error: string;
    created_at: Date;
    updated_at: Date;
}

const SmsLogSchema: Schema<ISmsLog> = new Schema<ISmsLog>(
    {
        to: { type: String, required: true },
        message: { type: String, required: true },
        status: { type: String, enum: ["sent", "failed"], required: true },
        error: { type: String, default: "" },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

SmsLogSchema.index({ to: 1, created_at: -1 });

SmsLogSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    },
});

export const SmsLogModel = mongoose.model<ISmsLog>("SmsLog", SmsLogSchema);
