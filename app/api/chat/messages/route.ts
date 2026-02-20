import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import Message from '@/models/Message';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const unread = searchParams.get('unread');
    const targetUserId = searchParams.get('userId'); // admin viewing specific user's chat
    const broadcasts = searchParams.get('broadcasts'); // admin fetching broadcast history

    if (unread === 'true') {
      // Count unread messages for the current user
      const count = await Message.countDocuments({
        $or: [
          { receiverId: session.userId, readBy: { $ne: session.userId } },
          { receiverId: null, readBy: { $ne: session.userId }, senderId: { $ne: session.userId } },
        ],
      });
      return NextResponse.json({ unreadCount: count });
    }

    if (session.role === 'admin') {
      // Admin requesting broadcast history
      if (broadcasts === 'true') {
        const broadcastMsgs = await Message.find({
          senderRole: 'admin',
          receiverId: null,
        })
          .sort({ createdAt: -1 })
          .limit(100);
        return NextResponse.json({ messages: broadcastMsgs });
      }

      if (targetUserId) {
        // Get messages between admin and specific user
        const messages = await Message.find({
          $or: [
            { senderId: targetUserId },
            { receiverId: targetUserId },
          ],
        }).sort({ createdAt: 1 }).limit(200);

        // Mark user messages as read by admin
        await Message.updateMany(
          { senderId: targetUserId, readBy: { $ne: session.userId } },
          { $addToSet: { readBy: session.userId } }
        );

        return NextResponse.json({ messages });
      }

      // Get all unique user conversations for admin
      // Include both user-sent messages AND admin messages directed to specific users
      const adminObjId = new mongoose.Types.ObjectId(session.userId);
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { senderRole: 'user' },
              { senderRole: 'admin', receiverId: { $ne: null } },
            ],
          },
        },
        // Determine the "user" in each conversation
        {
          $addFields: {
            conversationUserId: {
              $cond: [
                { $eq: ['$senderRole', 'user'] },
                '$senderId',
                '$receiverId',
              ],
            },
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$conversationUserId',
            lastMessage: { $first: '$content' },
            lastDate: { $first: '$createdAt' },
            unread: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$senderRole', 'user'] },
                      { $not: { $in: [adminObjId, { $ifNull: ['$readBy', []] }] } },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $sort: { lastDate: -1 } },
      ]);

      // Populate user info
      const User = (await import('@/models/User')).default;
      const userIds = conversations.map(c => c._id);
      const users = await User.find({ _id: { $in: userIds } }).select('name email');
      const userMap = new Map(users.map(u => [u._id.toString(), u]));

      const enriched = conversations.map(c => ({
        userId: c._id,
        user: userMap.get(c._id.toString()) || null,
        lastMessage: c.lastMessage,
        lastDate: c.lastDate,
        unread: c.unread,
      }));

      return NextResponse.json({ conversations: enriched });
    }

    // Regular user: get their own messages
    const sessionId = searchParams.get('sessionId');
    const query: Record<string, unknown> = {
      $or: [
        { senderId: session.userId },
        { receiverId: session.userId },
        { receiverId: null, senderRole: 'admin' },
      ],
    };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const messages = await Message.find(query).sort({ createdAt: 1 }).limit(200);

    // Mark messages as read
    await Message.updateMany(
      {
        $or: [
          { receiverId: session.userId },
          { receiverId: null, senderRole: 'admin' },
        ],
        readBy: { $ne: session.userId },
      },
      { $addToSet: { readBy: session.userId } }
    );

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
