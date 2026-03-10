import { Request, Response, NextFunction } from "express";
import { AuditLogService } from "../services/audit-log.service";

const auditService = new AuditLogService();

export function auditLogMiddleware(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on("finish", async () => {
        if (!req.user?.id) return;
        if (res.statusCode >= 400) return;

        const duration = Date.now() - start;
        const action = `${req.method} ${req.path}`;
        try {
            await auditService.create({
                userId: req.user.id,
                action,
                resourceType: req.baseUrl,
                resourceId: req.params?.id || req.params?.key || "",
                ipAddress: req.ip,
                userAgent: String(req.headers["user-agent"] ?? ""),
                newValue: { durationMs: duration },
            });
        } catch (error) {
            console.error("Audit log failed:", error);
        }
    });

    return next();
}
