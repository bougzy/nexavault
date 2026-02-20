import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  passwordHash: string;
  otp: string | null;
  otpExpiry: Date | null;
  otpVerified: boolean;
  status: 'pending' | 'active' | 'suspended';
  role: 'user' | 'admin';
  balance: number;
  currency: string;
  language: string;
  theme: 'dark' | 'light';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    passwordHash: { type: String, required: true },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    otpVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'en' },
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
