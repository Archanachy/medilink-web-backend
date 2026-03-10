import z from "zod";

export const AiSymptomsRequestDTO = z.object({
    symptoms: z.array(z.string().min(1)).min(1),
    notes: z.string().optional().default(""),
});

export type AiSymptomsRequestDTO = z.infer<typeof AiSymptomsRequestDTO>;

export type AiSymptomsRecommendation = {
    specialty: string;
    confidence: number;
    summary: string;
};

export type AiSymptomsResponse = {
    recommendations: AiSymptomsRecommendation[];
    urgency: "routine" | "urgent" | "emergency";
    disclaimer: string;
};
