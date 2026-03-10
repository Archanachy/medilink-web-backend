import { Types } from 'mongoose';

export interface ChatMessage {
  _id?: Types.ObjectId;
  roomId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface ChatRoom {
  _id?: Types.ObjectId;
  participants: Types.ObjectId[]; // Array of exactly 2 user IDs
  lastMessage?: Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

export interface SocketChatPayload {
  roomId?: string;
  senderId: string;
  receiverId: string;
  content: string;
}
