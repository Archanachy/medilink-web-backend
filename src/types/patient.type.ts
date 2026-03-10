import z from "zod";

// Patient data contract - Patient is a complete user with auth fields
export const PatientSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    username: z.string().min(3),
    firstName: z.string().default(""),
    lastName: z.string().default(""),
    phone: z.string().default(""),
    dateOfBirth: z.string().default(""), // ISO string if provided
    gender: z.string().default(""),
    bloodGroup: z.string().default(""),
    address: z.string().default(""),
    profileImage: z.string().default(""),
});

export type PatientType = z.infer<typeof PatientSchema>;