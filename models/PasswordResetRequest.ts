import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordResetRequest extends Document {
  email: string;
  name: string;
  phone: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedAt: Date | null;
  resolvedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordResetRequestSchema = new Schema<IPasswordResetRequest>(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    reason: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.PasswordResetRequest ||
  mongoose.model<IPasswordResetRequest>('PasswordResetRequest', PasswordResetRequestSchema);
