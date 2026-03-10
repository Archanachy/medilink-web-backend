import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";
const UserSchema: Schema = new Schema<UserType>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, select: false },
        username: { type: String, required: true, unique: true },
        firstName: { type: String, default: "" },
        lastName: { type: String, default: "" },
        phone: { type: String, default: "" },
        profileImage: { type: String, default: "" },
        role: {
            type: String,
            enum: ["patient", "doctor", "admin"],
            default: "patient",
        },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date, default: null },
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpires: { type: Date, default: null }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

export interface IUser extends UserType, Document { // combine UserType and Document
    _id: mongoose.Types.ObjectId; // mongo related attribute/ custom attributes
    created_at: Date;
    updated_at: Date;
}

UserSchema.set('toJSON', {
    transform: function (doc: any, ret: any) {
        delete ret.password;
        delete ret.__v;
        // expose snake_case fields to match external contract
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

export const UserModel = mongoose.model<IUser>('User', UserSchema);

