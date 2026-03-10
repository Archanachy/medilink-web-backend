import z from "zod";

export const SystemSettingSchema = z.object({
    key: z.string().min(1),
    value: z.any(),
    category: z.string().optional().default(""),
    description: z.string().optional().default(""),
    isActive: z.boolean().optional().default(true),
    updatedBy: z.string().optional(),
});

export type SystemSettingType = z.infer<typeof SystemSettingSchema>;
