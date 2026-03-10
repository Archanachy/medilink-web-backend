import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
    _id: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId | string; // ID of patient/doctor/admin
    role?: "patient" | "doctor" | "admin"; // Role to identify which collection userId refers to
    action: string;
    resourceType: string;
    resourceId: string;
    oldValue?: any;
    newValue?: any;
    ipAddress: string;
    userAgent: string;
    created_at: Date;
    updated_at: Date;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema<IAuditLog>(
    {
        userId: { type: Schema.Types.ObjectId }, // No ref, as it can point to Patient/Doctor/Admin
        role: { type: String, enum: ["patient", "doctor", "admin"] },
        action: { type: String, required: true },
        resourceType: { type: String, default: "" },
        resourceId: { type: String, default: "" },
        oldValue: { type: Schema.Types.Mixed },
        newValue: { type: Schema.Types.Mixed },
        ipAddress: { type: String, default: "" },
        userAgent: { type: String, default: "" },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

AuditLogSchema.index({ userId: 1, created_at: -1 });
AuditLogSchema.index({ action: 1, created_at: -1 });

AuditLogSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        if (ret.userId !== undefined) ret.user_id = ret.userId;
        if (ret.resourceType !== undefined) ret.resource_type = ret.resourceType;
        if (ret.resourceId !== undefined) ret.resource_id = ret.resourceId;
        if (ret.ipAddress !== undefined) ret.ip_address = ret.ipAddress;
        if (ret.userAgent !== undefined) ret.user_agent = ret.userAgent;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.userId;
        delete ret.resourceType;
        delete ret.resourceId;
        delete ret.ipAddress;
        delete ret.userAgent;
        return ret;
    },
});

export const AuditLogModel = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
