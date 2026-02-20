'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit3,
  X,
  Plus,
  Minus,
  Equal,
  AlertTriangle,
  Loader2,
  MoreHorizontal,
  Coins,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── types ─── */
interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  currency: string;
  status: 'pending' | 'active' | 'suspended';
  createdAt: string;
}

type ModalType = 'balance' | 'currency' | 'message' | 'delete' | null;

const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY',
  'INR', 'KRW', 'BRL', 'MXN', 'SGD', 'HKD', 'NOK', 'SEK',
];

/* ═══════════════════════════════════════════
   ADMIN USERS PAGE
   ═══════════════════════════════════════════ */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  /* modal state */
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  /* balance modal fields */
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceDescription, setBalanceDescription] = useState('');
  const [balanceSenderName, setBalanceSenderName] = useState('');
  const [balanceLoading, setBalanceLoading] = useState(false);

  /* currency modal fields */
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [currencyLoading, setCurrencyLoading] = useState(false);

  /* message modal fields */
  const [messageContent, setMessageContent] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);

  /* delete modal */
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ─── fetch users ─── */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (res.ok) {
        setUsers(data.users || []);
        setTotalUsers(data.total || 0);
        setTotalPages(data.pages || 1);
      } else {
        toast.error(data.error || 'Failed to fetch users');
      }
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ─── search debounce ─── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  /* ─── close dropdown on outside click ─── */
  useEffect(() => {
    const handler = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    }
  }, [openDropdown]);

  /* ─── helpers ─── */
  const openModal = (type: ModalType, user: UserData) => {
    setSelectedUser(user);
    setActiveModal(type);
    setOpenDropdown(null);
    /* reset fields */
    setBalanceAmount('');
    setBalanceDescription('');
    setBalanceSenderName('');
    setSelectedCurrency(user.currency);
    setMessageContent('');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedUser(null);
  };

  /* ─── balance operations ─── */
  const handleBalanceOperation = async (operation: 'add' | 'subtract' | 'set') => {
    if (!selectedUser || !balanceAmount) {
      toast.error('Please enter an amount');
      return;
    }

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setBalanceLoading(true);
    try {
      const res = await fetch('/api/admin/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser._id,
          operation,
          amount,
          description: balanceDescription || undefined,
          senderName: balanceSenderName || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Balance ${operation === 'add' ? 'added' : operation === 'subtract' ? 'subtracted' : 'set'} successfully`);
        closeModal();
        fetchUsers();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setBalanceLoading(false);
    }
  };

  /* ─── set currency ─── */
  const handleSetCurrency = async () => {
    if (!selectedUser || !selectedCurrency) return;

    setCurrencyLoading(true);
    try {
      const res = await fetch('/api/admin/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser._id,
          operation: 'set',
          amount: selectedUser.balance,
          currency: selectedCurrency,
          description: `Currency changed to ${selectedCurrency}`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Currency updated to ${selectedCurrency}`);
        closeModal();
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to update currency');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setCurrencyLoading(false);
    }
  };

  /* ─── send message ─── */
  const handleSendMessage = async () => {
    if (!selectedUser || !messageContent.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setMessageLoading(true);
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageContent.trim(),
          receiverId: selectedUser._id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Message sent to ${selectedUser.name}`);
        closeModal();
      } else {
        toast.error(data.error || 'Failed to send message');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setMessageLoading(false);
    }
  };

  /* ─── toggle status ─── */
  const handleToggleStatus = async (user: UserData) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    setOpenDropdown(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, status: nextStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`User ${nextStatus === 'active' ? 'activated' : 'suspended'}`);
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  /* ─── delete user ─── */
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setDeleteLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser._id }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('User deleted successfully');
        closeModal();
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ─── status badge ─── */
  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      active: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      suspended: 'text-red-400 bg-red-400/10 border-red-400/20',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${colors[status as keyof typeof colors] || colors.pending}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === 'active' ? 'bg-emerald-400' : status === 'pending' ? 'bg-amber-400' : 'bg-red-400'
        }`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  /* ─── glass input style ─── */
  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/25 transition-all duration-300';

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
          className="mb-8"
        >
          <h1 className="text-3xl font-sora font-bold text-white">
            User Management
          </h1>
          <p className="text-white/40 mt-1">
            Manage <span className="text-[#00D4FF]">{totalUsers}</span> registered users
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email..."
              className={`${inputClass} pl-11`}
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
        >
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                    User
                  </th>
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                    Phone
                  </th>
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                    Balance
                  </th>
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">
                    Currency
                  </th>
                  <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <Loader2 className="w-6 h-6 text-[#00D4FF] animate-spin mx-auto" />
                      <p className="text-white/40 text-sm mt-3">Loading users...</p>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <p className="text-white/40 text-sm">No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user, i) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.03 * i }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#7B5EA7]/20 border border-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] font-sora font-bold text-sm flex-shrink-0">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-sm text-white font-medium truncate max-w-[140px]">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/60 truncate block max-w-[180px]">
                          {user.email}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-white/60">{user.phone || '--'}</span>
                      </td>

                      {/* Balance */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-white font-medium">
                          ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Currency */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-sm text-white/60 bg-white/5 px-2 py-0.5 rounded-md">
                          {user.currency}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === user._id ? null : user._id);
                            }}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          <AnimatePresence>
                            {openDropdown === user._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-1 w-52 bg-[#0A1628] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => openModal('balance', user)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-[#00D4FF] transition-colors"
                                >
                                  <DollarSign className="w-4 h-4" />
                                  Edit Balance
                                </button>
                                <button
                                  onClick={() => openModal('currency', user)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-[#00D4FF] transition-colors"
                                >
                                  <Coins className="w-4 h-4" />
                                  Set Currency
                                </button>
                                <button
                                  onClick={() => openModal('message', user)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-[#00D4FF] transition-colors"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  Send Message
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(user)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-amber-400 transition-colors"
                                >
                                  {user.status === 'active' ? (
                                    <ToggleLeft className="w-4 h-4" />
                                  ) : (
                                    <ToggleRight className="w-4 h-4" />
                                  )}
                                  {user.status === 'active' ? 'Suspend User' : 'Activate User'}
                                </button>
                                <div className="border-t border-white/5" />
                                <button
                                  onClick={() => openModal('delete', user)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-400/5 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete User
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-t border-white/10 gap-3">
              <p className="text-sm text-white/40">
                Page {currentPage} of {totalPages} ({totalUsers} users)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        page === currentPage
                          ? 'bg-[#00D4FF] text-[#050A14]'
                          : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ═══ MODALS ═══ */}
      <AnimatePresence>
        {activeModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#0A1628] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* ─── Edit Balance Modal ─── */}
              {activeModal === 'balance' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
                        <Edit3 className="w-5 h-5 text-[#00D4FF]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-sora font-semibold text-white">
                          Edit Balance
                        </h3>
                        <p className="text-xs text-white/40">{selectedUser.name}</p>
                      </div>
                    </div>
                    <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-5 p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-white/40 mb-1">Current Balance</p>
                    <p className="text-2xl font-mono font-bold text-[#00D4FF]">
                      {selectedUser.currency} {selectedUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-white/60 mb-1.5">Sender Name</label>
                      <input
                        type="text"
                        value={balanceSenderName}
                        onChange={(e) => setBalanceSenderName(e.target.value)}
                        placeholder="e.g. John Smith, NexaVault HQ, PayPal..."
                        className={inputClass}
                      />
                      <p className="text-[11px] text-white/30 mt-1">User will see this as the source of the transaction</p>
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-1.5">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={balanceAmount}
                        onChange={(e) => setBalanceAmount(e.target.value)}
                        placeholder="0.00"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-1.5">
                        Description <span className="text-white/30">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={balanceDescription}
                        onChange={(e) => setBalanceDescription(e.target.value)}
                        placeholder="Reason for adjustment..."
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleBalanceOperation('add')}
                        disabled={balanceLoading}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-sm hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                      >
                        {balanceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleBalanceOperation('subtract')}
                        disabled={balanceLoading}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        {balanceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4" />}
                        Subtract
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleBalanceOperation('set')}
                        disabled={balanceLoading}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] font-medium text-sm hover:bg-[#00D4FF]/20 transition-colors disabled:opacity-50"
                      >
                        {balanceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Equal className="w-4 h-4" />}
                        Set
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Set Currency Modal ─── */}
              {activeModal === 'currency' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
                        <Coins className="w-5 h-5 text-[#00D4FF]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-sora font-semibold text-white">
                          Set Currency
                        </h3>
                        <p className="text-xs text-white/40">{selectedUser.name}</p>
                      </div>
                    </div>
                    <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-5">
                    <p className="text-sm text-white/40 mb-1">Current Currency</p>
                    <p className="text-lg font-mono font-semibold text-white">{selectedUser.currency}</p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm text-white/60 mb-1.5">Select Currency</label>
                    <div className="relative">
                      <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c} className="bg-[#0A1628] text-white">
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSetCurrency}
                    disabled={currencyLoading || selectedCurrency === selectedUser.currency}
                    className="w-full py-3 rounded-xl bg-[#00D4FF] text-[#050A14] font-sora font-semibold text-sm hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {currencyLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Update Currency'
                    )}
                  </motion.button>
                </div>
              )}

              {/* ─── Send Message Modal ─── */}
              {activeModal === 'message' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-[#00D4FF]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-sora font-semibold text-white">
                          Send Message
                        </h3>
                        <p className="text-xs text-white/40">to {selectedUser.name}</p>
                      </div>
                    </div>
                    <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm text-white/60 mb-1.5">Message</label>
                    <textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type your message..."
                      rows={4}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSendMessage}
                    disabled={messageLoading || !messageContent.trim()}
                    className="w-full py-3 rounded-xl bg-[#00D4FF] text-[#050A14] font-sora font-semibold text-sm hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {messageLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* ─── Delete Confirm Modal ─── */}
              {activeModal === 'delete' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-sora font-semibold text-white">
                          Delete User
                        </h3>
                        <p className="text-xs text-white/40">This action cannot be undone</p>
                      </div>
                    </div>
                    <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                    <p className="text-sm text-white/70">
                      Are you sure you want to permanently delete{' '}
                      <span className="text-white font-semibold">{selectedUser.name}</span>
                      {' '}({selectedUser.email})? All their data will be removed.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-medium text-sm hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleDeleteUser}
                      disabled={deleteLoading}
                      className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {deleteLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete User
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
