import { BannerRepository } from "../repositories/banner.repository";
import { FaqRepository } from "../repositories/faq.repository";
import { BannerModel } from "../models/banner.model";
import { HttpError } from "../errors/http-error";

const faqRepo = new FaqRepository();
const bannerRepo = new BannerRepository();

export class ContentService {
    async createFaq(payload: any) {
        return faqRepo.create(payload);
    }

    async listFaqs(params: { page: number; limit: number }) {
        return faqRepo.list(params);
    }

    async updateFaq(id: string, payload: any) {
        const faq = await faqRepo.update(id, payload);
        if (!faq) throw new HttpError(404, "FAQ not found");
        return faq;
    }

    async deleteFaq(id: string) {
        const ok = await faqRepo.delete(id);
        if (!ok) throw new HttpError(404, "FAQ not found");
        return ok;
    }

    async listFaqsPublic() {
        return faqRepo.list({ page: 1, limit: 100, activeOnly: true });
    }

    async createBanner(payload: any) {
        return bannerRepo.create(payload);
    }

    async listBanners(params: { page: number; limit: number }) {
        return bannerRepo.list(params);
    }

    async updateBanner(id: string, payload: any) {
        const banner = await bannerRepo.update(id, payload);
        if (!banner) throw new HttpError(404, "Banner not found");
        return banner;
    }

    async deleteBanner(id: string) {
        const ok = await bannerRepo.delete(id);
        if (!ok) throw new HttpError(404, "Banner not found");
        return ok;
    }

    async listBannersPublic() {
        const now = new Date();
        const data = await BannerModel.find({
            isActive: true,
            $and: [
                { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
                { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
            ],
        }).sort({ displayOrder: 1, created_at: -1 });
        return { data, total: data.length };
    }
}
