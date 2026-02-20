'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Wallet,
  MessageSquare,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Activity,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── types ─── */
interface UserData {
  _id: string;
  name: string;
  email: string;
  balance: number;
  currency: string;
  status: 'pending' | 'active' | 'suspended';
  createdAt: string;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  trend?: 'up' | 'down';
}

/* ═══════════════════════════════════════════
   ADMIN DASHBOARD PAGE
   ═══════════════════════════════════════════ */
export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);

      const [usersRes, messagesRes] = await Promise.all([
        fetch('/api/admin/users?limit=100'),
        fetch('/api/chat/messages?unread=true'),
      ]);

      const usersData = await usersRes.json();
      const messagesData = await messagesRes.json();

      if (usersRes.ok) {
        setUsers(usersData.users || []);
        setTotalUsers(usersData.total || 0);
      } else {
        toast.error('Failed to load users');
      }

      if (messagesRes.ok) {
        setUnreadMessages(messagesData.unreadCount || 0);
      }
    } catch {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ─── computed stats ─── */
  const totalBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);
  const activeAccounts = users.filter((u) => u.status === 'active').length;

  const stats: StatCard[] = [
    {
      label: 'Total Users',
      value: totalUsers.toLocaleString(),
      icon: <Users className="w-6 h-6" />,
      change: '+12%',
      trend: 'up',
    },
    {
      label: 'Total Balance',
      value: `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <Wallet className="w-6 h-6" />,
      change: '+8.2%',
      trend: 'up',
    },
    {
      label: 'New Messages',
      value: unreadMessages,
      icon: <MessageSquare className="w-6 h-6" />,
      change: unreadMessages > 0 ? `${unreadMessages} unread` : 'All read',
      trend: unreadMessages > 0 ? 'up' : 'down',
    },
    {
      label: 'Active Accounts',
      value: activeAccounts.toLocaleString(),
      icon: <ShieldCheck className="w-6 h-6" />,
      change: `${totalUsers > 0 ? Math.round((activeAccounts / totalUsers) * 100) : 0}%`,
      trend: 'up',
    },
  ];

  /* ─── recent activity (newest users as proxy for activity) ─── */
  const recentActivity = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  /* ─── animation variants ─── */
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A14] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-[#00D4FF]/30 border-t-[#00D4FF] rounded-full"
        />
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

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-sora font-bold text-white">
              Admin Dashboard
            </h1>
            <p className="text-white/40 mt-1">
              Overview of <span className="text-[#00D4FF]">NexaVault</span> platform
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/60 hover:text-[#00D4FF] hover:border-[#00D4FF]/30 transition-all duration-300"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={item}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group hover:border-[#00D4FF]/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] group-hover:bg-[#00D4FF]/15 transition-colors">
                  {stat.icon}
                </div>
                {stat.change && (
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                    stat.trend === 'up'
                      ? 'text-emerald-400 bg-emerald-400/10'
                      : 'text-white/40 bg-white/5'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {stat.change}
                  </div>
                )}
              </div>
              <p className="text-2xl font-sora font-bold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-white/40">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-[#00D4FF]" />
                <h2 className="text-lg font-sora font-semibold text-white">
                  Recent Activity
                </h2>
              </div>
              <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-lg">
                Last {recentActivity.length} entries
              </span>
            </div>

            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-8">
                  No recent activity found
                </p>
              ) : (
                recentActivity.map((user, i) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#7B5EA7]/20 border border-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] font-sora font-bold text-sm flex-shrink-0">
                      {user.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-white/40 truncate">{user.email}</p>
                    </div>

                    {/* Balance */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-white">
                        {user.currency === 'USD' ? '$' : user.currency}{' '}
                        {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-white/40">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Status */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      user.status === 'active'
                        ? 'bg-emerald-400'
                        : user.status === 'pending'
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                    }`} />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Quick Stats Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Platform Status */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <TrendingUp className="w-5 h-5 text-[#00D4FF]" />
                <h2 className="text-lg font-sora font-semibold text-white">
                  Platform Status
                </h2>
              </div>

              <div className="space-y-4">
                {/* Active rate */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/40">Active Users</span>
                    <span className="text-white font-medium">
                      {activeAccounts} / {totalUsers}
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${totalUsers > 0 ? (activeAccounts / totalUsers) * 100 : 0}%`,
                      }}
                      transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-[#00D4FF] to-[#00D4FF]/60 rounded-full"
                    />
                  </div>
                </div>

                {/* Pending */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/40">Pending</span>
                    <span className="text-amber-400 font-medium">
                      {users.filter((u) => u.status === 'pending').length}
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${totalUsers > 0 ? (users.filter((u) => u.status === 'pending').length / totalUsers) * 100 : 0}%`,
                      }}
                      transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-400/60 rounded-full"
                    />
                  </div>
                </div>

                {/* Suspended */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/40">Suspended</span>
                    <span className="text-red-400 font-medium">
                      {users.filter((u) => u.status === 'suspended').length}
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${totalUsers > 0 ? (users.filter((u) => u.status === 'suspended').length / totalUsers) * 100 : 0}%`,
                      }}
                      transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-red-400 to-red-400/60 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Balances */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-sora font-semibold text-white mb-5">
                Top Balances
              </h2>
              <div className="space-y-3">
                {[...users]
                  .sort((a, b) => b.balance - a.balance)
                  .slice(0, 5)
                  .map((user, i) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3"
                    >
                      <span className="text-xs text-white/30 w-4 font-mono">
                        {i + 1}.
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#7B5EA7]/20 border border-white/10 flex items-center justify-center text-xs text-[#00D4FF] font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{user.name}</p>
                      </div>
                      <p className="text-sm font-mono text-[#00D4FF]">
                        ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                {users.length === 0 && (
                  <p className="text-white/40 text-sm text-center py-4">
                    No users found
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
