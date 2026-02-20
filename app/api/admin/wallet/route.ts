import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import Settings from '@/models/Settings';

export async function GET() {
  try {
    await connectDB();
    const settings = await Settings.findOne();
    return NextResponse.json({
      walletAddress: settings?.donationWalletAddress || '',
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { walletAddress } = await request.json();
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    await connectDB();
    let settings = await Settings.findOne();
    if (settings) {
      settings.donationWalletAddress = walletAddress;
      settings.updatedBy = session.userId;
      await settings.save();
    } else {
      settings = await Settings.create({
        donationWalletAddress: walletAddress,
        updatedBy: session.userId,
      });
    }

    return NextResponse.json({ success: true, walletAddress });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
