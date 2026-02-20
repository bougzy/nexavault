import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId | null;
  senderRole: 'user' | 'admin';
  content: string;
  readBy: mongoose.Types.ObjectId[];
  sessionId: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    senderRole: { type: String, enum: ['user', 'admin'], required: true },
    content: { type: String, required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    sessionId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
