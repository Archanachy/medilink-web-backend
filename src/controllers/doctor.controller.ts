import { Request, Response } from "express";
import z from "zod";
import { CreateDoctorDTO, UpdateDoctorDTO } from "../dtos/doctor.dto";
import { DoctorService } from "../services/doctor.service";
import { deleteProfileImage, shouldDeleteOldImage } from "../utils/file";

const service = new DoctorService();

export class DoctorController {
    async create(req: Request, res: Response) {
        const parsed = CreateDoctorDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const payload: any = { ...parsed.data };
        if (req.file) {
            payload.profileImage = `/uploads/profile-images/${req.file.filename}`;
        }

        const doctor = await service.createDoctor(payload);
        return res.status(201).json({ success: true, data: doctor });
    }

    async getById(req: Request, res: Response) {
        const doctor = await service.getDoctorById(req.params.id);
        return res.status(200).json({ success: true, data: doctor });
    }

    async getBySpecialization(req: Request, res: Response) {
        const { specialization } = req.query;
        if (!specialization || typeof specialization !== "string") {
            return res.status(400).json({ success: false, message: "Specialization query parameter is required" });
        }
        const doctors = await service.getDoctorsBySpecialization(specialization);
        return res.status(200).json({ success: true, data: doctors });
    }

    async list(req: Request, res: Response) {
        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "10"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 10 : limitRaw, 1), 100);
        const { data, total } = await service.getAllDoctors({ page, limit });
        const totalPages = Math.ceil(total / limit) || 1;
        return res.status(200).json({
            success: true,
            data,
            meta: { page, limit, total, totalPages },
        });
    }

    async update(req: Request, res: Response) {
        const payload: any = { ...req.body };

        if (req.file) {
            const existingDoctor = await service.getDoctorById(req.params.id);
            if (shouldDeleteOldImage(existingDoctor?.profileImage, req.file.filename)) {
                deleteProfileImage(existingDoctor?.profileImage);
            }
            payload.profileImage = `/uploads/profile-images/${req.file.filename}`;
        }

        const doctor = await service.updateDoctor(req.params.id, payload);
        return res.status(200).json({ success: true, data: doctor });
    }

    async remove(req: Request, res: Response) {
        const existingDoctor = await service.getDoctorById(req.params.id);
        deleteProfileImage(existingDoctor?.profileImage);
        await service.deleteDoctor(req.params.id);
        return res.status(200).json({ success: true, message: "Deleted" });
    }

    async getAvailability(req: Request, res: Response) {
        const doctor = await service.getDoctorById(req.params.id);
        return res.status(200).json({ 
            success: true, 
            data: { 
                isAvailable: doctor.isAvailable,
                availabilitySchedule: doctor.availabilitySchedule || []
            } 
        });
    }

    async updateAvailability(req: Request, res: Response) {
        const schedule = req.body;
        
        // Check if it's an array (weekly schedule) or a simple boolean
        if (Array.isArray(schedule)) {
            // Validate weekly schedule format
            const isValid = schedule.every(day => 
                day.dayOfWeek && 
                typeof day.isAvailable === "boolean" && 
                Array.isArray(day.timeSlots)
            );
            
            if (!isValid) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid schedule format. Each day must have dayOfWeek, isAvailable (boolean), and timeSlots (array)" 
                });
            }
            
            const doctor = await service.updateDoctor(req.params.id, { availabilitySchedule: schedule });
            return res.status(200).json({ success: true, data: { availabilitySchedule: doctor.availabilitySchedule } });
        } 
        
        // Handle simple boolean isAvailable
        const { isAvailable } = req.body;
        if (typeof isAvailable !== "boolean") {
            return res.status(400).json({ 
                success: false, 
                message: "Send either an array of weekly schedule or { isAvailable: boolean }" 
            });
        }
        
        const doctor = await service.updateDoctor(req.params.id, { isAvailable });
        return res.status(200).json({ success: true, data: { isAvailable: doctor.isAvailable } });
    }
}
