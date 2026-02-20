import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import Message from '@/models/Message';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, receiverId, sessionId } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }

    await connectDB();

    const message = await Message.create({
      senderId: session.userId,
      receiverId: session.role === 'admin' ? receiverId : null,
      senderRole: session.role,
      content: content.trim(),
      readBy: [session.userId],
      sessionId: sessionId || crypto.randomUUID(),
    });

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
