import { AiSymptomsRecommendation, AiSymptomsResponse } from "../dtos/ai-symptoms.dto";

export class AiSymptomsService {
    analyze(symptoms: string[], notes?: string): AiSymptomsResponse {
        const input = [...symptoms, notes ?? ""].join(" ").toLowerCase();

        const rules: Array<{ keywords: string[]; specialty: string; summary: string }> = [
            { keywords: ["cough", "fever", "sore throat", "shortness of breath"], specialty: "Pulmonology", summary: "Respiratory symptoms detected." },
            { keywords: ["chest pain", "palpitations", "shortness of breath"], specialty: "Cardiology", summary: "Possible cardiovascular symptoms." },
            { keywords: ["rash", "itch", "skin"], specialty: "Dermatology", summary: "Skin-related symptoms." },
            { keywords: ["headache", "migraine", "dizzy", "dizziness"], specialty: "Neurology", summary: "Neurological symptoms mentioned." },
            { keywords: ["stomach", "nausea", "vomit", "diarrhea"], specialty: "Gastroenterology", summary: "Digestive symptoms reported." },
        ];

        const recommendations = rules
            .map((rule) => {
                const score = rule.keywords.reduce((acc, keyword) => (input.includes(keyword) ? acc + 1 : acc), 0);
                return score > 0
                    ? { specialty: rule.specialty, confidence: Math.min(0.95, 0.4 + score * 0.15), summary: rule.summary }
                    : null;
            })
            .filter(Boolean) as AiSymptomsRecommendation[];

        const urgency = this.getUrgency(input);

        if (!recommendations.length) {
            return {
                recommendations: [
                    {
                        specialty: "General Practice",
                        confidence: 0.45,
                        summary: "General symptoms detected. A primary care visit is recommended.",
                    },
                ],
                urgency,
                disclaimer: this.getDisclaimer(),
            };
        }

        return {
            recommendations: recommendations.sort((a, b) => b.confidence - a.confidence),
            urgency,
            disclaimer: this.getDisclaimer(),
        };
    }

    private getUrgency(input: string): "routine" | "urgent" | "emergency" {
        const emergencyKeywords = ["chest pain", "shortness of breath", "severe bleeding", "unconscious", "stroke"];
        const urgentKeywords = ["high fever", "severe pain", "vomiting", "persistent", "worsening"];

        if (emergencyKeywords.some((keyword) => input.includes(keyword))) return "emergency";
        if (urgentKeywords.some((keyword) => input.includes(keyword))) return "urgent";
        return "routine";
    }

    private getDisclaimer(): string {
        return "This symptom checker provides informational guidance only and does not replace professional medical advice.";
    }
}
