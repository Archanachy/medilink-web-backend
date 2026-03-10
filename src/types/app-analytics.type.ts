import z from "zod";

export const AppAnalyticsSchema = z.object({
    eventType: z.string().min(1),
    userId: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional().default({}),
    occurredAt: z.date().optional(),
});

export type AppAnalyticsType = z.infer<typeof AppAnalyticsSchema>;
