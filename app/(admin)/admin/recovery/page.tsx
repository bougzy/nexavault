'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  X,
  Loader2,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  Trash2,
  ShieldOff,
  CheckCircle2,
  Copy,
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RecoveryRequest {
  _id: string;
  email: string;
  name: string;
  phone: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type ModalType = 'resolve' | 'dismiss' | 'delete' | 'success' | null;

const STATUS_TABS: Array<{ key: 'pending' | 'resolved' | 'dismissed' | 'all'; label: string }> = [
  { key: 'pending', label: 'Pending' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'dismissed', label: 'Dismissed' },
  { key: 'all', label: 'All' },
];

function generatePassword(length = 12) {
  const chars =
    'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
  let out = '';
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : null;
  if (cryptoObj && cryptoObj.getRandomValues) {
    const arr = new Uint32Array(length);
    cryptoObj.getRandomValues(arr);
    for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
  } else {
    for (let i = 0; i < length; i++)
      out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export default function AdminRecoveryPage() {
  const [requests, setRequests] = useState<RecoveryRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusTab, setStatusTab] =
    useState<'pending' | 'resolved' | 'dismissed' | 'all'>('pending');
  const [pendingCount, setPendingCount] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<RecoveryRequest | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolvedAccount, setResolvedAccount] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);

  const fetchRequests = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        const params = new URLSearchParams({
          status: statusTab,
          page: currentPage.toString(),
          limit: '20',
        });
        if (search) params.set('search', search);

        const res = await fetch(`/api/admin/recovery?${params}`);
        const data = await res.json();

        if (res.ok) {
          setRequests(data.requests || []);
          setTotal(data.total || 0);
          setTotalPages(data.pages || 1);
          setPendingCount(data.pendingCount || 0);
        } else {
          toast.error(data.error || 'Failed to load requests');
        }
      } catch {
        toast.error('Failed to load requests');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [statusTab, currentPage, search]
  );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const openResolve = (req: RecoveryRequest) => {
    setSelected(req);
    setNewPassword(generatePassword(12));
    setShowPassword(true);
    setActiveModal('resolve');
  };

  const openDismiss = (req: RecoveryRequest) => {
    setSelected(req);
    setActiveModal('dismiss');
  };

  const openDelete = (req: RecoveryRequest) => {
    setSelected(req);
    setActiveModal('delete');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelected(null);
    setNewPassword('');
    setShowPassword(false);
    setResolvedAccount(null);
  };

  const handleResolve = async () => {
    if (!selected) return;
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selected._id,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Password reset successfully');
        setResolvedAccount(data.account);
        setActiveModal('success');
        fetchRequests();
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/recovery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selected._id,
          action: 'dismiss',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Request dismissed');
        closeModal();
        fetchRequests();
      } else {
        toast.error(data.error || 'Failed to dismiss');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/recovery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: selected._id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Request deleted');
        closeModal();
        fetchRequests();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error('Copy failed');
    }
  };

  const formatDate = (s: string) => {
    const d = new Date(s);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const StatusBadge = ({ status }: { status: RecoveryRequest['status'] }) => {
    const colors = {
      pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      resolved: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      dismissed: 'text-white/40 bg-white/5 border-white/10',
    };
    const dot = {
      pending: 'bg-amber-400',
      resolved: 'bg-emerald-400',
      dismissed: 'bg-white/40',
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${colors[status]}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/25 transition-all duration-300';

  return (
    <div className="min-h-screen bg-[#050A14] px-6 pb-6 pt-20 md:px-8 md:pb-8 md:pt-24">
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
            <h1 className="text-3xl font-sora font-bold text-white flex items-center gap-3">
              <KeyRound className="w-7 h-7 text-[#00D4FF]" />
              Password Recovery
            </h1>
            <p className="text-white/40 mt-1">
              <span className="text-amber-400 font-medium">{pendingCount}</span>{' '}
              pending request{pendingCount === 1 ? '' : 's'} awaiting review
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchRequests(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/60 hover:text-[#00D4FF] hover:border-[#00D4FF]/30 transition-all duration-300"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </motion.button>
        </motion.div>

        {/* Tabs + Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
        >
          <div className="flex gap-2 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  statusTab === tab.key
                    ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {tab.label}
                {tab.key === 'pending' && pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-amber-400/20 text-amber-400 text-xs font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative max-w-md w-full">
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

        {/* List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
        >
          {loading ? (
            <div className="px-6 py-16 text-center">
              <Loader2 className="w-6 h-6 text-[#00D4FF] animate-spin mx-auto" />
              <p className="text-white/40 text-sm mt-3">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <KeyRound className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">
                No {statusTab === 'all' ? '' : statusTab} requests
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {requests.map((req, i) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  className="p-5 md:p-6 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#7B5EA7]/20 border border-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] font-sora font-bold flex-shrink-0">
                        {req.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-sm font-semibold text-white">
                            {req.name || 'Unknown user'}
                          </h3>
                          <StatusBadge status={req.status} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/50 flex-wrap mb-2">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {req.email}
                          </span>
                          {req.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {req.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDate(req.createdAt)}
                          </span>
                        </div>
                        {req.reason && (
                          <div className="mt-2 flex items-start gap-2 text-sm text-white/70 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2">
                            <MessageSquare className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
                            <p className="leading-relaxed">{req.reason}</p>
                          </div>
                        )}
                        {req.status !== 'pending' && req.resolvedBy && (
                          <p className="text-xs text-white/40 mt-2">
                            {req.status === 'resolved'
                              ? 'Resolved'
                              : 'Dismissed'}{' '}
                            by{' '}
                            <span className="text-white/60">{req.resolvedBy}</span>
                            {req.resolvedAt && ` · ${formatDate(req.resolvedAt)}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {req.status === 'pending' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openResolve(req)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00D4FF] text-[#050A14] font-semibold text-sm hover:shadow-[0_0_24px_rgba(0,212,255,0.3)] transition-all"
                          >
                            <KeyRound className="w-4 h-4" />
                            Reset Password
                          </motion.button>
                          <button
                            onClick={() => openDismiss(req)}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-amber-400 hover:border-amber-400/30 transition-colors"
                            title="Dismiss"
                          >
                            <ShieldOff className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openDelete(req)}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-red-400 hover:border-red-400/30 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-t border-white/10 gap-3">
              <p className="text-sm text-white/40">
                Page {currentPage} of {totalPages} ({total} requests)
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
                  if (totalPages <= 5) page = i + 1;
                  else if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= totalPages - 2)
                    page = totalPages - 4 + i;
                  else page = currentPage - 2 + i;
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
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
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

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
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
              {/* RESOLVE */}
              {activeModal === 'resolve' && selected && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
                        <KeyRound className="w-5 h-5 text-[#00D4FF]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-sora font-semibold text-white">
                          Reset Password
                        </h3>
                        <p className="text-xs text-white/40">
                          For {selected.name || selected.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-5 p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Mail className="w-3 h-3" />
                      {selected.email}
                    </div>
                    {selected.phone && (
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <Phone className="w-3 h-3" />
                        {selected.phone}
                      </div>
                    )}
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm text-white/60 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className={`${inputClass} pr-24 font-mono`}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                          title={showPassword ? 'Hide' : 'Show'}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewPassword(generatePassword(12))}
                          className="p-2 rounded-lg text-white/40 hover:text-[#00D4FF] hover:bg-[#00D4FF]/5 transition-colors"
                          title="Generate"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/30 mt-1.5 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3" />
                      Share this password with the user through a secure channel
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
                      onClick={handleResolve}
                      disabled={actionLoading || newPassword.length < 8}
                      className="flex-1 py-3 rounded-xl bg-[#00D4FF] text-[#050A14] font-sora font-semibold text-sm hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          Reset Password
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* SUCCESS */}
              {activeModal === 'success' && resolvedAccount && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-sora font-semibold text-white">
                          Account Recovered
                        </h3>
                        <p className="text-xs text-white/40">
                          Share these credentials with the user
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-white/40 mb-1">Name</p>
                      <p className="text-sm font-medium text-white">
                        {resolvedAccount.name}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-white/40 mb-1">Email</p>
                        <p className="text-sm font-mono text-white truncate">
                          {resolvedAccount.email}
                        </p>
                      </div>
                      <button
                        onClick={() => copy(resolvedAccount.email, 'Email')}
                        className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-[#00D4FF] hover:bg-[#00D4FF]/5 transition-colors flex-shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 rounded-xl bg-[#00D4FF]/5 border border-[#00D4FF]/20 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-[#00D4FF]/80 mb-1">
                          New Password
                        </p>
                        <p className="text-sm font-mono text-white break-all">
                          {resolvedAccount.password}
                        </p>
                      </div>
                      <button
                        onClick={() => copy(resolvedAccount.password, 'Password')}
                        className="p-2 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors flex-shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-5 p-3 rounded-xl bg-amber-400/5 border border-amber-400/15 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-300/80 leading-relaxed">
                      This password will not be shown again. Send it to the user
                      through a secure channel and ask them to change it after
                      signing in.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      copy(
                        `Email: ${resolvedAccount.email}\nPassword: ${resolvedAccount.password}`,
                        'Credentials'
                      )
                    }
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2 mb-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Both
                  </button>
                  <button
                    onClick={closeModal}
                    className="w-full py-3 rounded-xl bg-[#00D4FF] text-[#050A14] font-semibold text-sm hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] transition-all"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* DISMISS */}
              {activeModal === 'dismiss' && selected && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                        <ShieldOff className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-sora font-semibold text-white">
                          Dismiss Request
                        </h3>
                        <p className="text-xs text-white/40">
                          Mark as not actionable
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mb-6 p-4 rounded-xl bg-amber-400/5 border border-amber-400/10">
                    <p className="text-sm text-white/70">
                      Dismiss the recovery request from{' '}
                      <span className="text-white font-semibold">
                        {selected.name || selected.email}
                      </span>
                      ? The user&apos;s password will not change.
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
                      onClick={handleDismiss}
                      disabled={actionLoading}
                      className="flex-1 py-3 rounded-xl bg-amber-400 text-[#050A14] font-semibold text-sm hover:bg-amber-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShieldOff className="w-4 h-4" />
                          Dismiss
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* DELETE */}
              {activeModal === 'delete' && selected && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-sora font-semibold text-white">
                          Delete Request
                        </h3>
                        <p className="text-xs text-white/40">
                          This action cannot be undone
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                    <p className="text-sm text-white/70">
                      Permanently delete this request from{' '}
                      <span className="text-white font-semibold">
                        {selected.name || selected.email}
                      </span>
                      ?
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
                      onClick={handleDelete}
                      disabled={actionLoading}
                      className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete
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
