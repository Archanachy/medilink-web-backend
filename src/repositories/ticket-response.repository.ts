import { TicketResponseModel, ITicketResponse } from "../models/ticket-response.model";

export interface ITicketResponseRepository {
    create(data: Partial<ITicketResponse>): Promise<ITicketResponse>;
    listByTicket(ticketId: string): Promise<ITicketResponse[]>;
}

export class TicketResponseRepository implements ITicketResponseRepository {
    async create(data: Partial<ITicketResponse>): Promise<ITicketResponse> {
        const response = new TicketResponseModel(data);
        return response.save();
    }

    async listByTicket(ticketId: string): Promise<ITicketResponse[]> {
        return TicketResponseModel.find({ ticketId }).sort({ created_at: 1 });
    }
}
