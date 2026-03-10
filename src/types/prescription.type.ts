import z from "zod";

export const PrescriptionSchema = z.object({
    patientId: z.string(),
    doctorId: z.string(),
    appointmentId: z.string().optional(),
    notes: z.string().optional().default(""),
    status: z.enum(["active", "cancelled", "completed"]).optional().default("active"),
});

export const PrescriptionItemSchema = z.object({
    name: z.string().min(1),
    dosage: z.string().min(1),
    frequency: z.string().min(1),
    duration: z.string().min(1),
    instructions: z.string().optional().default(""),
});

export type PrescriptionType = z.infer<typeof PrescriptionSchema>;
export type PrescriptionItemType = z.infer<typeof PrescriptionItemSchema>;
