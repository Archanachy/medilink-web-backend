import { SupportTicketModel, ISupportTicket } from "../models/support-ticket.model";

export interface ISupportTicketRepository {
    create(data: Partial<ISupportTicket>): Promise<ISupportTicket>;
    getById(id: string): Promise<ISupportTicket | null>;
    listByUser(userId: string, params: { page: number; limit: number }): Promise<{ data: ISupportTicket[]; total: number }>;
    listAll(params: { page: number; limit: number; status?: string }): Promise<{ data: ISupportTicket[]; total: number }>;
    update(id: string, data: Partial<ISupportTicket>): Promise<ISupportTicket | null>;
}

export class SupportTicketRepository implements ISupportTicketRepository {
    async create(data: Partial<ISupportTicket>): Promise<ISupportTicket> {
        const ticket = new SupportTicketModel(data);
        return ticket.save();
    }

    async getById(id: string): Promise<ISupportTicket | null> {
        return SupportTicketModel.findById(id);
    }

    async listByUser(userId: string, params: { page: number; limit: number }): Promise<{ data: ISupportTicket[]; total: number }> {
        const skip = (params.page - 1) * params.limit;
        const [data, total] = await Promise.all([
            SupportTicketModel.find({ createdBy: userId }).sort({ created_at: -1 }).skip(skip).limit(params.limit),
            SupportTicketModel.countDocuments({ createdBy: userId }),
        ]);
        return { data, total };
    }

    async listAll(params: { page: number; limit: number; status?: string }): Promise<{ data: ISupportTicket[]; total: number }> {
        const skip = (params.page - 1) * params.limit;
        const filter: Record<string, any> = {};
        if (params.status) {
            filter.status = params.status;
        }
        const [data, total] = await Promise.all([
            SupportTicketModel.find(filter).sort({ created_at: -1 }).skip(skip).limit(params.limit),
            SupportTicketModel.countDocuments(filter),
        ]);
        return { data, total };
    }

    async update(id: string, data: Partial<ISupportTicket>): Promise<ISupportTicket | null> {
        return SupportTicketModel.findByIdAndUpdate(id, data, { new: true });
    }
}
