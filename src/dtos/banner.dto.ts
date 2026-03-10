import z from "zod";
import { BannerSchema } from "../types/banner.type";

export const CreateBannerDTO = BannerSchema;
export type CreateBannerDTO = z.infer<typeof CreateBannerDTO>;

export const UpdateBannerDTO = BannerSchema.partial();
export type UpdateBannerDTO = z.infer<typeof UpdateBannerDTO>;
