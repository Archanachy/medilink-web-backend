import { Request, Response } from "express";
import z from "zod";
import { CreatePatientDTO } from "../dtos/patient.dto";
import { PatientService } from "../services/patient.service";
import { deleteProfileImage, shouldDeleteOldImage } from "../utils/file";

const service = new PatientService();

export class PatientController {
    async create(req: Request, res: Response) {
        const parsed = CreatePatientDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }
        const patient = await service.createPatient(parsed.data);
        return res.status(201).json({ success: true, data: patient });
    }

    async getById(req: Request, res: Response) {
        const patient = await service.getPatientById(req.params.id);
        return res.status(200).json({ success: true, data: patient });
    }

    async getByUserId(req: Request, res: Response) {
        // The userId param is actually the patient's _id from JWT token
        const patient = await service.getPatientById(req.params.userId);
        return res.status(200).json({ success: true, data: patient });
    }

    async update(req: Request, res: Response) {
        const payload: any = { ...req.body };
        
        if (req.file) {
            // Get existing patient to check for old image
            const existingPatient = await service.getPatientById(req.params.id);
            
            // Delete old image if a new one is being uploaded
            if (shouldDeleteOldImage(existingPatient?.profileImage, req.file.filename)) {
                deleteProfileImage(existingPatient?.profileImage);
            }
            
            // Store the path that matches your static serving route
            payload.profileImage = `/uploads/profile-images/${req.file.filename}`;
        }
        
        const patient = await service.updatePatient(req.params.id, payload);
        return res.status(200).json({ success: true, data: patient });
    }

    async remove(req: Request, res: Response) {
        await service.deletePatient(req.params.id);
        return res.status(200).json({ success: true, message: "Deleted" });
    }
}