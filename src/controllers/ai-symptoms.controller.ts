import { Request, Response } from "express";
import z from "zod";
import { AiSymptomsRequestDTO } from "../dtos/ai-symptoms.dto";
import { AiSymptomsService } from "../services/ai-symptoms.service";

const service = new AiSymptomsService();

export class AiSymptomsController {
    async analyze(req: Request, res: Response) {
        const parsed = AiSymptomsRequestDTO.safeParse(req.body ?? {});
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const result = service.analyze(parsed.data.symptoms, parsed.data.notes);
        return res.status(200).json({ success: true, data: result });
    }
}
