import z from "zod";

export const FaqSchema = z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
    category: z.string().optional().default(""),
    tags: z.array(z.string()).optional().default([]),
    isActive: z.boolean().optional().default(true),
    displayOrder: z.number().optional().default(0),
});

export type FaqType = z.infer<typeof FaqSchema>;
