'use client';

import { useState, memo, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound,
  Mail,
  MessageSquare,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── floating currency symbol (reused style from login) ─── */
const FloatingCurrency = memo(function FloatingCurrency({
  symbol,
  x,
  y,
  delay,
  duration,
  fontSize,
}: {
  symbol: string;
  x: string;
  y: string;
  delay: number;
  duration: number;
  fontSize: number;
}) {
  return (
    <motion.span
      className="absolute font-mono select-none pointer-events-none"
      style={{
        left: x,
        top: y,
        fontSize,
        color: 'rgba(0,212,255,0.06)',
      }}
      animate={{
        y: [0, -50, 0, 50, 0],
        x: [0, 25, 0, -25, 0],
        rotate: [0, 15, 0, -15, 0],
        opacity: [0.04, 0.12, 0.04, 0.08, 0.04],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      {symbol}
    </motion.span>
  );
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      triggerShake();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit request');
        triggerShake();
        toast.error(data.error || 'Request failed');
        setLoading(false);
        return;
      }

      setSubmitted(true);
      toast.success('Recovery request submitted');
    } catch {
      setError('Something went wrong. Please try again.');
      triggerShake();
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    'w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3.5 text-base text-[#F0F4FF] font-dm-sans placeholder:text-[rgba(240,244,255,0.3)] focus:outline-none focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/25 transition-colors';

  const floatingCurrencies = useMemo(() => {
    const currencies = [
      { symbol: '$', x: '8%', y: '12%', delay: 0, duration: 14, fontSize: 48 },
      { symbol: '€', x: '82%', y: '8%', delay: 1.5, duration: 12, fontSize: 40 },
      { symbol: '£', x: '15%', y: '75%', delay: 3, duration: 16, fontSize: 36 },
      { symbol: '¥', x: '88%', y: '70%', delay: 0.8, duration: 13, fontSize: 44 },
      { symbol: '₿', x: '45%', y: '5%', delay: 2.2, duration: 15, fontSize: 32 },
      { symbol: '₹', x: '70%', y: '85%', delay: 4, duration: 11, fontSize: 38 },
      { symbol: '₩', x: '25%', y: '90%', delay: 1, duration: 14, fontSize: 34 },
      { symbol: '₣', x: '92%', y: '40%', delay: 2.8, duration: 12, fontSize: 30 },
    ];
    return currencies.map((c, i) => <FloatingCurrency key={i} {...c} />);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050A14] relative overflow-hidden px-4">
      {floatingCurrencies}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#00D4FF]/[0.02] blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#7B5EA7]/[0.03] blur-[80px]" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          x: shake ? [0, -12, 12, -12, 12, -6, 6, 0] : 0,
        }}
        transition={
          shake
            ? { duration: 0.5, ease: 'easeInOut' }
            : { duration: 0.7, ease: 'easeOut' }
        }
        className="relative w-full max-w-md z-10"
      >
        <div className="rounded-2xl border border-[rgba(0,212,255,0.15)] bg-[rgba(255,255,255,0.05)] backdrop-blur-xl p-8 shadow-[0_0_80px_rgba(0,212,255,0.06)]">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#00D4FF]/20 via-transparent to-[#7B5EA7]/20 -z-10 blur-sm" />

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00D4FF]/15 to-[#7B5EA7]/15 border border-[#00D4FF]/25 flex items-center justify-center mb-5"
            >
              <KeyRound className="w-10 h-10 text-[#00D4FF]" />
            </motion.div>

            <h1 className="text-2xl font-sora font-bold text-[#F0F4FF]">
              {submitted ? 'Request Received' : 'Recover Account'}
            </h1>
            <p className="text-sm text-[rgba(240,244,255,0.55)] font-dm-sans mt-1 text-center">
              {submitted
                ? 'Our team will contact you with your new password'
                : 'Submit a recovery request — an administrator will reset your password manually'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-emerald-300/90 font-dm-sans space-y-2">
                    <p className="font-medium">Your request has been submitted.</p>
                    <p className="text-emerald-300/70 leading-relaxed">
                      An administrator will review your request and contact you
                      at <span className="text-emerald-300">{email}</span> with
                      your new password. This is done manually for security —
                      please allow some time for a response.
                    </p>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-sora font-semibold text-sm text-[#050A14] bg-gradient-to-r from-[#00D4FF] to-[#00D4FF]/80 hover:shadow-[0_0_30px_rgba(0,212,255,0.35)] transition-shadow duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      className="mb-5 overflow-hidden"
                    >
                      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/[0.08] border border-red-500/20">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-400 font-dm-sans">
                          {error}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-dm-sans text-[rgba(240,244,255,0.55)]">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(240,244,255,0.35)]" />
                      <input
                        type="email"
                        inputMode="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        placeholder="john@example.com"
                        className={`${inputBase} pl-10`}
                        autoComplete="email"
                        autoCapitalize="none"
                        enterKeyHint="next"
                      />
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-dm-sans text-[rgba(240,244,255,0.55)]">
                      Why do you need recovery?{' '}
                      <span className="text-[rgba(240,244,255,0.3)]">
                        (optional)
                      </span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-[rgba(240,244,255,0.35)]" />
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Briefly explain so an admin can confirm it's really you..."
                        rows={4}
                        maxLength={500}
                        className={`${inputBase} pl-10 resize-none`}
                      />
                    </div>
                    <p className="text-[11px] text-[rgba(240,244,255,0.35)]">
                      {reason.length}/500 characters
                    </p>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full relative py-3.5 rounded-xl font-sora font-semibold text-sm text-[#050A14] bg-gradient-to-r from-[#00D4FF] to-[#00D4FF]/80 hover:shadow-[0_0_30px_rgba(0,212,255,0.35)] transition-shadow duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className="w-5 h-5 border-2 border-[#050A14]/30 border-t-[#050A14] rounded-full"
                        />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Submit Recovery Request
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                <p className="text-center text-sm text-[rgba(240,244,255,0.55)] font-dm-sans mt-6">
                  Remembered your password?{' '}
                  <Link
                    href="/login"
                    className="text-[#00D4FF] font-medium hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
