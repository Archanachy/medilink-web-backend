import { Request, Response } from "express";
import z from "zod";
import { CreateChatRoomDTO, SendMessageDTO } from "../dtos/chat.dto";
import { ChatService } from "../chat/chat.service";

const service = new ChatService();

export class ChatController {
    constructor() {
        console.log("[ChatController] instantiated");
    }

    async listRooms(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            console.log("[ChatController] listRooms called");
            console.log("[ChatController] userId from token:", userId);
            console.log("[ChatController] req.user:", req.user);
            
            if (!userId) {
                console.log("[ChatController] No userId - returning 401");
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            console.log("[ChatController] Calling service.listRooms...");
            const rooms = await service.listRooms(userId, req.user?.role);
            console.log("[ChatController] Rooms returned:", rooms?.length || 0, "rooms");
            
            return res.status(200).json({ success: true, data: rooms });
        } catch (error: any) {
            console.error("[ChatController] ERROR in listRooms:", error);
            throw error;
        }
    }

    async getOrCreateRoom(req: Request, res: Response) {
        try {
            console.log("[ChatController] getOrCreateRoom called");
            console.log("[ChatController] req.body:", req.body);
            
            const parsed = CreateChatRoomDTO.safeParse(req.body);
            if (!parsed.success) {
                console.log("[ChatController] DTO validation failed:", parsed.error);
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }

            const userId = req.user?.id;
            console.log("[ChatController] userId:", userId);
            console.log("[ChatController] otherUserId:", parsed.data.otherUserId);
            console.log("[ChatController] req.user:", req.user);
            
            if (!userId) {
                console.log("[ChatController] No userId - returning 401");
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            // Validate otherUserId is not undefined/null/empty
            if (!parsed.data.otherUserId || parsed.data.otherUserId === 'undefined' || parsed.data.otherUserId === 'null') {
                console.log("[ChatController] Invalid otherUserId:", parsed.data.otherUserId);
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid otherUserId. Please provide a valid patient or doctor ID." 
                });
            }

            console.log("[ChatController] Calling service.getOrCreateRoom...");
            const room = await service.getOrCreateRoom(userId, parsed.data.otherUserId);
            console.log("[ChatController] Room created/fetched:", room?._id);
            
            return res.status(200).json({ success: true, data: room });
        } catch (error: any) {
            console.error("[ChatController] ERROR in getOrCreateRoom:", error);
            throw error;
        }
    }

    async listMessages(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
        const limitRaw = parseInt(String(req.query.limit ?? "50"), 10);
        const page = Math.max(Number.isNaN(pageRaw) ? 1 : pageRaw, 1);
        const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 50 : limitRaw, 1), 100);

        const result = await service.listMessages(userId, req.user?.role, req.params.roomId, { page, limit });
        const totalPages = Math.ceil(result.total / limit) || 1;

        return res.status(200).json({
            success: true,
            data: result.data,
            meta: { page, limit, total: result.total, totalPages },
        });
    }

    async sendMessage(req: Request, res: Response) {
        const parsed = SendMessageDTO.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
        }

        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const message = await service.sendMessage(
            userId,
            req.user?.role,
            parsed.data.chatRoomId,
            parsed.data.content,
            parsed.data.messageType
        );
        return res.status(201).json({ success: true, data: message });
    }

    async markMessageRead(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const message = await service.markMessageRead(userId, req.params.id);
        return res.status(200).json({ success: true, data: message });
    }

    async markChatRead(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const result = await service.markRoomRead(userId, req.user?.role, req.params.roomId);
        return res.status(200).json({ success: true, data: result });
    }
}
