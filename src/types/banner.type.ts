import z from "zod";

export const BannerSchema = z.object({
    title: z.string().min(1),
    imageUrl: z.string().min(1),
    linkUrl: z.string().optional().default(""),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    targetRoles: z.array(z.enum(["patient", "doctor", "admin"])).optional().default([]),
    isActive: z.boolean().optional().default(true),
    displayOrder: z.number().optional().default(0),
    viewCount: z.number().optional().default(0),
    clickCount: z.number().optional().default(0),
});

export type BannerType = z.infer<typeof BannerSchema>;
