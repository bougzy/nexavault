import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import PasswordResetRequest from '@/models/PasswordResetRequest';

const requestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  reason: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const email = validation.data.email.toLowerCase();
    const reason = (validation.data.reason || '').trim();

    const user = await User.findOne({ email });

    // Respond the same way whether or not the account exists, so attackers
    // can't enumerate accounts. We still only create a request row when the
    // user actually exists.
    if (user) {
      const existing = await PasswordResetRequest.findOne({
        email,
        status: 'pending',
      });

      if (existing) {
        existing.reason = reason || existing.reason;
        existing.name = user.name;
        existing.phone = user.phone;
        await existing.save();
      } else {
        await PasswordResetRequest.create({
          email,
          name: user.name,
          phone: user.phone,
          reason,
          status: 'pending',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message:
        'Your password recovery request has been submitted. An administrator will review it and contact you with your new password.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
