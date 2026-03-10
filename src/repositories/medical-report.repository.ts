import { MedicalReportModel, IMedicalReport } from "../models/medical-report.model";

export interface IMedicalReportRepository {
    createReport(data: Partial<IMedicalReport>): Promise<IMedicalReport>;
    getReportById(id: string): Promise<IMedicalReport | null>;
    getReportsByPatient(patientId: string, params?: { page: number; limit: number }): Promise<{ data: IMedicalReport[]; total: number }>;
    getReportsSharedWithDoctor(doctorId: string, params?: { page: number; limit: number }): Promise<{ data: IMedicalReport[]; total: number }>;
    getReportsForDoctorAndPatient(doctorId: string, patientId: string, params?: { page: number; limit: number }): Promise<{ data: IMedicalReport[]; total: number }>;
    updateReport(id: string, data: Partial<IMedicalReport>): Promise<IMedicalReport | null>;
    deleteReport(id: string): Promise<boolean>;
}

export class MedicalReportRepository implements IMedicalReportRepository {
    async createReport(data: Partial<IMedicalReport>): Promise<IMedicalReport> {
        const report = new MedicalReportModel(data);
        return report.save();
    }

    async getReportById(id: string): Promise<IMedicalReport | null> {
        return MedicalReportModel.findById(id);
    }

    async getReportsByPatient(
        patientId: string,
        params?: { page: number; limit: number }
    ): Promise<{ data: IMedicalReport[]; total: number }> {
        const skip = params ? (params.page - 1) * params.limit : 0;
        const limit = params ? params.limit : 10;
        const [data, total] = await Promise.all([
            MedicalReportModel.find({ patientId }).sort({ created_at: -1 }).skip(skip).limit(limit),
            MedicalReportModel.countDocuments({ patientId }),
        ]);
        return { data, total };
    }

    async getReportsSharedWithDoctor(
        doctorId: string,
        params?: { page: number; limit: number }
    ): Promise<{ data: IMedicalReport[]; total: number }> {
        const skip = params ? (params.page - 1) * params.limit : 0;
        const limit = params ? params.limit : 10;
        const [data, total] = await Promise.all([
            MedicalReportModel.find({ sharedWithDoctors: doctorId }).sort({ created_at: -1 }).skip(skip).limit(limit),
            MedicalReportModel.countDocuments({ sharedWithDoctors: doctorId }),
        ]);
        return { data, total };
    }

    async getReportsForDoctorAndPatient(
        doctorId: string,
        patientId: string,
        params?: { page: number; limit: number }
    ): Promise<{ data: IMedicalReport[]; total: number }> {
        const skip = params ? (params.page - 1) * params.limit : 0;
        const limit = params ? params.limit : 10;
        const query = { patientId, sharedWithDoctors: doctorId };
        const [data, total] = await Promise.all([
            MedicalReportModel.find(query).sort({ created_at: -1 }).skip(skip).limit(limit),
            MedicalReportModel.countDocuments(query),
        ]);
        return { data, total };
    }

    async updateReport(id: string, data: Partial<IMedicalReport>): Promise<IMedicalReport | null> {
        return MedicalReportModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteReport(id: string): Promise<boolean> {
        const result = await MedicalReportModel.findByIdAndDelete(id);
        return !!result;
    }
}
