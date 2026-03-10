import z from "zod";

export const AdminSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    username: z.string().min(3),
    firstName: z.string().optional().default(""),
    lastName: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    profileImage: z.string().optional().default(""),
    permissions: z.array(z.string()).optional().default([]),
});

export type AdminType = z.infer<typeof AdminSchema>;
