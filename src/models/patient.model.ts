import mongoose, { Schema, Document } from "mongoose";

export interface IPatient extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    dateOfBirth: string;
    gender: string;
    bloodGroup: string;
    address: string;
    profileImage: string;
    isVerified: boolean;
    isActive: boolean;
    lastLogin: Date | null;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    created_at: Date;
    updated_at: Date;
}

const PatientSchema: Schema<IPatient> = new Schema<IPatient>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    username: { type: String, required: true, unique: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    phone: { type: String, default: "" },
    role: { type: String, default: "patient" },
    dateOfBirth: { type: String, default: "" },
    gender: { type: String, default: "" },
    bloodGroup: { type: String, default: "" },
    address: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

PatientSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.password;
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        if (ret.lastLogin) ret.last_login = ret.lastLogin;
        if (ret.isVerified !== undefined) ret.is_verified = ret.isVerified;
        if (ret.isActive !== undefined) ret.is_active = ret.isActive;
        if (ret.resetPasswordToken !== undefined) ret.reset_password_token = ret.resetPasswordToken;
        if (ret.resetPasswordExpires) ret.reset_password_expires = ret.resetPasswordExpires;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.lastLogin;
        delete ret.isVerified;
        delete ret.isActive;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
    }
});

export const PatientModel = mongoose.model<IPatient>("Patient", PatientSchema);