import z from "zod";

export const DoctorDocumentSchema = z.object({
    doctorId: z.string(),
    docType: z.string().min(1),
    fileUrl: z.string(),
    filename: z.string(),
    mimeType: z.string(),
    size: z.number(),
    status: z.enum(["pending", "approved", "rejected"]).optional().default("pending"),
    notes: z.string().optional().default(""),
});

export type DoctorDocumentType = z.infer<typeof DoctorDocumentSchema>;
