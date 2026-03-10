import mongoose, { Schema, Document } from "mongoose";

export interface ISystemSetting extends Document {
    _id: mongoose.Types.ObjectId;
    key: string;
    value: any;
    category: string;
    description: string;
    isActive: boolean;
    updatedBy?: mongoose.Types.ObjectId | string;
    created_at: Date;
    updated_at: Date;
}

const SystemSettingSchema: Schema<ISystemSetting> = new Schema<ISystemSetting>(
    {
        key: { type: String, required: true, unique: true },
        value: { type: Schema.Types.Mixed, required: true },
        category: { type: String, default: "" },
        description: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

SystemSettingSchema.index({ category: 1, isActive: 1 });

SystemSettingSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        if (ret.isActive !== undefined) ret.is_active = ret.isActive;
        if (ret.updatedBy !== undefined) ret.updated_by = ret.updatedBy;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.isActive;
        delete ret.updatedBy;
        return ret;
    },
});

export const SystemSettingModel = mongoose.model<ISystemSetting>("SystemSetting", SystemSettingSchema);
