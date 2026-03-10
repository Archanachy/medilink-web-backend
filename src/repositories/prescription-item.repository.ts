import { PrescriptionItemModel, IPrescriptionItem } from "../models/prescription-item.model";

export interface IPrescriptionItemRepository {
    createItems(items: Partial<IPrescriptionItem>[]): Promise<IPrescriptionItem[]>;
    getItemsByPrescription(prescriptionId: string): Promise<IPrescriptionItem[]>;
    deleteByPrescription(prescriptionId: string): Promise<boolean>;
}

export class PrescriptionItemRepository implements IPrescriptionItemRepository {
    async createItems(items: Partial<IPrescriptionItem>[]): Promise<IPrescriptionItem[]> {
        const result = await PrescriptionItemModel.insertMany(items);
        return result as IPrescriptionItem[];
    }

    async getItemsByPrescription(prescriptionId: string): Promise<IPrescriptionItem[]> {
        return PrescriptionItemModel.find({ prescriptionId });
    }

    async deleteByPrescription(prescriptionId: string): Promise<boolean> {
        const result = await PrescriptionItemModel.deleteMany({ prescriptionId });
        return result.deletedCount > 0;
    }
}
