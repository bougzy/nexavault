'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Megaphone,
  Clock,
  Loader2,
  MessageSquare,
  Users,
  CheckCircle2,
  Search,
  ArrowLeft,
  User as UserIcon,
  Bot,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── types ─── */
interface ConversationItem {
  userId: string;
  user: { name: string; email: string } | null;
  lastMessage: string;
  lastDate: string;
  unread: number;
}

interface ChatMsg {
  _id: string;
  senderId: string;
  receiverId: string | null;
  senderRole: 'user' | 'admin' | 'bot';
  content: string;
  createdAt: string;
}

/* ═══════════════════════════════════════════
   ADMIN MESSAGES PAGE — Conversations + Broadcast
   ═══════════════════════════════════════════ */
export default function AdminMessagesPage() {
  const [tab, setTab] = useState<'conversations' | 'broadcast'>('conversations');

  // ── Conversations state ──
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [convoLoading, setConvoLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<{ name: string; email: string } | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const convoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Broadcast state ──
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastHistory, setBroadcastHistory] = useState<ChatMsg[]>([]);
  const [broadcastLoading, setBroadcastLoading] = useState(true);
  const [broadcastSent, setBroadcastSent] = useState(false);

  // ────────────────────── Helpers ──────────────────────

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const scrollToEnd = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // ────────────────────── Fetch conversations ──────────────────────

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/messages');
      if (res.ok) {
        const data = await res.json();
        if (data.conversations) {
          setConversations(data.conversations);
        }
      }
    } catch {
      // silent
    } finally {
      setConvoLoading(false);
    }
  }, []);

  // ────────────────────── Fetch chat for a specific user ──────────────────────

  const fetchChat = useCallback(
    async (userId: string) => {
      try {
        const res = await fetch(`/api/chat/messages?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages) {
            setChatMessages(data.messages);
            scrollToEnd();
          }
        }
      } catch {
        // silent
      } finally {
        setChatLoading(false);
      }
    },
    [scrollToEnd]
  );

  // ────────────────────── Fetch broadcast history ──────────────────────

  const fetchBroadcasts = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/messages?broadcasts=true');
      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setBroadcastHistory(data.messages as ChatMsg[]);
        }
      }
    } catch {
      // silent
    } finally {
      setBroadcastLoading(false);
    }
  }, []);

  // ────────────────────── Open a conversation ──────────────────────

  const openConversation = useCallback(
    (userId: string, user: { name: string; email: string } | null) => {
      setActiveUserId(userId);
      setActiveUser(user);
      setChatMessages([]);
      setChatLoading(true);
      fetchChat(userId);
    },
    [fetchChat]
  );

  // ────────────────────── Send reply to user ──────────────────────

  const sendReply = useCallback(async () => {
    if (!replyText.trim() || !activeUserId || replying) return;
    setReplying(true);

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyText.trim(),
          receiverId: activeUserId,
        }),
      });

      if (res.ok) {
        setReplyText('');
        fetchChat(activeUserId);
        fetchConversations();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to send');
      }
    } catch {
      toast.error('Failed to send message');
    } finally {
      setReplying(false);
    }
  }, [replyText, activeUserId, replying, fetchChat, fetchConversations]);

  // ────────────────────── Send broadcast ──────────────────────

  const handleSendBroadcast = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!broadcastContent.trim()) {
        toast.error('Please enter a message');
        return;
      }
      setBroadcasting(true);

      try {
        const res = await fetch('/api/chat/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: broadcastContent.trim(), receiverId: null }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('Broadcast sent to all users');
          setBroadcastContent('');
          setBroadcastSent(true);
          setTimeout(() => setBroadcastSent(false), 3000);
          fetchBroadcasts();
        } else {
          toast.error(data.error || 'Failed to send broadcast');
        }
      } catch {
        toast.error('Something went wrong');
      } finally {
        setBroadcasting(false);
      }
    },
    [broadcastContent, fetchBroadcasts]
  );

  // ────────────────────── Polling ──────────────────────

  useEffect(() => {
    if (tab === 'conversations') {
      fetchConversations();
      convoIntervalRef.current = setInterval(fetchConversations, 8000);
      return () => {
        if (convoIntervalRef.current) clearInterval(convoIntervalRef.current);
      };
    }
    if (tab === 'broadcast') {
      fetchBroadcasts();
    }
  }, [tab, fetchConversations, fetchBroadcasts]);

  useEffect(() => {
    if (activeUserId) {
      chatIntervalRef.current = setInterval(() => fetchChat(activeUserId), 5000);
      return () => {
        if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);
      };
    }
  }, [activeUserId, fetchChat]);

  useEffect(scrollToEnd, [chatMessages, scrollToEnd]);

  // ────────────────────── Filtered conversations ──────────────────────

  const filtered = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.user?.name?.toLowerCase().includes(q) ||
      c.user?.email?.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
    );
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  // ────────────────────── Render ──────────────────────

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/25 transition-all duration-300';

  return (
    <div className="min-h-screen bg-[#050A14] p-6 md:p-8">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-[#00D4FF]/[0.02] blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#7B5EA7]/[0.03] blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-sora font-bold text-white">Messages</h1>
          <p className="text-white/40 mt-1">
            Manage user conversations and broadcasts on{' '}
            <span className="text-[#00D4FF]">NexaVault</span>
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('conversations')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              tab === 'conversations'
                ? 'bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30'
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Conversations
            {totalUnread > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-[#00D4FF] text-[#050A14] text-[10px] font-bold flex items-center justify-center">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('broadcast')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              tab === 'broadcast'
                ? 'bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30'
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Broadcast
          </button>
        </div>

        {/* ═══════════════ CONVERSATIONS TAB ═══════════════ */}
        {tab === 'conversations' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 h-[calc(100vh-220px)] min-h-[500px]"
          >
            {/* ── Left Panel: Conversation List ── */}
            <div
              className={`${
                activeUserId ? 'hidden md:flex' : 'flex'
              } flex-col w-full md:w-[340px] flex-shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden`}
            >
              {/* Search */}
              <div className="p-3 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00D4FF]/40 transition-colors"
                  />
                </div>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto">
                {convoLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 text-[#00D4FF] animate-spin" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <MessageSquare className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">
                      {searchQuery ? 'No matching conversations' : 'No conversations yet'}
                    </p>
                    <p className="text-white/20 text-xs mt-1">
                      User messages will appear here
                    </p>
                  </div>
                ) : (
                  filtered.map((convo) => (
                    <button
                      key={convo.userId}
                      onClick={() => openConversation(convo.userId, convo.user)}
                      className={`w-full px-4 py-3.5 flex items-center gap-3 text-left transition-all duration-200 border-b border-white/5 hover:bg-white/5 ${
                        activeUserId === convo.userId ? 'bg-[#00D4FF]/5 border-l-2 border-l-[#00D4FF]' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/30 to-violet-500/30 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white/70">
                          {convo.user ? getInitials(convo.user.name) : '?'}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-medium text-white truncate">
                            {convo.user?.name || 'Unknown User'}
                          </span>
                          <span className="text-[10px] text-white/30 flex-shrink-0 ml-2">
                            {formatDate(convo.lastDate)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-white/40 truncate">
                            {convo.lastMessage}
                          </p>
                          {convo.unread > 0 && (
                            <span className="w-5 h-5 rounded-full bg-[#00D4FF] text-[#050A14] text-[10px] font-bold flex items-center justify-center flex-shrink-0 ml-2">
                              {convo.unread > 9 ? '9+' : convo.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* ── Right Panel: Chat Thread ── */}
            <div
              className={`${
                activeUserId ? 'flex' : 'hidden md:flex'
              } flex-col flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden`}
            >
              {activeUserId && activeUser ? (
                <>
                  {/* Chat header */}
                  <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
                    <button
                      onClick={() => setActiveUserId(null)}
                      className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/50 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400/30 to-violet-500/30 border border-white/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-white/70">
                        {getInitials(activeUser.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {activeUser.name}
                      </h3>
                      <p className="text-[11px] text-white/40 truncate">{activeUser.email}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 text-[#00D4FF] animate-spin" />
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="text-center py-16">
                        <MessageSquare className="w-8 h-8 text-white/10 mx-auto mb-2" />
                        <p className="text-white/30 text-sm">No messages yet</p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isAdmin = msg.senderRole === 'admin';
                        return (
                          <motion.div
                            key={msg._id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex items-end gap-2 max-w-[75%] ${isAdmin ? 'flex-row-reverse' : ''}`}>
                              {!isAdmin && (
                                <div className="w-7 h-7 rounded-full bg-cyan-400/20 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                                </div>
                              )}
                              {isAdmin && (
                                <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                                  <Bot className="w-3.5 h-3.5 text-violet-400" />
                                </div>
                              )}
                              <div
                                className={`rounded-2xl px-4 py-2.5 ${
                                  isAdmin
                                    ? 'bg-violet-500/15 border border-violet-500/15 text-white/90 rounded-br-md'
                                    : 'bg-cyan-500/10 border border-cyan-500/10 text-white/80 rounded-bl-md'
                                }`}
                              >
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <p className="text-[10px] mt-1 opacity-30">
                                  {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Reply input */}
                  <div className="p-3 border-t border-white/10">
                    <div className="flex gap-2">
                      <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
                        placeholder={`Reply to ${activeUser.name}...`}
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={sendReply}
                        disabled={!replyText.trim() || replying}
                        className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center disabled:opacity-50 transition-opacity"
                      >
                        {replying ? (
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 text-white" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty state */
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-white/15" />
                    </div>
                    <h3 className="text-lg font-sora font-semibold text-white/40 mb-1">
                      Select a Conversation
                    </h3>
                    <p className="text-sm text-white/25">
                      Choose a user from the left to view their messages
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══════════════ BROADCAST TAB ═══════════════ */}
        {tab === 'broadcast' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            {/* Broadcast Form */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-[#00D4FF]" />
                </div>
                <div>
                  <h2 className="text-lg font-sora font-semibold text-white">
                    New Broadcast
                  </h2>
                  <p className="text-xs text-white/40 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    This message will be sent to all users
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendBroadcast}>
                <div className="mb-4">
                  <textarea
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    placeholder="Write your broadcast message here..."
                    rows={5}
                    className={`${inputClass} resize-none`}
                  />
                  <p className="text-xs text-white/30 mt-2 text-right">
                    {broadcastContent.length} characters
                  </p>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: broadcasting ? 1 : 1.01 }}
                  whileTap={{ scale: broadcasting ? 1 : 0.99 }}
                  disabled={broadcasting || !broadcastContent.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#00D4FF]/80 text-[#050A14] font-sora font-semibold text-sm hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <AnimatePresence mode="wait">
                    {broadcasting ? (
                      <motion.div
                        key="sending"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </motion.div>
                    ) : broadcastSent ? (
                      <motion.div
                        key="sent"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Sent Successfully
                      </motion.div>
                    ) : (
                      <motion.div
                        key="send"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send to All Users
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>
            </div>

            {/* Broadcast History */}
            <div className="flex items-center gap-3 mb-5">
              <Clock className="w-5 h-5 text-[#00D4FF]" />
              <h2 className="text-lg font-sora font-semibold text-white">
                Broadcast History
              </h2>
              <span className="text-xs text-white/30 bg-white/5 px-2.5 py-1 rounded-lg">
                {broadcastHistory.length} messages
              </span>
            </div>

            {broadcastLoading ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
                <Loader2 className="w-6 h-6 text-[#00D4FF] animate-spin mx-auto" />
                <p className="text-white/40 text-sm mt-3">Loading history...</p>
              </div>
            ) : broadcastHistory.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
                <MessageSquare className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No broadcasts sent yet</p>
                <p className="text-white/20 text-xs mt-1">
                  Your broadcast messages will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {broadcastHistory.map((msg, i) => (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/15 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
                          <Megaphone className="w-3.5 h-3.5 text-[#00D4FF]" />
                        </div>
                        <span className="text-xs font-medium text-[#00D4FF]">
                          Broadcast
                        </span>
                      </div>
                      <span className="text-xs text-white/30 flex-shrink-0">
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
