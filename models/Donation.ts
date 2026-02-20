import mongoose, { Schema, Document } from 'mongoose';

export interface IDonation extends Document {
  userId: mongoose.Types.ObjectId | null;
  name: string;
  email: string;
  category: string;
  amount: number;
  currency: string;
  txHash: string | null;
  note: string | null;
  createdAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true },
    email: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    txHash: { type: String, default: null },
    note: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema);
