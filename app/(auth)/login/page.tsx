'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  Fingerprint,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── floating currency symbol ─── */
function FloatingCurrency({
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
}

/* ═══════════════════════════════════════════
   LOGIN PAGE
   ═══════════════════════════════════════════ */
export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

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
    if (!password) {
      setError('Password is required');
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        triggerShake();
        toast.error(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      toast.success('Welcome back!');

      const role = data.role || data.user?.role;
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
      triggerShake();
      toast.error('Connection error');
      setLoading(false);
    }
  };

  const inputBase =
    'w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3.5 text-[#F0F4FF] font-dm-sans placeholder:text-[rgba(240,244,255,0.3)] focus:outline-none focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/25 transition-all duration-300';

  const currencies = [
    { symbol: '$', x: '8%', y: '12%', delay: 0, duration: 14, fontSize: 48 },
    { symbol: '€', x: '82%', y: '8%', delay: 1.5, duration: 12, fontSize: 40 },
    { symbol: '£', x: '15%', y: '75%', delay: 3, duration: 16, fontSize: 36 },
    { symbol: '¥', x: '88%', y: '70%', delay: 0.8, duration: 13, fontSize: 44 },
    { symbol: '₿', x: '45%', y: '5%', delay: 2.2, duration: 15, fontSize: 32 },
    { symbol: '₹', x: '70%', y: '85%', delay: 4, duration: 11, fontSize: 38 },
    { symbol: '₩', x: '25%', y: '90%', delay: 1, duration: 14, fontSize: 34 },
    { symbol: '₣', x: '92%', y: '40%', delay: 2.8, duration: 12, fontSize: 30 },
    { symbol: 'Ξ', x: '5%', y: '45%', delay: 3.5, duration: 13, fontSize: 36 },
    { symbol: '₮', x: '55%', y: '92%', delay: 0.5, duration: 15, fontSize: 28 },
    { symbol: '฿', x: '35%', y: '15%', delay: 4.5, duration: 14, fontSize: 32 },
    { symbol: '₴', x: '75%', y: '30%', delay: 2, duration: 11, fontSize: 30 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050A14] relative overflow-hidden px-4">
      {/* Floating currency symbols */}
      {currencies.map((c, i) => (
        <FloatingCurrency key={i} {...c} />
      ))}

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#00D4FF]/[0.02] blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#7B5EA7]/[0.03] blur-[80px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-[#FFD700]/[0.015] blur-[80px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Main card */}
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
          {/* Glow border */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#00D4FF]/20 via-transparent to-[#7B5EA7]/20 -z-10 blur-sm" />

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00D4FF]/15 to-[#7B5EA7]/15 border border-[#00D4FF]/25 flex items-center justify-center mb-5"
            >
              <Fingerprint className="w-10 h-10 text-[#00D4FF]" />
            </motion.div>

            <h1 className="text-2xl font-sora font-bold text-[#F0F4FF]">
              Welcome Back
            </h1>
            <p className="text-sm text-[rgba(240,244,255,0.55)] font-dm-sans mt-1">
              Sign in to your{' '}
              <span className="text-[#00D4FF]">NexaVault</span> account
            </p>
          </div>

          {/* Error banner */}
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
                  <p className="text-sm text-red-400 font-dm-sans">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-dm-sans text-[rgba(240,244,255,0.55)]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(240,244,255,0.35)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="john@example.com"
                  className={`${inputBase} pl-10`}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-dm-sans text-[rgba(240,244,255,0.55)]">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs text-[#7B5EA7] hover:text-[#00D4FF] font-dm-sans transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(240,244,255,0.35)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your password"
                  className={`${inputBase} pl-10 pr-10`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgba(240,244,255,0.35)] hover:text-[#00D4FF] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${
                    rememberMe
                      ? 'bg-[#00D4FF] border-[#00D4FF]'
                      : 'border-[rgba(255,255,255,0.15)] group-hover:border-[#00D4FF]/40'
                  }`}
                >
                  <AnimatePresence>
                    {rememberMe && (
                      <motion.svg
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ pathLength: 0, opacity: 0 }}
                        className="w-3 h-3 text-[#050A14]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <motion.polyline
                          points="20 6 9 17 4 12"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <span className="text-sm text-[rgba(240,244,255,0.55)] font-dm-sans">
                Remember me for 30 days
              </span>
            </label>

            {/* Submit */}
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
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
            <span className="text-xs text-[rgba(240,244,255,0.3)] font-dm-sans">
              OR
            </span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
          </div>

          {/* Social placeholder */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-sm text-[rgba(240,244,255,0.6)] font-dm-sans hover:border-[#00D4FF]/20 hover:bg-[rgba(0,212,255,0.04)] transition-all duration-300"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-[rgba(240,244,255,0.55)] font-dm-sans mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-[#00D4FF] font-medium hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
