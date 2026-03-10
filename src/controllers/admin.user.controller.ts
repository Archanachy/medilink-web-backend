import { Request, Response } from "express";
import z from "zod";
import { CreateUserDTO } from "../dtos/user.dto";
import { UserService } from "../services/user.service";
import { deleteProfileImage, shouldDeleteOldImage } from "../utils/file";

const userService = new UserService();

export class AdminUserController {
    async create(req: Request, res: Response) {
        try {
            const parsedData = CreateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsedData.error) });
            }

            const role = (req.body.role || "patient") as "patient" | "doctor" | "admin";
            
            const payload: any = { ...parsedData.data };
            if (req.file) {
                payload.profileImage = `/uploads/profile-images/${req.file.filename}`;
            }

            let newUser;
            if (role === "patient") {
                newUser = await userService.createPatient(payload);
            } else if (role === "doctor") {
                newUser = await userService.createDoctor(payload);
            } else if (role === "admin") {
                newUser = await userService.createAdmin(payload);
            }

            return res.status(201).json({ success: true, data: newUser });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    async list(req: Request, res: Response) {
        try {
            const role = (req.query.role || "patient") as "patient" | "doctor" | "admin";
            const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
            const limitRaw = parseInt(String(req.query.limit ?? "10"), 10);
            const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
            const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 10 : limitRaw, 1), 100);
            
            const result = await userService.getAllUsers(role, { page, limit });
            const totalPages = Math.ceil((result?.total || 0) / limit) || 1;
            
            return res.status(200).json({
                success: true,
                data: result?.data,
                meta: { page, limit, total: result?.total, totalPages },
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const role = req.query.role as string | undefined;
            const userId = req.params.id;
            
            let user;
            if (role && ["patient", "doctor", "admin"].includes(role)) {
                // If role is explicitly provided, use it
                user = await userService.getUserById(userId, role as "patient" | "doctor" | "admin");
            } else {
                // If role is not provided, search across all roles
                user = await userService.getUserByIdAnyRole(userId);
            }
            
            return res.status(200).json({ success: true, data: user });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const role = (req.query.role || "patient") as "patient" | "doctor" | "admin";
            const payload: any = { ...req.body };

            if (req.file) {
                const existingUser = await userService.getUserById(req.params.id, role);
                if (shouldDeleteOldImage(existingUser?.profileImage, req.file.filename)) {
                    deleteProfileImage(existingUser?.profileImage);
                }
                payload.profileImage = `/uploads/profile-images/${req.file.filename}`;
            }

            const user = await userService.updateUser(req.params.id, role, payload);
            return res.status(200).json({ success: true, data: user });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    async remove(req: Request, res: Response) {
        try {
            const role = (req.query.role || "patient") as "patient" | "doctor" | "admin";
            const existingUser = await userService.getUserById(req.params.id, role);
            deleteProfileImage(existingUser?.profileImage);
            await userService.deleteUser(req.params.id, role);
            return res.status(200).json({ success: true, message: "Deleted" });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    async block(req: Request, res: Response) {
        try {
            const role = (req.query.role || "patient") as "patient" | "doctor" | "admin";
            const user = await userService.updateUser(req.params.id, role, { isActive: false } as any);
            return res.status(200).json({ success: true, data: user });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    async unblock(req: Request, res: Response) {
        try {
            const role = (req.query.role || "patient") as "patient" | "doctor" | "admin";
            const user = await userService.updateUser(req.params.id, role, { isActive: true } as any);
            return res.status(200).json({ success: true, data: user });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }
}
