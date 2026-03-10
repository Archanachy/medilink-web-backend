import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId | string; // ID of patient/doctor/admin
    role: "patient" | "doctor" | "admin"; // Required to identify which collection userId refers to
    title: string;
    message: string;
    type: string;
    data: Record<string, any>;
    isRead: boolean;
    created_at: Date;
    updated_at: Date;
}

const NotificationSchema: Schema<INotification> = new Schema<INotification>(
    {
        userId: { type: Schema.Types.ObjectId, required: true }, // No ref, as it can point to Patient/Doctor/Admin
        role: { type: String, enum: ["patient", "doctor", "admin"], required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, default: "general" },
        data: { type: Schema.Types.Mixed, default: {} },
        isRead: { type: Boolean, default: false },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

NotificationSchema.index({ userId: 1, isRead: 1, created_at: -1 });

NotificationSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        if (ret.isRead !== undefined) ret.is_read = ret.isRead;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.isRead;
        return ret;
    },
});

export const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);
