import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET =
  process.env.JWT_SECRET || 'nexavault_super_secret_key_2024_banking_app';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  name: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: '24h' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
