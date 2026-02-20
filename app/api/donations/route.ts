import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import Donation from '@/models/Donation';
import { z } from 'zod';

const donationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  category: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  txHash: z.string().optional(),
  note: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = donationSchema.parse(body);

    const session = await getSession();

    await connectDB();
    const donation = await Donation.create({
      ...data,
      userId: session?.userId || null,
    });

    return NextResponse.json({ success: true, donation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const donations = await Donation.find().sort({ createdAt: -1 }).limit(100);
    const total = await Donation.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return NextResponse.json({
      donations,
      totalAmount: total[0]?.total || 0,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
