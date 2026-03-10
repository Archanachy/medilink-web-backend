import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs";
import { setupChatSocket } from "../chat/chat.socket";

type JwtPayload = {
    id?: string;
    role?: string;
    email?: string;
    username?: string;
};

let io: Server | null = null;

/**
 * Initialize Socket.io instance
 * @param httpServer HTTP server instance from Express
 * @returns Socket.io Server instance
 */
export function initializeSocket(httpServer: HTTPServer): Server {
    io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:3000", "http://localhost:3003", "http://localhost:3005"],
            credentials: true,
        },
        transports: ["websocket", "polling"],
    });

    // Socket authentication middleware
    io.use((socket: Socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
            
            if (!token) {
                console.warn('⚠️ Socket connection attempt without token');
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
            (socket as any).userId = decoded.id;
            (socket as any).user = decoded;
            
            console.log(`✅ Socket authenticated: ${decoded.id}`);
            next();
        } catch (error: any) {
            console.error('❌ Socket auth error:', error.message);
            next(new Error('Authentication error'));
        }
    });

    // Setup new chat socket handlers
    setupChatSocket(io);

    io.on("connection", (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join user to a room based on userId
        socket.on("join_user_room", (userId: string) => {
            socket.join(`user:${userId}`);
            console.log(`User ${userId} joined their room with socket ${socket.id}`);
        });

        // Doctor online status
        socket.on("doctor_online", (doctorId: string) => {
            socket.join(`doctor_${doctorId}`);
            io?.emit("doctor_status_change", { doctorId, status: "online" });
            console.log(`Doctor ${doctorId} is online`);
        });

        socket.on("doctor_offline", (doctorId: string) => {
            socket.leave(`doctor_${doctorId}`);
            io?.emit("doctor_status_change", { doctorId, status: "offline" });
            console.log(`Doctor ${doctorId} is offline`);
        });

        // Appointment notifications
        socket.on("appointment_created", (appointmentData: any) => {
                io?.to(`user:${appointmentData.patientId}`).emit("appointment_notification", {
                type: "created",
                data: appointmentData,
            });
            io?.to(`doctor_${appointmentData.doctorId}`).emit("appointment_notification", {
                type: "created",
                data: appointmentData,
            });
            console.log(`Appointment notification sent for ${appointmentData._id}`);
        });

        socket.on("appointment_updated", (appointmentData: any) => {
            io?.to(`user:${appointmentData.patientId}`).emit("appointment_notification", {
                type: "updated",
                data: appointmentData,
            });
            io?.to(`doctor_${appointmentData.doctorId}`).emit("appointment_notification", {
                type: "updated",
                data: appointmentData,
            });
            console.log(`Appointment update notification sent for ${appointmentData._id}`);
        });

        socket.on("appointment_cancelled", (appointmentData: any) => {
            io?.to(`user:${appointmentData.patientId}`).emit("appointment_notification", {
                type: "cancelled",
                data: appointmentData,
            });
            io?.to(`doctor_${appointmentData.doctorId}`).emit("appointment_notification", {
                type: "cancelled",
                data: appointmentData,
            });
            console.log(`Appointment cancellation notification sent for ${appointmentData._id}`);
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
}

/**
 * Get the Socket.io instance
 */
export function getIO(): Server {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
}

/**
 * Emit an event to a specific user
 */
export function emitToUser(userId: string, event: string, data: any): void {
    if (!io) return;
    io.to(`user:${userId}`).emit(event, data);
}

/**
 * Emit an event to a specific doctor
 */
export function emitToDoctor(doctorId: string, event: string, data: any): void {
    if (!io) return;
    io.to(`doctor_${doctorId}`).emit(event, data);
}

/**
 * Broadcast an event to all connected clients
 */
export function broadcastEvent(event: string, data: any): void {
    if (!io) return;
    io.emit(event, data);
}
