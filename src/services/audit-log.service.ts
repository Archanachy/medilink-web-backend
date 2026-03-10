import { AuditLogRepository } from "../repositories/audit-log.repository";

const auditRepo = new AuditLogRepository();

export class AuditLogService {
    async create(payload: {
        userId?: string;
        action: string;
        resourceType?: string;
        resourceId?: string;
        oldValue?: any;
        newValue?: any;
        ipAddress?: string;
        userAgent?: string;
    }) {
        return auditRepo.create(payload as any);
    }

    async list(params: { page: number; limit: number }) {
        return auditRepo.list(params);
    }

    async listByUser(userId: string, params: { page: number; limit: number }) {
        return auditRepo.listByUser(userId, params);
    }

    async exportCsv(params: { page: number; limit: number }) {
        const { data } = await auditRepo.list(params);
        const headers = ["id", "userId", "action", "resourceType", "resourceId", "ipAddress", "userAgent", "createdAt"];
        const lines = [headers.join(",")];
        data.forEach((item) => {
            const row = [
                String(item._id),
                item.userId ? String(item.userId) : "",
                item.action ?? "",
                item.resourceType ?? "",
                item.resourceId ?? "",
                item.ipAddress ?? "",
                item.userAgent ?? "",
                item.created_at ? item.created_at.toISOString() : "",
            ];
            lines.push(row.map((cell) => `"${String(cell).replace(/"/g, "\"\"")}"`).join(","));
        });
        return lines.join("\n");
    }
}
