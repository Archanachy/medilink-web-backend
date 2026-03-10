import { ChatRoomModel, ChatMessageModel } from './chat.model';
import { SocketChatPayload } from './chat.types';
import { Types } from 'mongoose';

export class ChatService {
  /**
   * Find or create chat room between two users
   * AUTOMATIC - No validation, just create if not exists
   */
  async getOrCreateRoom(userId1: string, userId2: string) {
    if (userId1 === userId2) {
      throw new Error('Cannot chat with yourself');
    }

    // Validate ObjectIds
    if (!Types.ObjectId.isValid(userId1)) {
      throw new Error(`Invalid userId1: ${userId1}`);
    }
    if (!Types.ObjectId.isValid(userId2)) {
      throw new Error(`Invalid userId2: ${userId2}`);
    }

    // Convert to ObjectIds and sort IDs to ensure consistent room lookup
    const participants = [
      new Types.ObjectId(userId1),
      new Types.ObjectId(userId2)
    ].sort((a, b) => a.toString().localeCompare(b.toString()));

    // Try to find existing room
    let room = await ChatRoomModel.findOne({
      participants: { $all: participants, $size: 2 }
    });

    // Create if not exists
    if (!room) {
      try {
        room = await ChatRoomModel.create({ participants });
        console.log(`✅ Created new room: ${room._id} for [${userId1}, ${userId2}]`);
      } catch (error: any) {
        // Handle race condition: if room was just created by another request
        if (error.code === 11000) {
          console.log(`⚠️ Duplicate room detected, fetching existing room`);
          room = await ChatRoomModel.findOne({
            participants: { $all: participants, $size: 2 }
          });
          if (!room) throw new Error('Failed to find or create room');
        } else {
          throw error;
        }
      }
    } else {
      console.log(`✅ Found existing room: ${room._id}`);
    }

    return room;
  }

  /**
   * Save message to database
   */
  async saveMessage(payload: SocketChatPayload & { roomId: string }) {
    // Validate ObjectIds
    if (!Types.ObjectId.isValid(payload.roomId)) {
      throw new Error(`Invalid roomId: ${payload.roomId}`);
    }
    if (!Types.ObjectId.isValid(payload.senderId)) {
      throw new Error(`Invalid senderId: ${payload.senderId}`);
    }
    if (!Types.ObjectId.isValid(payload.receiverId)) {
      throw new Error(`Invalid receiverId: ${payload.receiverId}`);
    }

    const message = await ChatMessageModel.create({
      roomId: new Types.ObjectId(payload.roomId),
      senderId: new Types.ObjectId(payload.senderId),
      receiverId: new Types.ObjectId(payload.receiverId),
      content: payload.content,
      timestamp: new Date(),
      read: false
    });

    // Update room's last message
    await ChatRoomModel.findByIdAndUpdate(payload.roomId, {
      lastMessage: message._id,
      updated_at: new Date()
    });

    console.log(`✅ Message saved: ${message._id}`);
    return message;
  }

  /**
   * Get messages for a room
   */
  async getMessages(roomId: string, limit: number = 50) {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new Error(`Invalid roomId: ${roomId}`);
    }

    const messages = await ChatMessageModel
      .find({ roomId: new Types.ObjectId(roomId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return messages.reverse(); // Return oldest first
  }

  /**
   * Get all rooms for a user
   */
  async getUserRooms(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error(`Invalid userId: ${userId}`);
    }

    const rooms = await ChatRoomModel
      .find({ participants: new Types.ObjectId(userId) })
      .sort({ updated_at: -1 })
      .populate('lastMessage')
      .lean();

    return rooms;
  }

  /**
   * Mark messages as read
   */
  async markAsRead(roomId: string, userId: string) {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new Error(`Invalid roomId: ${roomId}`);
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error(`Invalid userId: ${userId}`);
    }

    const result = await ChatMessageModel.updateMany(
      { roomId: new Types.ObjectId(roomId), receiverId: new Types.ObjectId(userId), read: false },
      { read: true }
    );

    console.log(`✅ Marked ${result.modifiedCount} messages as read`);
    return result.modifiedCount;
  }
}
