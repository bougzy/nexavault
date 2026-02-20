'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Loader2,
  DollarSign,
  Calendar,
  User,
  Mail,
  Tag,
  Hash,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

interface DonationItem {
  _id: string;
  userId: string | null;
  name: string;
  email: string;
  category: string;
  amount: number;
  currency: string;
  txHash: string | null;
  note: string | null;
  createdAt: string;
}

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDonations = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('/api/donations');
      if (res.ok) {
        const data = await res.json();
        setDonations(data.donations || []);
        setTotalAmount(data.totalAmount || 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatAmount = (amount: number, currency: string) => {
    if (['BTC', 'ETH', 'USDT', 'BNB'].includes(currency)) {
      return `${amount} ${currency}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const categoryColors: Record<string, string> = {
    General: 'from-green-400 to-emerald-500',
    Education: 'from-blue-400 to-indigo-500',
    Health: 'from-red-400 to-rose-500',
    Environment: 'from-lime-400 to-green-500',
    'Women Empowerment': 'from-pink-400 to-rose-500',
    'Community Development': 'from-amber-400 to-orange-500',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00D4FF] animate-spin" />
      </div>
    );
  }

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
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4"
        >
          <div>
            <h1 className="text-3xl font-sora font-bold text-white">Donations</h1>
            <p className="text-white/40 mt-1">
              User donation proposals on{' '}
              <span className="text-[#00D4FF]">NexaVault</span>
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchDonations(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all self-start"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-pink-400/10 border border-pink-400/20 flex items-center justify-center">
                <Heart className="w-4 h-4 text-pink-400" />
              </div>
              <p className="text-xs text-white/40 uppercase tracking-wider">Total Proposals</p>
            </div>
            <p className="text-2xl font-mono font-bold text-white">{donations.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-white/40 uppercase tracking-wider">Total Amount</p>
            </div>
            <p className="text-2xl font-mono font-bold text-emerald-400">
              ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
                <Tag className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-xs text-white/40 uppercase tracking-wider">Categories</p>
            </div>
            <p className="text-2xl font-mono font-bold text-white">
              {new Set(donations.map(d => d.category)).size}
            </p>
          </motion.div>
        </div>

        {/* Donations List */}
        {donations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-16 text-center"
          >
            <Heart className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-sora font-semibold text-white/40 mb-2">No Donations Yet</h3>
            <p className="text-sm text-white/25">User donation proposals will appear here</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {donations.map((d, i) => (
              <motion.div
                key={d._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/15 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: User info + details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryColors[d.category] || 'from-gray-400 to-gray-500'} flex items-center justify-center flex-shrink-0`}>
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">{d.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{d.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {d.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(d.createdAt)}
                      </span>
                      {d.userId && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Registered User
                        </span>
                      )}
                      {d.txHash && (
                        <span className="flex items-center gap-1 font-mono">
                          <Hash className="w-3 h-3" />
                          {d.txHash.slice(0, 10)}...
                        </span>
                      )}
                    </div>

                    {d.note && (
                      <p className="text-xs text-white/30 mt-2 italic">
                        &quot;{d.note}&quot;
                      </p>
                    )}
                  </div>

                  {/* Right: Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-mono font-bold text-emerald-400">
                      {formatAmount(d.amount, d.currency)}
                    </p>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">
                      Proposed
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
