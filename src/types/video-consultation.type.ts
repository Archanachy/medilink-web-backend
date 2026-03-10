import z from "zod";

export const VideoConsultationSchema = z.object({
    appointmentId: z.string(),
    patientId: z.string(),
    doctorId: z.string(),
    provider: z.enum(["dummy", "agora", "twilio", "webrtc"]).default("dummy"),
    channelName: z.string().min(1),
    status: z.enum(["scheduled", "started", "ended", "cancelled"]).default("scheduled"),
    startedAt: z.date().optional(),
    endedAt: z.date().optional(),
    durationSeconds: z.number().optional(),
    metadata: z.record(z.string(), z.any()).optional().default({}),
});

export type VideoConsultationType = z.infer<typeof VideoConsultationSchema>;
