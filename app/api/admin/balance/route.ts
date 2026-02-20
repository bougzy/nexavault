import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, operation, amount, currency, description, senderName } = await request.json();

    if (!userId || !operation || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const balanceBefore = user.balance;
    let balanceAfter: number;
    let type: 'credit' | 'debit' | 'adjustment';

    switch (operation) {
      case 'add':
        balanceAfter = balanceBefore + Math.abs(amount);
        type = 'credit';
        break;
      case 'subtract':
        balanceAfter = balanceBefore - Math.abs(amount);
        type = 'debit';
        break;
      case 'set':
        balanceAfter = amount;
        type = 'adjustment';
        break;
      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    // Update user balance and optionally currency
    const updates: Record<string, unknown> = { balance: balanceAfter };
    if (currency) updates.currency = currency;

    await User.findByIdAndUpdate(userId, updates);

    // Create transaction record
    await Transaction.create({
      userId,
      type,
      amount: Math.abs(operation === 'set' ? balanceAfter - balanceBefore : amount),
      balanceBefore,
      balanceAfter,
      description: description || (operation === 'add' ? 'Funds received' : operation === 'subtract' ? 'Funds deducted' : 'Balance adjustment'),
      senderName: senderName || '',
      createdByAdmin: session.userId,
    });

    return NextResponse.json({
      success: true,
      balance: balanceAfter,
      transaction: { type, amount, balanceBefore, balanceAfter },
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
