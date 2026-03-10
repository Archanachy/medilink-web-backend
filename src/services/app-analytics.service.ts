import { AppAnalyticsRepository } from "../repositories/app-analytics.repository";

const analyticsRepo = new AppAnalyticsRepository();

export class AppAnalyticsService {
    async trackEvent(payload: { eventType: string; userId?: string; metadata?: Record<string, any>; occurredAt?: Date }) {
        return analyticsRepo.create({
            eventType: payload.eventType,
            userId: payload.userId,
            metadata: payload.metadata ?? {},
            occurredAt: payload.occurredAt ?? new Date(),
        } as any);
    }

    async list(params: { page: number; limit: number }) {
        return analyticsRepo.list(params);
    }
}
