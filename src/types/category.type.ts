import z from "zod";

export const CategorySchema = z.object({
    name: z.string().min(1),
    description: z.string().optional().default(""),
    isActive: z.boolean().optional().default(true),
});

export type CategoryType = z.infer<typeof CategorySchema>;
