import z from "zod";
import { DoctorDocumentSchema } from "../types/doctor-document.type";

export const CreateDoctorDocumentDTO = DoctorDocumentSchema;
export type CreateDoctorDocumentDTO = z.infer<typeof CreateDoctorDocumentDTO>;

export const UpdateDoctorDocumentStatusDTO = z.object({
    status: z.enum(["pending", "approved", "rejected"]),
    notes: z.string().optional(),
});
export type UpdateDoctorDocumentStatusDTO = z.infer<typeof UpdateDoctorDocumentStatusDTO>;
