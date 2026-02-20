import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexavault';

async function seed() {
  await mongoose.connect(MONGODB_URI);

  const UserModel = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    address: String,
    passwordHash: String,
    otp: String,
    otpExpiry: Date,
    otpVerified: Boolean,
    status: String,
    role: String,
    balance: Number,
    currency: String,
    language: String,
    theme: String,
  }, { timestamps: true }));

  const SettingsModel = mongoose.models.Settings || mongoose.model('Settings', new mongoose.Schema({
    donationWalletAddress: String,
    updatedBy: mongoose.Schema.Types.ObjectId,
  }, { timestamps: true }));

  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@nexavault.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'Admin@123456';

  const existing = await UserModel.findOne({ email: adminEmail });
  if (existing) {
    console.log('Admin user already exists.');
  } else {
    const hash = await bcrypt.hash(adminPassword, 12);
    const admin = await UserModel.create({
      name: 'System Administrator',
      email: adminEmail,
      phone: '+1-000-000-0000',
      address: 'NexaVault HQ',
      passwordHash: hash,
      otpVerified: true,
      status: 'active',
      role: 'admin',
      balance: 0,
      currency: 'USD',
      language: 'en',
      theme: 'dark',
    });
    console.log('Admin user created:', admin.email);

    await SettingsModel.create({
      donationWalletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38',
      updatedBy: admin._id,
    });
    console.log('Default settings created.');
  }

  await mongoose.disconnect();
  console.log('Seed complete.');
}

seed().catch(console.error);
