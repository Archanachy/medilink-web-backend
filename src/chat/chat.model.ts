import mongoose, { Schema, Document, Types } from 'mongoose';

interface ChatRoomDocument extends Document {
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

interface ChatMessageDocument extends Document {
  roomId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  timestamp: Date;
  read: boolean;
}

// Chat Room Schema - SIMPLE
const ChatRoomSchema = new Schema({
  participants: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    required: true,
    validate: {
      validator: (v: Types.ObjectId[]) => v.length === 2,
      message: 'Room must have exactly 2 participants'
    }
  },
  lastMessage: { type: Schema.Types.ObjectId, ref: 'ChatMessage' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// CRITICAL: Unique index to prevent duplicate rooms for same 2 participants
ChatRoomSchema.index({ participants: 1 }, { unique: true });

// Chat Message Schema - SIMPLE
const ChatMessageSchema = new Schema({
  roomId: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  read: { type: Boolean, default: false, index: true }
});

ChatMessageSchema.index({ roomId: 1, timestamp: -1 });
ChatMessageSchema.index({ receiverId: 1, read: 1 });

export const ChatRoomModel = mongoose.model<ChatRoomDocument>('ChatRoom', ChatRoomSchema);
export const ChatMessageModel = mongoose.model<ChatMessageDocument>('ChatMessage', ChatMessageSchema);
