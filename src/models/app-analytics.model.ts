import mongoose, { Schema, Document } from "mongoose";

export interface IAppAnalytics extends Document {
    _id: mongoose.Types.ObjectId;
    eventType: string;
    userId?: mongoose.Types.ObjectId | string; // ID of patient/doctor/admin
    role?: "patient" | "doctor" | "admin"; // Role to identify which collection userId refers to
    metadata: Record<string, any>;
    occurredAt?: Date;
    created_at: Date;
    updated_at: Date;
}

const AppAnalyticsSchema: Schema<IAppAnalytics> = new Schema<IAppAnalytics>(
    {
        eventType: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId }, // No ref, as it can point to Patient/Doctor/Admin
        role: { type: String, enum: ["patient", "doctor", "admin"] },
        metadata: { type: Schema.Types.Mixed, default: {} },
        occurredAt: { type: Date, default: null },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

AppAnalyticsSchema.index({ eventType: 1, created_at: -1 });
AppAnalyticsSchema.index({ userId: 1, created_at: -1 });

AppAnalyticsSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        if (ret.userId !== undefined) ret.user_id = ret.userId;
        if (ret.eventType !== undefined) ret.event_type = ret.eventType;
        if (ret.occurredAt) ret.occurred_at = ret.occurredAt;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.userId;
        delete ret.eventType;
        delete ret.occurredAt;
        return ret;
    },
});

export const AppAnalyticsModel = mongoose.model<IAppAnalytics>("AppAnalytics", AppAnalyticsSchema);
