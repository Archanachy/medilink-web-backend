import { IAdmin } from "../models/admin.model";
import { AdminModel } from "../models/admin.model";

export interface IAdminRepository {
    createAdmin(data: Partial<IAdmin>): Promise<IAdmin>;
    getAdminById(id: string): Promise<IAdmin | null>;
    getAdminByEmail(email: string): Promise<IAdmin | null>;
    getAdminByUsername(username: string): Promise<IAdmin | null>;
    getAdminByResetToken(token: string): Promise<IAdmin | null>;
    getAllAdmins(params: { page: number; limit: number }): Promise<{ data: IAdmin[]; total: number }>;
    updateAdmin(id: string, data: Partial<IAdmin>): Promise<IAdmin | null>;
    deleteAdmin(id: string): Promise<boolean>;
}

export class AdminRepository implements IAdminRepository {
    async createAdmin(data: Partial<IAdmin>): Promise<IAdmin> {
        return AdminModel.create(data);
    }

    async getAdminById(id: string): Promise<IAdmin | null> {
        return AdminModel.findById(id).select("+password");
    }

    async getAdminByEmail(email: string): Promise<IAdmin | null> {
        return AdminModel.findOne({ email }).select("+password");
    }

    async getAdminByUsername(username: string): Promise<IAdmin | null> {
        return AdminModel.findOne({ username }).select("+password");
    }

    async getAdminByResetToken(token: string): Promise<IAdmin | null> {
        return AdminModel.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } }).select("+password");
    }

    async getAllAdmins(params: { page: number; limit: number }): Promise<{ data: IAdmin[]; total: number }> {
        const skip = (params.page - 1) * params.limit;
        const total = await AdminModel.countDocuments();
        const data = await AdminModel.find()
            .select("+password")
            .limit(params.limit)
            .skip(skip)
            .sort({ createdAt: -1 });
        return { data, total };
    }

    async updateAdmin(id: string, data: Partial<IAdmin>): Promise<IAdmin | null> {
        return AdminModel.findByIdAndUpdate(id, data, { new: true }).select("+password");
    }

    async deleteAdmin(id: string): Promise<boolean> {
        const result = await AdminModel.findByIdAndDelete(id);
        return !!result;
    }
}

export const adminRepository = new AdminRepository();