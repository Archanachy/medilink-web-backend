import { UserService } from "../services/user.service";
import { CreateUserDTO, ForgotPasswordDTO, LoginUserDTO, ResetPasswordDTO, ChangePasswordDTO } from "../dtos/user.dto";
import { Request, Response } from "express";
import z from "zod";
import { deleteProfileImage, shouldDeleteOldImage } from "../utils/file";

let userService = new UserService();

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const parsedData = CreateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: JSON.stringify(parsedData.error.issues.map((i: any) => i.message)) }
                )
            }
            
            const userData: CreateUserDTO = parsedData.data;
            const role = (req.body?.role || "patient") as "patient" | "doctor" | "admin";
            
            let newUser;
            if (role === "patient") {
                newUser = await userService.createPatient(userData);
            } else if (role === "doctor") {
                newUser = await userService.createDoctor(userData);
            } else if (role === "admin") {
                newUser = await userService.createAdmin(userData);
            }
            
            return res.status(201).json(
                { success: true, message: "User Created", data: newUser }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async login(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: JSON.stringify(parsedData.error.issues.map((i: any) => i.message)) }
                )
            }
            
            const loginData: LoginUserDTO = parsedData.data;
            const providedRole = req.body?.role as "patient" | "doctor" | "admin" | undefined;
            
            let token: string;
            let user: any;
            let detectedRole: "patient" | "doctor" | "admin";
            
            if (providedRole) {
                // Role specified - search specific collection
                const result = await userService.loginUser(loginData, providedRole);
                token = result.token;
                user = result.user;
                detectedRole = providedRole;
            } else {
                // No role specified - search all collections
                const result = await userService.loginUserAnyRole(loginData);
                token = result.token;
                user = result.user;
                detectedRole = result.role;
            }
            
            // Add role to user object for frontend
            const userWithRole = {
                ...user.toJSON ? user.toJSON() : user,
                role: detectedRole
            };
            
            return res.status(200).json(
                { success: true, message: "Login successful", data: userWithRole, token }
            );

        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const parsed = ForgotPasswordDTO.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }

            const providedRole = req.body?.role as "patient" | "doctor" | "admin" | undefined;
            
            if (providedRole) {
                // Role specified - search specific collection
                await userService.requestPasswordReset(parsed.data.email, providedRole);
            } else {
                // No role specified - search all collections
                await userService.requestPasswordResetAnyRole(parsed.data.email);
            }
            
            return res.status(200).json({ success: true, message: "Reset email sent" });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const normalizedBody = {
                token: req.body?.token ?? req.query?.token,
                password: req.body?.password ?? req.body?.newPassword,
                confirmPassword:
                    req.body?.confirmPassword ?? req.body?.confirmNewPassword ?? req.body?.newPasswordConfirm,
            };
            const parsed = ResetPasswordDTO.safeParse(normalizedBody);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }

            const providedRole = req.body?.role as "patient" | "doctor" | "admin" | undefined;
            
            if (providedRole) {
                // Role specified - search specific collection
                await userService.resetPassword(parsed.data.token, parsed.data.password, providedRole);
            } else {
                // No role specified - search all collections
                await userService.resetPasswordAnyRole(parsed.data.token, parsed.data.password);
            }
            
            return res.status(200).json({ success: true, message: "Password reset successful" });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const role = (req.body?.role || req.user?.role || "patient") as "patient" | "doctor" | "admin";
            const user = await userService.getUserById(id, role);
            return res.status(200).json(
                { success: true, data: user }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const payload: any = { ...req.body };
            const role = (req.body?.role || req.user?.role || "patient") as "patient" | "doctor" | "admin";

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
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async changePassword(req: Request, res: Response) {
        try {
            const parsed = ChangePasswordDTO.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ 
                    success: false, 
                    message: JSON.stringify(parsed.error.issues.map((i: any) => i.message)) 
                });
            }

            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Unauthorized" 
                });
            }

            const userId = req.user.id;
            const role = (req.user?.role || "patient") as "patient" | "doctor" | "admin";

            await userService.changePassword(
                userId, 
                parsed.data.oldPassword, 
                parsed.data.newPassword,
                role
            );

            return res.status(200).json({ 
                success: true, 
                message: "Password changed successfully" 
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
    
}