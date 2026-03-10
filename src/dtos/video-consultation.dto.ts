import z from "zod";
import { VideoConsultationSchema } from "../types/video-consultation.type";

export const CreateVideoConsultationDTO = VideoConsultationSchema;
export type CreateVideoConsultationDTO = z.infer<typeof CreateVideoConsultationDTO>;

export const StartVideoDTO = z.object({
    appointmentId: z.string(),
});
export type StartVideoDTO = z.infer<typeof StartVideoDTO>;

export const EndVideoDTO = z.object({
    durationSeconds: z.number().optional(),
});
export type EndVideoDTO = z.infer<typeof EndVideoDTO>;
