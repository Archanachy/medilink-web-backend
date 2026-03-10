import { PrescriptionModel, IPrescription } from "../models/prescription.model";

export interface IPrescriptionRepository {
    createPrescription(data: Partial<IPrescription>): Promise<IPrescription>;
    getPrescriptionById(id: string): Promise<IPrescription | null>;
    getPrescriptionsByDoctor(doctorId: string, params?: { page: number; limit: number }): Promise<{ data: IPrescription[]; total: number }>;
    getPrescriptionsByPatient(patientId: string, params?: { page: number; limit: number }): Promise<{ data: IPrescription[]; total: number }>;
    updatePrescription(id: string, data: Partial<IPrescription>): Promise<IPrescription | null>;
    deletePrescription(id: string): Promise<boolean>;
}

export class PrescriptionRepository implements IPrescriptionRepository {
    async createPrescription(data: Partial<IPrescription>): Promise<IPrescription> {
        const prescription = new PrescriptionModel(data);
        return prescription.save();
    }

    async getPrescriptionById(id: string): Promise<IPrescription | null> {
        return PrescriptionModel.findById(id);
    }

    async getPrescriptionsByDoctor(
        doctorId: string,
        params?: { page: number; limit: number }
    ): Promise<{ data: IPrescription[]; total: number }> {
        const skip = params ? (params.page - 1) * params.limit : 0;
        const limit = params ? params.limit : 10;
        const [data, total] = await Promise.all([
            PrescriptionModel.find({ doctorId }).sort({ created_at: -1 }).skip(skip).limit(limit),
            PrescriptionModel.countDocuments({ doctorId }),
        ]);
        return { data, total };
    }

    async getPrescriptionsByPatient(
        patientId: string,
        params?: { page: number; limit: number }
    ): Promise<{ data: IPrescription[]; total: number }> {
        const skip = params ? (params.page - 1) * params.limit : 0;
        const limit = params ? params.limit : 10;
        const [data, total] = await Promise.all([
            PrescriptionModel.find({ patientId }).sort({ created_at: -1 }).skip(skip).limit(limit),
            PrescriptionModel.countDocuments({ patientId }),
        ]);
        return { data, total };
    }

    async updatePrescription(id: string, data: Partial<IPrescription>): Promise<IPrescription | null> {
        return PrescriptionModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deletePrescription(id: string): Promise<boolean> {
        const result = await PrescriptionModel.findByIdAndDelete(id);
        return !!result;
    }
}
