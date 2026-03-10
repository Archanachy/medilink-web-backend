import z from "zod";

export const ReviewSchema = z.object({
    patientId: z.string(),
    doctorId: z.string(),
    appointmentId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional().default(""),
});

export type ReviewType = z.infer<typeof ReviewSchema>;
