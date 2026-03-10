import z from "zod";
import { FaqSchema } from "../types/faq.type";

export const CreateFaqDTO = FaqSchema;
export type CreateFaqDTO = z.infer<typeof CreateFaqDTO>;

export const UpdateFaqDTO = FaqSchema.partial();
export type UpdateFaqDTO = z.infer<typeof UpdateFaqDTO>;
