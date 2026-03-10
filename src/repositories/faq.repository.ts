import { FaqModel, IFaq } from "../models/faq.model";

export interface IFaqRepository {
    create(data: Partial<IFaq>): Promise<IFaq>;
    getById(id: string): Promise<IFaq | null>;
    list(params?: { page: number; limit: number; activeOnly?: boolean }): Promise<{ data: IFaq[]; total: number }>;
    update(id: string, data: Partial<IFaq>): Promise<IFaq | null>;
    delete(id: string): Promise<boolean>;
}

export class FaqRepository implements IFaqRepository {
    async create(data: Partial<IFaq>): Promise<IFaq> {
        const faq = new FaqModel(data);
        return faq.save();
    }

    async getById(id: string): Promise<IFaq | null> {
        return FaqModel.findById(id);
    }

    async list(params?: { page: number; limit: number; activeOnly?: boolean }): Promise<{ data: IFaq[]; total: number }> {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 25;
        const skip = (page - 1) * limit;
        const filter: Record<string, any> = {};
        if (params?.activeOnly) {
            filter.isActive = true;
        }
        const [data, total] = await Promise.all([
            FaqModel.find(filter).sort({ displayOrder: 1, created_at: -1 }).skip(skip).limit(limit),
            FaqModel.countDocuments(filter),
        ]);
        return { data, total };
    }

    async update(id: string, data: Partial<IFaq>): Promise<IFaq | null> {
        return FaqModel.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await FaqModel.findByIdAndDelete(id);
        return !!result;
    }
}
