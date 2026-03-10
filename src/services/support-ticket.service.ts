import crypto from "crypto";
import { SupportTicketRepository } from "../repositories/support-ticket.repository";
import { TicketResponseRepository } from "../repositories/ticket-response.repository";
import { HttpError } from "../errors/http-error";

const ticketRepo = new SupportTicketRepository();
const responseRepo = new TicketResponseRepository();

function generateTicketNumber(): string {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
    return `TCK-${y}${m}${d}-${rand}`;
}

export class SupportTicketService {
    async createTicket(payload: {
        subject: string;
        description: string;
        priority?: "low" | "medium" | "high" | "urgent";
        category?: string;
        attachments?: Array<{ fileUrl: string; filename: string; mimeType: string; size: number }>;
    }, createdBy: string, role: "patient" | "doctor" | "admin") {
        const ticketNumber = generateTicketNumber();
        return ticketRepo.create({
            createdBy,
            role,
            subject: payload.subject,
            description: payload.description,
            priority: payload.priority ?? "medium",
            category: payload.category ?? "",
            attachments: payload.attachments ?? [],
            status: "open",
            ticketNumber,
            lastResponseAt: new Date(),
        } as any);
    }

    async getTicketById(id: string) {
        const ticket = await ticketRepo.getById(id);
        if (!ticket) throw new HttpError(404, "Ticket not found");
        return ticket;
    }

    async listForUser(userId: string, params: { page: number; limit: number }) {
        return ticketRepo.listByUser(userId, params);
    }

    async listAll(params: { page: number; limit: number; status?: string }) {
        return ticketRepo.listAll(params);
    }

    async getStats() {
        const [total, open, pending, closed] = await Promise.all([
            ticketRepo.listAll({ page: 1, limit: 1 }).then((res) => res.total),
            ticketRepo.listAll({ page: 1, limit: 1, status: "open" }).then((res) => res.total),
            ticketRepo.listAll({ page: 1, limit: 1, status: "pending" }).then((res) => res.total),
            ticketRepo.listAll({ page: 1, limit: 1, status: "closed" }).then((res) => res.total),
        ]);

        return { total, open, pending, closed };
    }

    async addResponse(ticketId: string, userId: string, role: "patient" | "doctor" | "admin", message: string, attachments?: Array<{ fileUrl: string; filename: string; mimeType: string; size: number }>) {
        const ticket = await this.getTicketById(ticketId);
        if (ticket.status === "closed") throw new HttpError(400, "Ticket is closed");

        const response = await responseRepo.create({
            ticketId,
            userId,
            message,
            attachments: attachments ?? [],
        } as any);

        const nextStatus = role === "admin" ? "pending" : "open";
        await ticketRepo.update(ticketId, { status: nextStatus, lastResponseAt: new Date() } as any);
        return response;
    }

    async listResponses(ticketId: string) {
        await this.getTicketById(ticketId);
        return responseRepo.listByTicket(ticketId);
    }

    async assignTicket(ticketId: string, assignedTo: string) {
        const ticket = await ticketRepo.update(ticketId, { assignedTo } as any);
        if (!ticket) throw new HttpError(404, "Ticket not found");
        return ticket;
    }

    async updateStatus(ticketId: string, status: "open" | "pending" | "closed") {
        const ticket = await ticketRepo.update(ticketId, { status } as any);
        if (!ticket) throw new HttpError(404, "Ticket not found");
        return ticket;
    }

    async closeTicket(ticketId: string) {
        return this.updateStatus(ticketId, "closed");
    }
}
