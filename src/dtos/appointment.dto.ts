import z from "zod";
import { AppointmentSchema } from "../types/appointment.type";

export const CreateAppointmentDTO = AppointmentSchema;
export type CreateAppointmentDTO = z.infer<typeof CreateAppointmentDTO>;

export const UpdateAppointmentDTO = AppointmentSchema.partial();
export type UpdateAppointmentDTO = z.infer<typeof UpdateAppointmentDTO>;
