import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { PatientRepository } from "../repositories/patient.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { AdminRepository } from "../repositories/admin.repository";
import bcryptjs from "bcryptjs"
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET, RESET_PASSWORD_URL } from "../configs";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/email";

const patientRepository = new PatientRepository();
const doctorRepository = new DoctorRepository();
const adminRepository = new AdminRepository();

export class UserService {
    // Create Patient
    async createPatient(data: CreateUserDTO){
        // business logic before creating user
        const emailCheck = await patientRepository.getPatientByEmail(data.email);
        if(emailCheck){
            throw new HttpError(403, "Email already in use");
        }
        const usernameCheck = await patientRepository.getPatientByUsername(data.username);
        if(usernameCheck){
            throw new HttpError(403, "Username already in use");
        }
        // hash password
        const hashedPassword = await bcryptjs.hash(data.password, 10);
        const firstName = data.firstName?.trim() || "";
        const lastName = data.lastName?.trim() || "";
        
        const patientPayload = {
            email: data.email,
            username: data.username,
            password: hashedPassword,
            firstName,
            lastName,
            phone: data.phone ?? "",
            profileImage: data.profileImage ?? "",
            dateOfBirth: "",
            gender: "",
            bloodGroup: "",
            address: "",
            isVerified: false,
            isActive: true,
        };

        const newPatient = await patientRepository.createPatient(patientPayload);
        return newPatient;
    }

    // Create Doctor
    async createDoctor(data: CreateUserDTO){
        // business logic before creating user
        const emailCheck = await doctorRepository.getDoctorByEmail(data.email);
        if(emailCheck){
            throw new HttpError(403, "Email already in use");
        }
        const usernameCheck = await doctorRepository.getDoctorByUsername(data.username);
        if(usernameCheck){
            throw new HttpError(403, "Username already in use");
        }
        // hash password
        const hashedPassword = await bcryptjs.hash(data.password, 10);
        const firstName = data.firstName?.trim() || "";
        const lastName = data.lastName?.trim() || "";
        
        const doctorPayload = {
            email: data.email,
            username: data.username,
            password: hashedPassword,
            firstName,
            lastName,
            phone: data.phone ?? "",
            profileImage: data.profileImage ?? "",
            specialization: "",
            licenseNumber: null,
            yearsOfExperience: 0,
            bio: "",
            consultationFee: 0,
            isAvailable: true,
            availabilitySchedule: [],
            ratingAverage: 0,
            ratingCount: 0,
            verificationStatus: "pending" as const,
            verificationNotes: "",
            isVerified: false,
            isActive: true,
        };

        const newDoctor = await doctorRepository.createDoctor(doctorPayload);
        return newDoctor;
    }

    // Create Admin
    async createAdmin(data: CreateUserDTO){
        // business logic before creating user
        const emailCheck = await adminRepository.getAdminByEmail(data.email);
        if(emailCheck){
            throw new HttpError(403, "Email already in use");
        }
        const usernameCheck = await adminRepository.getAdminByUsername(data.username);
        if(usernameCheck){
            throw new HttpError(403, "Username already in use");
        }
        // hash password
        const hashedPassword = await bcryptjs.hash(data.password, 10);
        const firstName = data.firstName?.trim() || "";
        const lastName = data.lastName?.trim() || "";
        
        const adminPayload = {
            email: data.email,
            username: data.username,
            password: hashedPassword,
            firstName,
            lastName,
            phone: data.phone ?? "",
            profileImage: data.profileImage ?? "",
            permissions: [],
            isVerified: true,
            isActive: true,
        };

        const newAdmin = await adminRepository.createAdmin(adminPayload);
        return newAdmin;
    }

    // Login for any user type (Patient, Doctor, Admin)
    async loginUser(data: LoginUserDTO, role: "patient" | "doctor" | "admin") {
        let user: any = null;

        if (role === "patient") {
            user = await patientRepository.getPatientByEmail(data.email);
        } else if (role === "doctor") {
            user = await doctorRepository.getDoctorByEmail(data.email);
        } else if (role === "admin") {
            user = await adminRepository.getAdminByEmail(data.email);
        }

        if (!user) {
            throw new HttpError(404, "User not found");
        }
        // compare password
        const validPassword = await bcryptjs.compare(data.password, user.password);
        if(!validPassword){
            throw new HttpError(401, "Invalid credentials");
        }
        
        // update last login timestamp for auditing
        if (role === "patient") {
            await patientRepository.updatePatient(String(user._id), { lastLogin: new Date() });
        } else if (role === "doctor") {
            await doctorRepository.updateDoctor(String(user._id), { lastLogin: new Date() });
        } else if (role === "admin") {
            await adminRepository.updateAdmin(String(user._id), { lastLogin: new Date() });
        }

        // generate jwt
        const payload = {
            id: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: role
        }
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
        return { token, user }
    }

