import { Request, Response } from "express";
import { AdvancedAnalyticsService } from "../services/advanced-analytics.service";

const service = new AdvancedAnalyticsService();

export class AdminAnalyticsAdvancedController {
    async overview(req: Request, res: Response) {
        const range = service.parseRange(String(req.query.start ?? ""), String(req.query.end ?? ""));
        const data = await service.overview(range);
        return res.status(200).json({ success: true, data });
    }

    async users(req: Request, res: Response) {
        const range = service.parseRange(String(req.query.start ?? ""), String(req.query.end ?? ""));
        const data = await service.users(range);
        return res.status(200).json({ success: true, data });
    }

    async revenue(req: Request, res: Response) {
        const range = service.parseRange(String(req.query.start ?? ""), String(req.query.end ?? ""));
        const data = await service.revenue(range);
        return res.status(200).json({ success: true, data });
    }

    async appointments(req: Request, res: Response) {
        const range = service.parseRange(String(req.query.start ?? ""), String(req.query.end ?? ""));
        const data = await service.appointments(range);
        return res.status(200).json({ success: true, data });
    }

    async doctors(req: Request, res: Response) {
        const range = service.parseRange(String(req.query.start ?? ""), String(req.query.end ?? ""));
        const data = await service.doctors(range);
        return res.status(200).json({ success: true, data });
    }

    async geolocation(_req: Request, res: Response) {
        const data = await service.geolocation();
        return res.status(200).json({ success: true, data });
    }

    async export(req: Request, res: Response) {
        const range = service.parseRange(String(req.query.start ?? ""), String(req.query.end ?? ""));
        const csv = await service.exportCsv(range);
        res.setHeader("Content-Type", "text/csv");
        return res.status(200).send(csv);
    }
}
