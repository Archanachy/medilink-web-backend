import z from "zod";
import { AppAnalyticsSchema } from "../types/app-analytics.type";

export const CreateAppAnalyticsDTO = AppAnalyticsSchema;
export type CreateAppAnalyticsDTO = z.infer<typeof CreateAppAnalyticsDTO>;
