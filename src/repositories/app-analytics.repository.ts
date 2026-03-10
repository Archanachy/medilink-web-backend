import { AppAnalyticsModel, IAppAnalytics } from "../models/app-analytics.model";

export interface IAppAnalyticsRepository {
    create(data: Partial<IAppAnalytics>): Promise<IAppAnalytics>;
    list(params: { page: number; limit: number }): Promise<{ data: IAppAnalytics[]; total: number }>;
}

export class AppAnalyticsRepository implements IAppAnalyticsRepository {
    async create(data: Partial<IAppAnalytics>): Promise<IAppAnalytics> {
        const record = new AppAnalyticsModel(data);
        return record.save();
    }

    async list(params: { page: number; limit: number }): Promise<{ data: IAppAnalytics[]; total: number }> {
        const skip = (params.page - 1) * params.limit;
        const [data, total] = await Promise.all([
            AppAnalyticsModel.find().sort({ created_at: -1 }).skip(skip).limit(params.limit),
            AppAnalyticsModel.countDocuments(),
        ]);
        return { data, total };
    }
}