    // Login across all collections when role is not specified
    async loginUserAnyRole(data: LoginUserDTO) {
        let user: any = null;
        let detectedRole: "patient" | "doctor" | "admin" | null = null;

        // Try patient first
        user = await patientRepository.getPatientByEmail(data.email);
        if (user) {
            detectedRole = "patient";
        } else {
            // Try doctor
            user = await doctorRepository.getDoctorByEmail(data.email);
            if (user) {
                detectedRole = "doctor";
            } else {
                // Try admin
                user = await adminRepository.getAdminByEmail(data.email);
                if (user) {
                    detectedRole = "admin";
                }
            }
        }

        if (!user || !detectedRole) {
            throw new HttpError(404, "User not found");
        }

        // compare password
        const validPassword = await bcryptjs.compare(data.password, user.password);
        if (!validPassword) {
            throw new HttpError(401, "Invalid credentials");
        }

        // update last login timestamp for auditing
        if (detectedRole === "patient") {
            await patientRepository.updatePatient(String(user._id), { lastLogin: new Date() });
        } else if (detectedRole === "doctor") {
            await doctorRepository.updateDoctor(String(user._id), { lastLogin: new Date() });
        } else if (detectedRole === "admin") {
            await adminRepository.updateAdmin(String(user._id), { lastLogin: new Date() });
        }

        // generate jwt
        const payload = {
            id: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: detectedRole
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
        return { token, user, role: detectedRole };
    }

    // Get user by ID and role
    async getUserById(id: string, role: "patient" | "doctor" | "admin"){
        let user: any = null;

        if (role === "patient") {
            user = await patientRepository.getPatientById(id);
        } else if (role === "doctor") {
            user = await doctorRepository.getDoctorById(id);
        } else if (role === "admin") {
            user = await adminRepository.getAdminById(id);
        }

        if(!user){
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    // Get user by ID across all roles (used when role is unknown)
    async getUserByIdAnyRole(id: string){
        let user: any = null;

        // Try patient first
        user = await patientRepository.getPatientById(id);
        if(user) {
            user.role = "patient";
            return user;
        }

        // Try doctor
        user = await doctorRepository.getDoctorById(id);
        if(user) {
            user.role = "doctor";
            return user;
        }

        // Try admin
        user = await adminRepository.getAdminById(id);
        if(user) {
            user.role = "admin";
            return user;
        }

        throw new HttpError(404, "User not found");
    }

    // Get all users of a specific role
    async getAllUsers(role: "patient" | "doctor" | "admin", params: { page: number; limit: number }){
        if (role === "patient") {
            return patientRepository.getAllPatients(params);
        } else if (role === "doctor") {
            return doctorRepository.getAllDoctors(params);
        } else if (role === "admin") {
            return adminRepository.getAllAdmins(params);
        }
    }

    // Update user by role
    async updateUser(id: string, role: "patient" | "doctor" | "admin", data: Partial<CreateUserDTO>){
        if (data.password) {
            data.password = await bcryptjs.hash(data.password, 10);
        }
        
        let updated: any = null;
        if (role === "patient") {
            updated = await patientRepository.updatePatient(id, data);
        } else if (role === "doctor") {
            updated = await doctorRepository.updateDoctor(id, data);
        } else if (role === "admin") {
            updated = await adminRepository.updateAdmin(id, data);
        }

        if(!updated){
            throw new HttpError(404, "User not found");
        }
        return updated;
    }

    // Delete user by role
    async deleteUser(id: string, role: "patient" | "doctor" | "admin"){
        let ok: any = null;
        if (role === "patient") {
            ok = await patientRepository.deletePatient(id);
        } else if (role === "doctor") {
            ok = await doctorRepository.deleteDoctor(id);
        } else if (role === "admin") {
            ok = await adminRepository.deleteAdmin(id);
        }

        if(!ok){
            throw new HttpError(404, "User not found");
        }
        return ok;
    }

    // Password reset - need to know role
    async requestPasswordReset(email: string, role: "patient" | "doctor" | "admin") {
        let user: any = null;

        if (role === "patient") {
            user = await patientRepository.getPatientByEmail(email);
        } else if (role === "doctor") {
            user = await doctorRepository.getDoctorByEmail(email);
        } else if (role === "admin") {
            user = await adminRepository.getAdminByEmail(email);
        }

        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        const expires = new Date(Date.now() + 30 * 60 * 1000);

        if (role === "patient") {
            await patientRepository.updatePatient(String(user._id), {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: expires,
            });
        } else if (role === "doctor") {
            await doctorRepository.updateDoctor(String(user._id), {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: expires,
            });
        } else if (role === "admin") {
            await adminRepository.updateAdmin(String(user._id), {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: expires,
            });
        }

        const resetUrl = `${RESET_PASSWORD_URL}?token=${resetToken}`;
        await sendPasswordResetEmail({
            to: user.email,
            name: user.firstName,
            resetUrl,
        });

        return true;
    }

    // Password reset across all collections when role is not specified
    async requestPasswordResetAnyRole(email: string) {
        let user: any = null;
        let detectedRole: "patient" | "doctor" | "admin" | null = null;

        // Try patient first
        user = await patientRepository.getPatientByEmail(email);
        if (user) {
            detectedRole = "patient";
        } else {
            // Try doctor
            user = await doctorRepository.getDoctorByEmail(email);
            if (user) {
                detectedRole = "doctor";
            } else {
                // Try admin
                user = await adminRepository.getAdminByEmail(email);
                if (user) {
                    detectedRole = "admin";
                }
            }
        }

        if (!user || !detectedRole) {
            throw new HttpError(404, "User not found");
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        const expires = new Date(Date.now() + 30 * 60 * 1000);

        if (detectedRole === "patient") {
            await patientRepository.updatePatient(String(user._id), {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: expires,
            });
        } else if (detectedRole === "doctor") {
            await doctorRepository.updateDoctor(String(user._id), {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: expires,
            });
        } else if (detectedRole === "admin") {
            await adminRepository.updateAdmin(String(user._id), {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: expires,
            });
        }

        const resetUrl = `${RESET_PASSWORD_URL}?token=${resetToken}`;
        await sendPasswordResetEmail({
            to: user.email,
            name: user.firstName,
            resetUrl,
        });

        return true;
    }

    // Reset password - need to know role
    async resetPassword(token: string, newPassword: string, role: "patient" | "doctor" | "admin") {
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        
        let user: any = null;
        if (role === "patient") {
            user = await patientRepository.getPatientByResetToken(hashedToken);
        } else if (role === "doctor") {
            user = await doctorRepository.getDoctorByResetToken(hashedToken);
        } else if (role === "admin") {
            user = await adminRepository.getAdminByResetToken(hashedToken);
        }

        if (!user) {
            throw new HttpError(400, "Invalid or expired reset token");
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        
        if (role === "patient") {
            await patientRepository.updatePatient(String(user._id), {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            });
        } else if (role === "doctor") {
            await doctorRepository.updateDoctor(String(user._id), {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            });
        } else if (role === "admin") {
            await adminRepository.updateAdmin(String(user._id), {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            });
        }

        return true;
    }

    // Reset password across all collections when role is not specified
    async resetPasswordAnyRole(token: string, newPassword: string) {
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        
        let user: any = null;
        let detectedRole: "patient" | "doctor" | "admin" | null = null;

        // Try patient first
        user = await patientRepository.getPatientByResetToken(hashedToken);
        if (user) {
            detectedRole = "patient";
        } else {
            // Try doctor
            user = await doctorRepository.getDoctorByResetToken(hashedToken);
            if (user) {
                detectedRole = "doctor";
            } else {
                // Try admin
                user = await adminRepository.getAdminByResetToken(hashedToken);
                if (user) {
                    detectedRole = "admin";
                }
            }
        }

        if (!user || !detectedRole) {
            throw new HttpError(400, "Invalid or expired reset token");
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        
        if (detectedRole === "patient") {
            await patientRepository.updatePatient(String(user._id), {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            });
        } else if (detectedRole === "doctor") {
            await doctorRepository.updateDoctor(String(user._id), {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            });
        } else if (detectedRole === "admin") {
            await adminRepository.updateAdmin(String(user._id), {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            });
        }

        return true;
    }

    // Change password for authenticated user
    async changePassword(userId: string, oldPassword: string, newPassword: string, role: "patient" | "doctor" | "admin") {
        let user: any = null;

        // Get user by role
        if (role === "patient") {
            user = await patientRepository.getPatientById(userId);
        } else if (role === "doctor") {
            user = await doctorRepository.getDoctorById(userId);
        } else if (role === "admin") {
            user = await adminRepository.getAdminById(userId);
        }

        if (!user) {
            throw new HttpError(404, "User not found");
        }

        // Verify old password
        const validPassword = await bcryptjs.compare(oldPassword, user.password);
        if (!validPassword) {
            throw new HttpError(401, "Current password is incorrect");
        }

        // Check if new password is different from old password
        const isSamePassword = await bcryptjs.compare(newPassword, user.password);
        if (isSamePassword) {
            throw new HttpError(400, "New password must be different from current password");
        }

        // Hash new password
        const hashedPassword = await bcryptjs.hash(newPassword, 10);

        // Update password
        if (role === "patient") {
            await patientRepository.updatePatient(userId, { password: hashedPassword });
        } else if (role === "doctor") {
            await doctorRepository.updateDoctor(userId, { password: hashedPassword });
        } else if (role === "admin") {
            await adminRepository.updateAdmin(userId, { password: hashedPassword });
        }

        return true;
    }
}