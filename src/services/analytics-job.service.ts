import { BackgroundJobService } from "./background-job.service";
import { AppAnalyticsService } from "./app-analytics.service";

const jobService = new BackgroundJobService();
const analyticsService = new AppAnalyticsService();

jobService.register("analytics:track", async (payload: { eventType: string; userId?: string; metadata?: Record<string, any> }) => {
    await analyticsService.trackEvent({
        eventType: payload.eventType,
        userId: payload.userId,
        metadata: payload.metadata,
        occurredAt: new Date(),
    });
});

export function enqueueAnalyticsEvent(payload: { eventType: string; userId?: string; metadata?: Record<string, any> }) {
    return jobService.enqueue("analytics:track", payload);
}
