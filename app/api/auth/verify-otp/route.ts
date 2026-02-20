import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyOTP } from '@/lib/otp';
import { signToken } from '@/lib/auth';

const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const validation = verifyOTPSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, otp } = validation.data;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json(
        { success: false, error: 'No OTP request found. Please register again.' },
        { status: 400 }
      );
    }

    if (new Date() > user.otpExpiry) {
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please register again.' },
        { status: 400 }
      );
    }

    const isValid = await verifyOTP(otp, user.otp);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    await User.findByIdAndUpdate(user._id, {
      otpVerified: true,
      status: 'active',
      otp: null,
      otpExpiry: null,
    });

    // Auto-login: set JWT cookie so user is signed in immediately
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully',
        user: { name: user.name, email: user.email, role: user.role },
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
