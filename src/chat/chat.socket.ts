import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import { ChatService } from './chat.service';
import { SocketChatPayload } from './chat.types';

const chatService = new ChatService();

export function setupChatSocket(io: Server) {
  console.log('🔌 Setting up Chat WebSocket handlers...');

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).user?.id || (socket as any).userId;
    
    if (!userId) {
      console.warn('⚠️ Socket connected without userId');
      return;
    }

    console.log(`✅ User ${userId} connected to chat`);

    // Join user's personal room (for notifications)
    socket.join(`user:${userId}`);

    /**
     * SEND MESSAGE - Main handler
     * Auto-creates room if not exists, saves message, broadcasts to recipient
     */
    socket.on('chat:send', async (payload: SocketChatPayload, callback) => {
      try {
        console.log('📨 Incoming message:', payload);

        // Validate payload
        if (!payload.receiverId || !payload.content) {
          const error = 'Missing receiverId or content';
          console.error('❌', error);
          if (callback) callback({ success: false, error });
          return;
        }

        // Validate ObjectId format
        if (!Types.ObjectId.isValid(payload.receiverId)) {
          const error = `Invalid receiverId format: ${payload.receiverId}`;
          console.error('❌', error);
          if (callback) callback({ success: false, error });
          return;
        }

        // Auto-create or get room
        const room = await chatService.getOrCreateRoom(userId, payload.receiverId);

        // Save message to database
        const message = await chatService.saveMessage({
          roomId: room._id!.toString(),
          senderId: userId,
          receiverId: payload.receiverId,
          content: payload.content
        });

        // Broadcast to BOTH users (sender and receiver)
        const broadcastPayload = {
          _id: message._id,
          roomId: room._id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.content,
          timestamp: message.timestamp,
          read: message.read
        };

        // Send to receiver
        io.to(`user:${payload.receiverId}`).emit('chat:message', broadcastPayload);
        
        // Confirm to sender
        socket.emit('chat:message', broadcastPayload);

        console.log(`✅ Message sent from ${userId} to ${payload.receiverId}`);

        if (callback) callback({ success: true, message: broadcastPayload });
      } catch (error: any) {
        console.error('❌ Error sending message:', error.message);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    /**
     * GET ROOM HISTORY
     */
    socket.on('chat:getHistory', async (payload: { receiverId: string }, callback) => {
      try {
        // Validate receiverId
        if (!payload.receiverId) {
          const error = 'Missing receiverId';
          console.error('❌', error);
          if (callback) callback({ success: false, error });
          return;
        }

        if (!Types.ObjectId.isValid(payload.receiverId)) {
          const error = `Invalid receiverId format: ${payload.receiverId}`;
          console.error('❌', error);
          if (callback) callback({ success: false, error });
          return;
        }

        const room = await chatService.getOrCreateRoom(userId, payload.receiverId);
        const messages = await chatService.getMessages(room._id!.toString());
        
        if (callback) callback({ success: true, messages, roomId: room._id });
      } catch (error: any) {
        console.error('❌ Error fetching history:', error.message);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    /**
     * GET USER'S ROOMS LIST
     */
    socket.on('chat:getRooms', async (payload: {}, callback) => {
      try {
        const rooms = await chatService.getUserRooms(userId);
        if (callback) callback({ success: true, rooms });
      } catch (error: any) {
        console.error('❌ Error fetching rooms:', error.message);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    /**
     * MARK AS READ
     */
    socket.on('chat:markRead', async (payload: { roomId: string }, callback) => {
      try {
        const count = await chatService.markAsRead(payload.roomId, userId);
        if (callback) callback({ success: true, count });
      } catch (error: any) {
        console.error('❌ Error marking as read:', error.message);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    /**
     * TYPING INDICATOR (Optional)
     */
    socket.on('chat:typing', (payload: { receiverId: string, isTyping: boolean }) => {
      io.to(`user:${payload.receiverId}`).emit('chat:typing', {
        senderId: userId,
        isTyping: payload.isTyping
      });
    });

    socket.on('disconnect', () => {
      console.log(`❌ User ${userId} disconnected from chat`);
    });
  });
}
