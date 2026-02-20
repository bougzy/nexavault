'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  AlertCircle,
  MessageSquare,
  Send as SendIcon,
} from 'lucide-react';

/* ─── Types ─── */
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'pending' | 'active' | 'suspended';
  role: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  _id: string;
  userId: string;
  type: 'credit' | 'debit' | 'adjustment';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  senderName?: string;
  createdAt: string;
}

/* ─── Helpers ─── */
const formatCurrency = (amount: number, currency: string = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/* ─── Animation Variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/* ─── Shimmer Skeleton ─── */
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`shimmer ${className ?? ''}`}
      style={{ minHeight: '1em' }}
    />
  );
}

/* ═══════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════ */
export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>('USD');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'Deposit' | 'Withdraw'>('Deposit');
  const [chatMessages, setChatMessages] = useState<{_id: string; senderId: string; senderRole: 'user' | 'admin'; content: string; createdAt: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* Fetch user profile */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // silently fail
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  /* Fetch balance and transactions */
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch('/api/user/balance');
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
          setCurrency(data.currency || 'USD');
          setTransactions(data.transactions || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoadingBalance(false);
      }
    };
    fetchBalance();
  }, []);

  /* Animated counting effect for balance */
  useEffect(() => {
    if (balance === null) return;

    const target = balance;
    const duration = 1500;
    const startTime = performance.now();
    let animationFrame: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayBalance(target * eased);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayBalance(target);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [balance]);

  /* Handle action button click */
  const handleActionClick = (type: 'Deposit' | 'Withdraw') => {
    setActionType(type);
    setShowActionModal(true);
    // Pulse the chatbot button
    window.dispatchEvent(new Event('nexavault:chatpulse'));
  };

  /* ─── Chat / Messages ─── */
  const scrollToMessages = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/messages');
      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setChatMessages(data.messages.filter((m: {senderRole: string}) => m.senderRole === 'user' || m.senderRole === 'admin'));
        }
      }
    } catch {} finally { setChatLoading(false); }
  }, []);

  const sendMessage = useCallback(async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText.trim() }),
      });
      if (res.ok) {
        setReplyText('');
        fetchMessages();
      }
    } catch {} finally { setSending(false); }
  }, [replyText, sending, fetchMessages]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(scrollToMessages, [chatMessages, scrollToMessages]);

  /* Current date display */
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="nexavault-bg min-h-screen pb-20">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="orb orb-primary"
          style={{ width: 400, height: 400, top: '-10%', left: '-5%', opacity: 0.15 }}
        />
        <div
          className="orb orb-gold"
          style={{ width: 300, height: 300, bottom: '10%', right: '-5%', opacity: 0.1 }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ─── Section 1: Welcome Header ─── */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                {loadingProfile ? (
                  <div className="space-y-3">
                    <Shimmer className="w-72 h-9 rounded-lg" />
                    <Shimmer className="w-48 h-5 rounded-md" />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-sora font-bold text-[var(--text-primary)]">
                      Welcome back,{' '}
                      <span className="text-gradient-primary">
                        {user?.name || 'User'}
                      </span>
                    </h1>
                    <p className="text-sm sm:text-base text-[var(--text-muted)] font-dm-sans mt-1">
                      {today}
                    </p>
                  </>
                )}
              </div>

              {!loadingProfile && user && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border self-start"
                  style={{
                    background:
                      user.status === 'active'
                        ? 'rgba(0, 230, 118, 0.1)'
                        : user.status === 'suspended'
                        ? 'rgba(255, 82, 82, 0.1)'
                        : 'rgba(255, 193, 7, 0.1)',
                    borderColor:
                      user.status === 'active'
                        ? 'rgba(0, 230, 118, 0.3)'
                        : user.status === 'suspended'
                        ? 'rgba(255, 82, 82, 0.3)'
                        : 'rgba(255, 193, 7, 0.3)',
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{
                      background:
                        user.status === 'active'
                          ? '#00E676'
                          : user.status === 'suspended'
                          ? '#FF5252'
                          : '#FFC107',
                    }}
                  />
                  <span
                    className="text-xs font-sora font-semibold uppercase tracking-wider"
                    style={{
                      color:
                        user.status === 'active'
                          ? '#00E676'
                          : user.status === 'suspended'
                          ? '#FF5252'
                          : '#FFC107',
                    }}
                  >
                    {user.status}
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* ─── Section 2: Balance Card ─── */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="relative group">
              {/* Gold/amber glow behind the card */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-yellow-600/20 blur-sm opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

              <div className="relative bg-white/5 backdrop-blur-xl border border-amber-400/20 rounded-2xl p-6 sm:p-8 overflow-hidden">
                {/* Subtle shimmer overlay */}
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, transparent 30%, rgba(255,215,0,0.3) 50%, transparent 70%)',
                    backgroundSize: '200% 200%',
                    animation: 'shimmer 3s ease-in-out infinite',
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-dm-sans text-[var(--text-muted)]">
                        Total Balance
                      </p>
                      {transactions.length > 0 && transactions[0].senderName ? (
                        <p className="text-xs font-dm-sans text-[var(--text-disabled)]">
                          Last from: {transactions[0].senderName}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {loadingBalance ? (
                    <div className="space-y-3">
                      <Shimmer className="w-64 h-12 rounded-lg" />
                      <Shimmer className="w-36 h-4 rounded-md" />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-mono text-amber-400/60">
                          {currency === 'USD'
                            ? '$'
                            : currency === 'EUR'
                            ? '\u20AC'
                            : currency === 'GBP'
                            ? '\u00A3'
                            : currency}
                        </span>
                        <span className="text-4xl sm:text-5xl lg:text-6xl font-mono font-bold text-amber-400 tracking-tight">
                          {new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(displayBalance)}
                        </span>
                      </div>
                      <p className="text-xs font-dm-sans text-[var(--text-disabled)] mt-2">
                        {currency} Account
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── Section 3: Action Buttons ─── */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleActionClick('Deposit')}
                className="relative group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 flex items-center justify-center gap-3 hover:border-emerald-400/30 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                    <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-sora font-semibold text-[var(--text-primary)]">
                      Deposit
                    </p>
                    <p className="text-xs text-[var(--text-disabled)] font-dm-sans hidden sm:block">
                      Add funds
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleActionClick('Withdraw')}
                className="relative group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 flex items-center justify-center gap-3 hover:border-rose-400/30 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-400/10 border border-rose-400/20 flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-sora font-semibold text-[var(--text-primary)]">
                      Withdraw
                    </p>
                    <p className="text-xs text-[var(--text-disabled)] font-dm-sans hidden sm:block">
                      Send funds
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* ─── Section 4: Quick Stats Row ─── */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Account Number */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                    <CreditCard className="w-4.5 h-4.5 text-cyan-400" />
                  </div>
                  <p className="text-xs font-dm-sans text-[var(--text-muted)] uppercase tracking-wider">
                    Account Number
                  </p>
                </div>
                <p className="text-lg font-mono font-semibold text-[var(--text-primary)] tracking-widest">
                  ****-****-4521
                </p>
              </motion.div>

              {/* Member Since */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
                    <Calendar className="w-4.5 h-4.5 text-violet-400" />
                  </div>
                  <p className="text-xs font-dm-sans text-[var(--text-muted)] uppercase tracking-wider">
                    Member Since
                  </p>
                </div>
                {loadingProfile ? (
                  <Shimmer className="w-32 h-6 rounded-md" />
                ) : (
                  <p className="text-lg font-mono font-semibold text-[var(--text-primary)]">
                    {user?.createdAt ? formatDate(user.createdAt) : '--'}
                  </p>
                )}
              </motion.div>

              {/* Last Login */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                    <Clock className="w-4.5 h-4.5 text-amber-400" />
                  </div>
                  <p className="text-xs font-dm-sans text-[var(--text-muted)] uppercase tracking-wider">
                    Last Login
                  </p>
                </div>
                {loadingProfile ? (
                  <Shimmer className="w-40 h-6 rounded-md" />
                ) : (
                  <p className="text-lg font-mono font-semibold text-[var(--text-primary)]">
                    {user?.updatedAt ? formatDateTime(user.updatedAt) : 'Just now'}
                  </p>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* ─── Section 5: Transaction History ─── */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              {/* Table header */}
              <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                    <TrendingUp className="w-4.5 h-4.5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-sora font-semibold text-[var(--text-primary)]">
                      Transaction History
                    </h2>
                    <p className="text-xs text-[var(--text-disabled)] font-dm-sans">
                      Recent account activity
                    </p>
                  </div>
                </div>
                {transactions.length > 0 && (
                  <span className="text-xs font-mono text-[var(--text-muted)] bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {loadingBalance ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Shimmer className="w-32 h-4 rounded-md" />
                        <Shimmer className="w-48 h-3 rounded-md" />
                      </div>
                      <div className="text-right space-y-2">
                        <Shimmer className="w-24 h-4 rounded-md" />
                        <Shimmer className="w-20 h-3 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                /* Empty state */
                <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5"
                  >
                    <DollarSign className="w-8 h-8 text-[var(--text-disabled)]" />
                  </motion.div>
                  <h3 className="text-base font-sora font-semibold text-[var(--text-secondary)] mb-2">
                    No transactions yet
                  </h3>
                  <p className="text-sm text-[var(--text-disabled)] font-dm-sans max-w-sm">
                    Your admin will update your balance. All transactions will
                    appear here once processed.
                  </p>
                </div>
              ) : (
                /* Transaction table */
                <div className="overflow-x-auto">
                  {/* Desktop table */}
                  <table className="w-full hidden sm:table">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left text-xs font-dm-sans font-medium text-[var(--text-disabled)] uppercase tracking-wider px-6 py-3">
                          Date
                        </th>
                        <th className="text-left text-xs font-dm-sans font-medium text-[var(--text-disabled)] uppercase tracking-wider px-6 py-3">
                          Description
                        </th>
                        <th className="text-right text-xs font-dm-sans font-medium text-[var(--text-disabled)] uppercase tracking-wider px-6 py-3">
                          Amount
                        </th>
                        <th className="text-right text-xs font-dm-sans font-medium text-[var(--text-disabled)] uppercase tracking-wider px-6 py-3">
                          Balance After
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, index) => {
                        const isCredit = tx.type === 'credit';
                        const isDebit = tx.type === 'debit';
                        return (
                          <motion.tr
                            key={tx._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors duration-200"
                          >
                            <td className="px-6 py-4">
                              <p className="text-sm font-mono text-[var(--text-secondary)]">
                                {formatDate(tx.createdAt)}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{
                                    background: isCredit
                                      ? 'rgba(0, 230, 118, 0.1)'
                                      : isDebit
                                      ? 'rgba(255, 82, 82, 0.1)'
                                      : 'rgba(41, 182, 246, 0.1)',
                                    border: `1px solid ${
                                      isCredit
                                        ? 'rgba(0, 230, 118, 0.2)'
                                        : isDebit
                                        ? 'rgba(255, 82, 82, 0.2)'
                                        : 'rgba(41, 182, 246, 0.2)'
                                    }`,
                                  }}
                                >
                                  {isCredit ? (
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                  ) : isDebit ? (
                                    <TrendingDown className="w-4 h-4 text-rose-400" />
                                  ) : (
                                    <DollarSign className="w-4 h-4 text-sky-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-dm-sans text-[var(--text-primary)]">
                                    {tx.description}
                                  </p>
                                  {tx.senderName && (
                                    <p className="text-[11px] font-dm-sans text-[var(--text-disabled)]">
                                      From: {tx.senderName}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span
                                className="text-sm font-mono font-semibold"
                                style={{
                                  color: isCredit
                                    ? '#00E676'
                                    : isDebit
                                    ? '#FF5252'
                                    : '#29B6F6',
                                }}
                              >
                                {isCredit ? '+' : isDebit ? '-' : ''}
                                {formatCurrency(tx.amount, currency)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-mono text-[var(--text-muted)]">
                                {formatCurrency(tx.balanceAfter, currency)}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Mobile card layout */}
                  <div className="sm:hidden divide-y divide-white/5">
                    {transactions.map((tx, index) => {
                      const isCredit = tx.type === 'credit';
                      const isDebit = tx.type === 'debit';
                      return (
                        <motion.div
                          key={tx._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="px-5 py-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: isCredit
                                    ? 'rgba(0, 230, 118, 0.1)'
                                    : isDebit
                                    ? 'rgba(255, 82, 82, 0.1)'
                                    : 'rgba(41, 182, 246, 0.1)',
                                  border: `1px solid ${
                                    isCredit
                                      ? 'rgba(0, 230, 118, 0.2)'
                                      : isDebit
                                      ? 'rgba(255, 82, 82, 0.2)'
                                      : 'rgba(41, 182, 246, 0.2)'
                                  }`,
                                }}
                              >
                                {isCredit ? (
                                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                                ) : isDebit ? (
                                  <TrendingDown className="w-4 h-4 text-rose-400" />
                                ) : (
                                  <DollarSign className="w-4 h-4 text-sky-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-dm-sans text-[var(--text-primary)]">
                                  {tx.description}
                                </p>
                                {tx.senderName && (
                                  <p className="text-[11px] font-dm-sans text-[var(--text-disabled)]">
                                    From: {tx.senderName}
                                  </p>
                                )}
                                <p className="text-xs font-mono text-[var(--text-disabled)]">
                                  {formatDate(tx.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className="text-sm font-mono font-semibold"
                                style={{
                                  color: isCredit
                                    ? '#00E676'
                                    : isDebit
                                    ? '#FF5252'
                                    : '#29B6F6',
                                }}
                              >
                                {isCredit ? '+' : isDebit ? '-' : ''}
                                {formatCurrency(tx.amount, currency)}
                              </p>
                              <p className="text-xs font-mono text-[var(--text-disabled)]">
                                Bal: {formatCurrency(tx.balanceAfter, currency)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* ─── Section 6: Messages ─── */}
          <motion.div variants={itemVariants} className="mt-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
                    <MessageSquare className="w-4.5 h-4.5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-sora font-semibold text-[var(--text-primary)]">Messages</h2>
                    <p className="text-xs text-[var(--text-disabled)] font-dm-sans">Your conversation with support</p>
                  </div>
                </div>
                {chatMessages.length > 0 && (
                  <span className="text-xs font-mono text-[var(--text-muted)] bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    {chatMessages.length} message{chatMessages.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Messages area */}
              <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                {chatLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-10 h-10 text-[var(--text-disabled)] mx-auto mb-3" />
                    <p className="text-sm text-[var(--text-muted)]">No messages yet</p>
                    <p className="text-xs text-[var(--text-disabled)] mt-1">Send a message to our support team</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isUser = msg.senderRole === 'user';
                    return (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] ${isUser ? 'order-1' : ''}`}>
                          <p className={`text-[10px] mb-0.5 ${isUser ? 'text-right text-cyan-400/50' : 'text-violet-400/50'}`}>
                            {isUser ? 'You' : 'Support Team'}
                          </p>
                          <div className={`rounded-2xl px-4 py-2.5 ${
                            isUser
                              ? 'bg-cyan-500/15 border border-cyan-500/15 text-white/90 rounded-br-md'
                              : 'bg-violet-500/10 border border-violet-500/10 text-white/80 rounded-bl-md'
                          }`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className="text-[10px] mt-1 opacity-30">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {' · '}
                              {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              <div className="px-4 py-3 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Type a message to support..."
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={sendMessage}
                    disabled={!replyText.trim() || sending}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center disabled:opacity-50 transition-opacity"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <SendIcon className="w-4 h-4 text-white" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ─── Action Modal / Overlay ─── */}
      <AnimatePresence>
        {showActionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={() => setShowActionModal(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-[#0A1628]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
            >
              {/* Glow accent */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-amber-400/15 via-transparent to-cyan-400/15 -z-10 blur-sm" />

              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-8 h-8 text-amber-400" />
              </div>

              <h3 className="text-xl font-sora font-bold text-[var(--text-primary)] mb-3">
                {actionType} Request
              </h3>

              <p className="text-sm font-dm-sans text-[var(--text-muted)] leading-relaxed mb-6">
                This action requires admin authorization. Please contact support
                via the chat assistant below.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-sora font-medium text-[var(--text-secondary)] hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    window.dispatchEvent(new Event('nexavault:chatpulse'));
                  }}
                  className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-sm font-sora font-semibold text-white hover:shadow-[0_0_25px_rgba(0,212,255,0.3)] transition-all duration-300"
                >
                  Open Chat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
