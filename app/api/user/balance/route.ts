import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId).select('balance currency');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const transactions = await Transaction.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      balance: user.balance,
      currency: user.currency,
      transactions,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
