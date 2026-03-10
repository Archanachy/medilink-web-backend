import z from "zod";
import { MedicalReportSchema } from "../types/medical-report.type";

export const CreateMedicalReportDTO = MedicalReportSchema;
export type CreateMedicalReportDTO = z.infer<typeof CreateMedicalReportDTO>;

export const ShareMedicalReportDTO = z.object({
    doctorId: z.string(),
});
export type ShareMedicalReportDTO = z.infer<typeof ShareMedicalReportDTO>;
