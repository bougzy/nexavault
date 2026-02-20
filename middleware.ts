import { NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/', '/login', '/register', '/verify-otp', '/faq', '/about', '/grants'];
const adminPaths = ['/admin'];
const userPaths = ['/dashboard', '/donate'];

interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  name: string;
}

function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Allow public paths and API routes
  if (publicPaths.some(p => pathname === p) || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check auth for protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = decodeToken(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  // Admin route protection
  if (adminPaths.some(p => pathname.startsWith(p)) && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // User route protection
  if (userPaths.some(p => pathname.startsWith(p)) && payload.role === 'admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
