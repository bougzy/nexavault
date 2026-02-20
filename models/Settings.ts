import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  donationWalletAddress: string;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    donationWalletAddress: { type: String, default: '' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
