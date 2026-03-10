import z from "zod";

export const MedicalReportSchema = z.object({
    patientId: z.string(),
    fileUrl: z.string(),
    filename: z.string(),
    mimeType: z.string(),
    size: z.number(),
    title: z.string().optional().default(""),
    description: z.string().optional().default(""),
    sharedWithDoctors: z.array(z.string()).optional().default([]),
});

export type MedicalReportType = z.infer<typeof MedicalReportSchema>;
