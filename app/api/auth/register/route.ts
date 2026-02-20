import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { generateOTP, hashOTP, getOTPExpiry } from '@/lib/otp';

const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().min(1, 'Address is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, phone, address, password } = validation.data;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const plainOTP = generateOTP();
    const hashedOTP = await hashOTP(plainOTP);
    const otpExpiry = getOTPExpiry();

    await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      address,
      passwordHash,
      otp: hashedOTP,
      otpExpiry,
      otpVerified: false,
      status: 'pending',
      role: 'user',
      balance: 0,
    });

    // Demo mode: returning OTP in response for testing purposes
    return NextResponse.json(
      { success: true, otp: plainOTP, email: email.toLowerCase() },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
