import z from "zod";
import { PrescriptionSchema, PrescriptionItemSchema } from "../types/prescription.type";

export const CreatePrescriptionDTO = PrescriptionSchema.extend({
    items: z.array(PrescriptionItemSchema).min(1),
});
export type CreatePrescriptionDTO = z.infer<typeof CreatePrescriptionDTO>;

export const UpdatePrescriptionDTO = PrescriptionSchema.partial();
export type UpdatePrescriptionDTO = z.infer<typeof UpdatePrescriptionDTO>;

export const UpdatePrescriptionItemsDTO = z.object({
    items: z.array(PrescriptionItemSchema).min(1),
});
export type UpdatePrescriptionItemsDTO = z.infer<typeof UpdatePrescriptionItemsDTO>;
