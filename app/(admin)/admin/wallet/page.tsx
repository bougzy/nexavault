'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Copy,
  Check,
  Save,
  Loader2,
  Shield,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ═══════════════════════════════════════════
   ADMIN WALLET SETTINGS PAGE
   ═══════════════════════════════════════════ */
export default function AdminWalletPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ─── fetch current wallet ─── */
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch('/api/admin/wallet');
        const data = await res.json();

        if (res.ok) {
          setWalletAddress(data.walletAddress || '');
          setNewAddress(data.walletAddress || '');
        } else {
          toast.error('Failed to load wallet settings');
        }
      } catch {
        toast.error('Failed to fetch wallet settings');
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  /* ─── save wallet ─── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAddress.trim()) {
      toast.error('Please enter a wallet address');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: newAddress.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setWalletAddress(newAddress.trim());
        toast.success('Wallet address updated successfully');
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(data.error || 'Failed to update wallet address');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  /* ─── copy to clipboard ─── */
  const handleCopy = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  /* ─── glass input style ─── */
  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/25 transition-all duration-300';

  const hasChanges = newAddress.trim() !== walletAddress;

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

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-sora font-bold text-white">
            Wallet Settings
          </h1>
          <p className="text-white/40 mt-1">
            Manage the <span className="text-[#00D4FF]">NexaVault</span> donation wallet address
          </p>
        </motion.div>

        {/* Current Wallet Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#00D4FF]" />
            </div>
            <div>
              <h2 className="text-lg font-sora font-semibold text-white">
                Current Wallet Address
              </h2>
              <p className="text-xs text-white/40">
                This is the active donation wallet
              </p>
            </div>
          </div>

          {walletAddress ? (
            <div className="relative group">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 group-hover:border-[#00D4FF]/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-white break-all leading-relaxed">
                    {walletAddress}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex-shrink-0 p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-[#00D4FF] hover:border-[#00D4FF]/20 transition-all"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                      >
                        <Copy className="w-4 h-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-400/80">
                No wallet address configured yet. Set one below.
              </p>
            </div>
          )}
        </motion.div>

        {/* Update Wallet Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#00D4FF]" />
            </div>
            <div>
              <h2 className="text-lg font-sora font-semibold text-white">
                Update Address
              </h2>
              <p className="text-xs text-white/40">
                Enter a new wallet address to replace the current one
              </p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="mb-5">
              <label className="block text-sm text-white/60 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Enter wallet address (e.g. 0x1234... or bc1q...)"
                className={`${inputClass} font-mono text-sm`}
              />
              {hasChanges && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-[#00D4FF] mt-2 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  You have unsaved changes
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: saving ? 1 : 1.01 }}
              whileTap={{ scale: saving ? 1 : 0.99 }}
              disabled={saving || !newAddress.trim() || !hasChanges}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#00D4FF]/80 text-[#050A14] font-sora font-semibold text-sm hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <AnimatePresence mode="wait">
                {saving ? (
                  <motion.div
                    key="saving"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </motion.div>
                ) : saved ? (
                  <motion.div
                    key="saved"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Saved Successfully
                  </motion.div>
                ) : (
                  <motion.div
                    key="save"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Wallet Address
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-white/20 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white/30 leading-relaxed">
                The wallet address is used for receiving donations from users.
                Make sure to double-check the address before saving. Only admin
                users can view and update this setting.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
