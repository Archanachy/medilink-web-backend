import { Request, Response } from "express";
import z from "zod";
import { StartVideoDTO, EndVideoDTO } from "../dtos/video-consultation.dto";
import { VideoConsultationService } from "../services/video-consultation.service";

const service = new VideoConsultationService();

export class DoctorVideoController {
    async start(req: Request, res: Response) {
        const parsed = StartVideoDTO.safeParse({ appointmentId: req.params.id });
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const result = await service.startForAppointment(parsed.data.appointmentId);
        return res.status(200).json({ success: true, data: result });
    }

    async getById(req: Request, res: Response) {
        const consultation = await service.getById(req.params.id);
        return res.status(200).json({ success: true, data: consultation });
    }

    async end(req: Request, res: Response) {
        const parsed = EndVideoDTO.safeParse(req.body ?? {});
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const consultation = await service.endConsultation(req.params.id, parsed.data.durationSeconds);
        return res.status(200).json({ success: true, data: consultation });
    }
}
