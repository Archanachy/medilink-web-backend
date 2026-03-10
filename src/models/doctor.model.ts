import mongoose, { Schema, Document } from "mongoose";
import { DoctorType } from "../types/doctor.type";

export interface IDoctor extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    specialization: string;
    licenseNumber: string | null;
    yearsOfExperience: number;
    profileImage: string;
    bio: string;
    consultationFee: number;
    isAvailable: boolean;
    availabilitySchedule?: Array<{
        dayOfWeek: string;
        isAvailable: boolean;
        timeSlots: Array<{ startTime: string; endTime: string }>;
    }>;
    ratingAverage: number;
    ratingCount: number;
    verificationStatus: "pending" | "verified" | "rejected";
    verificationNotes: string;
    isVerified: boolean;
    isActive: boolean;
    lastLogin: Date | null;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    created_at: Date;
    updated_at: Date;
}

const DoctorSchema: Schema<IDoctor> = new Schema<IDoctor>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, select: false },
        username: { type: String, required: true, unique: true },
        firstName: { type: String, default: "" },
        lastName: { type: String, default: "" },
        phone: { type: String, default: "" },
        role: { type: String, default: "doctor" },
        specialization: { type: String, default: "" },
        licenseNumber: { type: String, default: null, unique: true, sparse: true },
        yearsOfExperience: { type: Number, default: 0 },
        profileImage: { type: String, default: "" },
        bio: { type: String, default: "" },
        consultationFee: { type: Number, default: 0 },
        isAvailable: { type: Boolean, default: true },
        availabilitySchedule: {
            type: [
                {
                    dayOfWeek: { type: String, required: true },
                    isAvailable: { type: Boolean, default: false },
                    timeSlots: [
                        {
                            startTime: { type: String, required: true },
                            endTime: { type: String, required: true },
                        },
                    ],
                },
            ],
            default: [],
        },
        ratingAverage: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
        verificationStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
        },
        verificationNotes: { type: String, default: "" },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date, default: null },
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpires: { type: Date, default: null },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

DoctorSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.password;
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        if (ret.isAvailable !== undefined) ret.is_available = ret.isAvailable;
        if (ret.availabilitySchedule !== undefined) ret.availability_schedule = ret.availabilitySchedule;
        if (ret.ratingAverage !== undefined) ret.rating_average = ret.ratingAverage;
        if (ret.ratingCount !== undefined) ret.rating_count = ret.ratingCount;
        if (ret.verificationStatus !== undefined) ret.verification_status = ret.verificationStatus;
        if (ret.verificationNotes !== undefined) ret.verification_notes = ret.verificationNotes;
        if (ret.lastLogin) ret.last_login = ret.lastLogin;
        if (ret.isVerified !== undefined) ret.is_verified = ret.isVerified;
        if (ret.isActive !== undefined) ret.is_active = ret.isActive;
        if (ret.resetPasswordToken !== undefined) ret.reset_password_token = ret.resetPasswordToken;
        if (ret.resetPasswordExpires) ret.reset_password_expires = ret.resetPasswordExpires;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.isAvailable;
        delete ret.availabilitySchedule;
        delete ret.ratingAverage;
        delete ret.ratingCount;
        delete ret.verificationStatus;
        delete ret.verificationNotes;
        delete ret.lastLogin;
        delete ret.isVerified;
        delete ret.isActive;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
    },
});

// Handle duplicate key error recovery by dropping and recreating the index on startup
DoctorSchema.post("init", async function() {
    try {
        const collection = this.collection;
        // Check if licenseNumber index exists
        const indexes = await collection.getIndexes();
        if (indexes.licenseNumber_1) {
            // Remove old index that has duplicate empty strings
            await collection.dropIndex("licenseNumber_1");
        }
    } catch (error: any) {
        // Index might not exist, that's fine
        if (!error.message.includes("index not found")) {
            console.error("Error managing licenseNumber index:", error);
        }
    }
});

export const DoctorModel = mongoose.model<IDoctor>("Doctor", DoctorSchema);
