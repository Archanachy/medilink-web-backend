import z from "zod";

export const UserSchema = z.object({
    username: z.string().min(1),
    email: z.email(),
    password: z.string().min(6),
    phone: z.string().optional().default(""),
    firstName: z.string().optional().default(""),
    lastName: z.string().optional().default(""),
    profileImage: z.string().optional().default(""),
    role: z.enum(["patient", "doctor", "admin"]).default("patient"),
    isVerified: z.boolean().default(false),
    isActive: z.boolean().default(true),
    lastLogin: z.date().optional(),
    resetPasswordToken: z.string().nullable().optional(),
    resetPasswordExpires: z.date().nullable().optional(),
});

export type UserType = z.infer<typeof UserSchema>;