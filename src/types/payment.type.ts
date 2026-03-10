import z from "zod";

export const PaymentSchema = z.object({
    patientId: z.string(),
    doctorId: z.string().optional(),
    appointmentId: z.string().optional(),
    amount: z.number().positive(),
    currency: z.string().optional().default("USD"),
    status: z.enum(["pending", "authorized", "paid", "failed", "refunded"]).optional().default("pending"),
    provider: z.string().optional().default("dummy"),
    providerReference: z.string().optional().default(""),
    metadata: z.record(z.string(), z.any()).optional().default({}),
});

export type PaymentType = z.infer<typeof PaymentSchema>;
