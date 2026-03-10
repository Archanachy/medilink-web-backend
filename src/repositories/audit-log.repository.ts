import { AuditLogModel, IAuditLog } from "../models/audit-log.model";

export interface IAuditLogRepository {
    create(data: Partial<IAuditLog>): Promise<IAuditLog>;
    list(params: { page: number; limit: number }): Promise<{ data: IAuditLog[]; total: number }>;
    listByUser(userId: string, params: { page: number; limit: number }): Promise<{ data: IAuditLog[]; total: number }>;
}

export class AuditLogRepository implements IAuditLogRepository {
    async create(data: Partial<IAuditLog>): Promise<IAuditLog> {
        const log = new AuditLogModel(data);
        return log.save();
    }

    async list(params: { page: number; limit: number }): Promise<{ data: IAuditLog[]; total: number }> {
        const skip = (params.page - 1) * params.limit;
        const [data, total] = await Promise.all([
            AuditLogModel.find().sort({ created_at: -1 }).skip(skip).limit(params.limit),
            AuditLogModel.countDocuments(),
        ]);
        return { data, total };
    }

    async listByUser(userId: string, params: { page: number; limit: number }): Promise<{ data: IAuditLog[]; total: number }> {
        const skip = (params.page - 1) * params.limit;
        const [data, total] = await Promise.all([
            AuditLogModel.find({ userId }).sort({ created_at: -1 }).skip(skip).limit(params.limit),
            AuditLogModel.countDocuments({ userId }),
        ]);
        return { data, total };
    }
}
