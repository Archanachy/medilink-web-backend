import { DoctorDocumentModel, IDoctorDocument } from "../models/doctor-document.model";

export interface IDoctorDocumentRepository {
    createDocument(data: Partial<IDoctorDocument>): Promise<IDoctorDocument>;
    getDocumentById(id: string): Promise<IDoctorDocument | null>;
    getDocumentsByDoctor(doctorId: string, params?: { page: number; limit: number }): Promise<{ data: IDoctorDocument[]; total: number }>;
    updateDocument(id: string, data: Partial<IDoctorDocument>): Promise<IDoctorDocument | null>;
    deleteDocument(id: string): Promise<boolean>;
}

export class DoctorDocumentRepository implements IDoctorDocumentRepository {
    async createDocument(data: Partial<IDoctorDocument>): Promise<IDoctorDocument> {
        const document = new DoctorDocumentModel(data);
        return document.save();
    }

    async getDocumentById(id: string): Promise<IDoctorDocument | null> {
        return DoctorDocumentModel.findById(id);
    }

    async getDocumentsByDoctor(
        doctorId: string,
        params?: { page: number; limit: number }
    ): Promise<{ data: IDoctorDocument[]; total: number }> {
        const skip = params ? (params.page - 1) * params.limit : 0;
        const limit = params ? params.limit : 10;
        const [data, total] = await Promise.all([
            DoctorDocumentModel.find({ doctorId }).sort({ created_at: -1 }).skip(skip).limit(limit),
            DoctorDocumentModel.countDocuments({ doctorId }),
        ]);
        return { data, total };
    }

    async updateDocument(id: string, data: Partial<IDoctorDocument>): Promise<IDoctorDocument | null> {
        return DoctorDocumentModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteDocument(id: string): Promise<boolean> {
        const result = await DoctorDocumentModel.findByIdAndDelete(id);
        return !!result;
    }
}
