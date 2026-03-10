import { DoctorModel, IDoctor } from "../models/doctor.model";

export interface IDoctorRepository {
    createDoctor(data: Partial<IDoctor>): Promise<IDoctor>;
    getDoctorById(id: string): Promise<IDoctor | null>;
    getDoctorByEmail(email: string): Promise<IDoctor | null>;
    getDoctorByUsername(username: string): Promise<IDoctor | null>;
    getDoctorByResetToken(token: string): Promise<IDoctor | null>;
    getDoctorsBySpecialization(specialization: string): Promise<IDoctor[]>;
    getAllDoctors(params: { page: number; limit: number }): Promise<{ data: IDoctor[]; total: number }>;
    updateDoctor(id: string, data: Partial<IDoctor>): Promise<IDoctor | null>;
    deleteDoctor(id: string): Promise<boolean>;
}

export class DoctorRepository implements IDoctorRepository {
    async createDoctor(data: Partial<IDoctor>): Promise<IDoctor> {
        const doctor = new DoctorModel(data);
        return await doctor.save();
    }

    async getDoctorById(id: string): Promise<IDoctor | null> {
        return DoctorModel.findById(id);
    }

    async getDoctorByEmail(email: string): Promise<IDoctor | null> {
        return DoctorModel.findOne({ email }).select("+password");
    }

    async getDoctorByUsername(username: string): Promise<IDoctor | null> {
        return DoctorModel.findOne({ username });
    }

    async getDoctorByResetToken(token: string): Promise<IDoctor | null> {
        return DoctorModel.findOne({ 
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });
    }

    async getDoctorsBySpecialization(specialization: string): Promise<IDoctor[]> {
        return DoctorModel.find({ specialization, isAvailable: true }).sort({ created_at: -1 });
    }

    async getAllDoctors(params: { page: number; limit: number }): Promise<{ data: IDoctor[]; total: number }> {
        const skip = (params.page - 1) * params.limit;
        const [data, total] = await Promise.all([
            DoctorModel.find().sort({ created_at: -1 }).skip(skip).limit(params.limit),
            DoctorModel.countDocuments(),
        ]);
        return { data, total };
    }

    async updateDoctor(id: string, data: Partial<IDoctor>): Promise<IDoctor | null> {
        return DoctorModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteDoctor(id: string): Promise<boolean> {
        const result = await DoctorModel.findByIdAndDelete(id);
        return !!result;
    }
}
