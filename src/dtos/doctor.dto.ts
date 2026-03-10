import z from "zod";
import { DoctorSchema } from "../types/doctor.type";

export const CreateDoctorDTO = DoctorSchema;
export type CreateDoctorDTO = z.infer<typeof CreateDoctorDTO>;

export const UpdateDoctorDTO = DoctorSchema.partial();
export type UpdateDoctorDTO = z.infer<typeof UpdateDoctorDTO>;
