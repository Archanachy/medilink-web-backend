import z from "zod";

export const DoctorSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    username: z.string().min(3),
    firstName: z.string().optional().default(""),
    lastName: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    specialization: z.string().optional().default(""),
    licenseNumber: z.string().optional().nullable().default(null),
    yearsOfExperience: z.number().optional().default(0),
    profileImage: z.string().optional().default(""),
    bio: z.string().optional().default(""),
    consultationFee: z.number().optional().default(0),
    isAvailable: z.boolean().optional().default(true),
    availabilitySchedule: z.array(z.object({
        dayOfWeek: z.string(),
        isAvailable: z.boolean(),
        timeSlots: z.array(z.object({
            startTime: z.string(),
            endTime: z.string(),
        })),
    })).optional().default([]),
    ratingAverage: z.number().optional().default(0),
    ratingCount: z.number().optional().default(0),
    verificationStatus: z.enum(["pending", "verified", "rejected"]).optional().default("pending"),
    verificationNotes: z.string().optional().default(""),
});

export type DoctorType = z.infer<typeof DoctorSchema>;
