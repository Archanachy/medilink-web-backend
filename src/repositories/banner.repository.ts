import { BannerModel, IBanner } from "../models/banner.model";

export interface IBannerRepository {
    create(data: Partial<IBanner>): Promise<IBanner>;
    getById(id: string): Promise<IBanner | null>;
    list(params?: { page: number; limit: number; activeOnly?: boolean }): Promise<{ data: IBanner[]; total: number }>;
    update(id: string, data: Partial<IBanner>): Promise<IBanner | null>;
    delete(id: string): Promise<boolean>;
}

export class BannerRepository implements IBannerRepository {
    async create(data: Partial<IBanner>): Promise<IBanner> {
        const banner = new BannerModel(data);
        return banner.save();
    }

    async getById(id: string): Promise<IBanner | null> {
        return BannerModel.findById(id);
    }

    async list(params?: { page: number; limit: number; activeOnly?: boolean }): Promise<{ data: IBanner[]; total: number }> {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 25;
        const skip = (page - 1) * limit;
        const filter: Record<string, any> = {};
        if (params?.activeOnly) {
            filter.isActive = true;
        }
        const [data, total] = await Promise.all([
            BannerModel.find(filter).sort({ displayOrder: 1, created_at: -1 }).skip(skip).limit(limit),
            BannerModel.countDocuments(filter),
        ]);
        return { data, total };
    }

    async update(id: string, data: Partial<IBanner>): Promise<IBanner | null> {
        return BannerModel.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await BannerModel.findByIdAndDelete(id);
        return !!result;
    }
}
