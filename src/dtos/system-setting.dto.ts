import z from "zod";
import { SystemSettingSchema } from "../types/system-setting.type";

export const CreateSystemSettingDTO = SystemSettingSchema;
export type CreateSystemSettingDTO = z.infer<typeof CreateSystemSettingDTO>;

export const UpdateSystemSettingDTO = SystemSettingSchema.partial();
export type UpdateSystemSettingDTO = z.infer<typeof UpdateSystemSettingDTO>;
