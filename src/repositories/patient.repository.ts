import { PatientModel, IPatient } from "../models/patient.model";

export interface IPatientRepository {
    createPatient(data: Partial<IPatient>): Promise<IPatient>;
    getPatientById(id: string): Promise<IPatient | null>;
    getPatientByUserId(userId: string): Promise<IPatient | null>;
    getPatientByEmail(email: string): Promise<IPatient | null>;
    getPatientByUsername(username: string): Promise<IPatient | null>;
    getPatientByResetToken(token: string): Promise<IPatient | null>;
    getAllPatients(params: { page: number; limit: number }): Promise<{ data: IPatient[]; total: number }>;
    updatePatient(id: string, data: Partial<IPatient>): Promise<IPatient | null>;
    deletePatient(id: string): Promise<boolean>;
}

export class PatientRepository implements IPatientRepository {
    async createPatient(data: Partial<IPatient>): Promise<IPatient> {
        const patient = new PatientModel(data);
        return patient.save();
    }

    async getPatientById(id: string): Promise<IPatient | null> {
        return PatientModel.findById(id);
    }

    async getPatientByUserId(userId: string): Promise<IPatient | null> {
        return PatientModel.findOne({ userId });
    }

    async getPatientByEmail(email: string): Promise<IPatient | null> {
        return PatientModel.findOne({ email }).select("+password");
    }

    async getPatientByUsername(username: string): Promise<IPatient | null> {
        return PatientModel.findOne({ username });
    }

    async getPatientByResetToken(token: string): Promise<IPatient | null> {
        return PatientModel.findOne({ 
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });
    }

    async getAllPatients(params: { page: number; limit: number }): Promise<{ data: IPatient[]; total: number }> {
        const skip = (params.page - 1) * params.limit;
        const [data, total] = await Promise.all([
            PatientModel.find().sort({ created_at: -1 }).skip(skip).limit(params.limit),
            PatientModel.countDocuments(),
        ]);
        return { data, total };
    }

    async updatePatient(id: string, data: Partial<IPatient>): Promise<IPatient | null> {
        return PatientModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deletePatient(id: string): Promise<boolean> {
        const result = await PatientModel.findByIdAndDelete(id);
        return !!result;
    }
}