import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import User from '@/models/User';
import PasswordResetRequest from '@/models/PasswordResetRequest';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, unknown> = {};
    if (status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await PasswordResetRequest.countDocuments(query);
    const requests = await PasswordResetRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const pendingCount = await PasswordResetRequest.countDocuments({
      status: 'pending',
    });

    return NextResponse.json({
      requests,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      pendingCount,
    });
  } catch (error) {
    console.error('Recovery list error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

const resolveSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    const validation = resolveSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { requestId, newPassword } = validation.data;

    const recoveryRequest = await PasswordResetRequest.findById(requestId);
    if (!recoveryRequest) {
      return NextResponse.json(
        { error: 'Recovery request not found' },
        { status: 404 }
      );
    }

    const user = await User.findOne({ email: recoveryRequest.email });
    if (!user) {
      return NextResponse.json(
        { error: 'Linked account no longer exists' },
        { status: 404 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    if (user.status === 'pending') user.status = 'active';
    await user.save();

    recoveryRequest.status = 'resolved';
    recoveryRequest.resolvedAt = new Date();
    recoveryRequest.resolvedBy = session.email;
    await recoveryRequest.save();

    return NextResponse.json({
      success: true,
      message: `Password has been reset for ${user.email}. Share it with them securely.`,
      account: {
        email: user.email,
        name: user.name,
        password: newPassword,
      },
    });
  } catch (error) {
    console.error('Recovery resolve error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { requestId, action } = await request.json();

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    if (action === 'dismiss') {
      const recoveryRequest = await PasswordResetRequest.findByIdAndUpdate(
        requestId,
        {
          status: 'dismissed',
          resolvedAt: new Date(),
          resolvedBy: session.email,
        },
        { new: true }
      );
      if (!recoveryRequest) {
        return NextResponse.json(
          { error: 'Request not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, request: recoveryRequest });
    }

    await PasswordResetRequest.findByIdAndDelete(requestId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Recovery delete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
