'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  KeyRound,
  Timer,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── floating particle ─── */
function Particle({
  delay,
  x,
  y,
  size,
}: {
  delay: number;
  x: string;
  y: string;
  size: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-[#00D4FF]"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{
        y: [0, -40, 0],
        opacity: [0, 0.4, 0],
        scale: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

/* ─── main OTP content (uses useSearchParams) ─── */
function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const generatedOtp = searchParams.get('otp') || '123456';

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* format OTP for display */
  const formattedOtp = `${generatedOtp.slice(0, 3)}-${generatedOtp.slice(3, 6)}`;

  /* countdown timer */
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  /* input handlers */
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6 - index);
      digits.split('').forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIdx = Math.min(index + digits.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 0) return;
    const newOtp = [...otp];
    pasted.split('').forEach((d, i) => {
      if (i < 6) newOtp[i] = d;
    });
    setOtp(newOtp);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  /* submit */
  const handleSubmit = useCallback(async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Invalid OTP');
        setShake(true);
        setTimeout(() => setShake(false), 600);
        setLoading(false);
        return;
      }

      setVerified(true);
      toast.success('Identity verified! Signing you in...');
      const role = data.user?.role || 'user';
      setTimeout(() => router.push(role === 'admin' ? '/admin/dashboard' : '/dashboard'), 2000);
    } catch {
      toast.error('Verification failed. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setLoading(false);
    }
  }, [otp, email, router]);

  /* auto-submit when all digits entered */
  useEffect(() => {
    if (otp.every((d) => d !== '') && !loading && !verified) {
      handleSubmit();
    }
  }, [otp, loading, verified, handleSubmit]);

  /* resend */
  const handleResend = async () => {
    try {
      toast.loading('Resending OTP...', { id: 'resend' });
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resend: true }),
      });
      toast.success('New OTP sent!', { id: 'resend' });
      setTimeLeft(600);
      setCanResend(false);
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch {
      toast.error('Failed to resend OTP', { id: 'resend' });
    }
  };

  const copyOtp = () => {
    navigator.clipboard.writeText(generatedOtp);
    toast.success('OTP copied to clipboard');
  };

  const timerPercent = (timeLeft / 600) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050A14] relative overflow-hidden px-4">
      {/* Background particles */}
      <Particle delay={0} x="10%" y="20%" size={4} />
      <Particle delay={1} x="85%" y="15%" size={3} />
      <Particle delay={2} x="20%" y="75%" size={5} />
      <Particle delay={3} x="70%" y="80%" size={3} />
      <Particle delay={0.5} x="50%" y="10%" size={4} />
      <Particle delay={1.5} x="90%" y="50%" size={3} />
      <Particle delay={2.5} x="5%" y="55%" size={4} />
      <Particle delay={4} x="40%" y="90%" size={3} />

      {/* Radial glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00D4FF]/[0.03] blur-[100px]" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-[#7B5EA7]/[0.04] blur-[80px]" />
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          x: shake ? [0, -10, 10, -10, 10, -5, 5, 0] : 0,
        }}
        transition={
          shake
            ? { duration: 0.5, ease: 'easeInOut' }
            : { duration: 0.7, ease: 'easeOut' }
        }
        className="relative w-full max-w-md z-10"
      >
        <div className="rounded-2xl border border-[rgba(0,212,255,0.15)] bg-[rgba(255,255,255,0.05)] backdrop-blur-xl p-8 shadow-[0_0_80px_rgba(0,212,255,0.06)]">
          {/* Glow accent */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#00D4FF]/20 via-transparent to-[#7B5EA7]/20 -z-10 blur-sm" />

          {/* Icon */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={
                verified
                  ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
                  : { y: [0, -8, 0] }
              }
              transition={{
                duration: verified ? 0.6 : 3,
                repeat: verified ? 0 : Infinity,
                ease: 'easeInOut',
              }}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 border ${
                verified
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-gradient-to-br from-[#00D4FF]/15 to-[#7B5EA7]/15 border-[#00D4FF]/25'
              }`}
            >
              {verified ? (
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              ) : (
                <ShieldCheck className="w-10 h-10 text-[#00D4FF]" />
              )}
            </motion.div>

            <h1 className="text-2xl font-sora font-bold text-[#F0F4FF]">
              {verified ? 'Verified!' : 'Verify Your Identity'}
            </h1>
            <p className="text-sm text-[rgba(240,244,255,0.55)] font-dm-sans mt-2 text-center max-w-xs">
              {verified
                ? 'Signing you in...'
                : email
                  ? `We sent a verification code to ${email}`
                  : 'Enter the 6-digit code to continue'}
            </p>
          </div>

          {!verified && (
            <>
              {/* Demo OTP reveal box */}
              <div className="mb-6 rounded-xl bg-gradient-to-r from-[#FFD700]/[0.06] to-[#FFD700]/[0.02] border border-[#FFD700]/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#FFD700]" />
                    <span className="text-xs font-dm-sans text-[#FFD700]/80 uppercase tracking-wider">
                      Your Generated OTP
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowOtp((v) => !v)}
                      className="p-1 rounded-md hover:bg-[rgba(255,255,255,0.05)] text-[#FFD700]/60 hover:text-[#FFD700] transition-colors"
                    >
                      {showOtp ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={copyOtp}
                      className="p-1 rounded-md hover:bg-[rgba(255,255,255,0.05)] text-[#FFD700]/60 hover:text-[#FFD700] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <AnimatePresence mode="wait">
                    {showOtp ? (
                      <motion.p
                        key="visible"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-2xl font-mono font-bold tracking-[0.3em] text-[#FFD700]"
                      >
                        {formattedOtp}
                      </motion.p>
                    ) : (
                      <motion.p
                        key="hidden"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-2xl font-mono font-bold tracking-[0.3em] text-[#FFD700]/50"
                      >
                        ***-***
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <p className="text-[10px] text-[#FFD700]/40 font-dm-sans mt-1">
                    Demo mode — OTP displayed for testing
                  </p>
                </div>
              </div>

              {/* OTP inputs */}
              <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <input
                      ref={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className={`w-12 h-14 text-center text-xl font-mono font-bold rounded-xl border-2 bg-[rgba(255,255,255,0.04)] text-[#F0F4FF] focus:outline-none transition-all duration-300 ${
                        digit
                          ? 'border-[#00D4FF]/50 shadow-[0_0_15px_rgba(0,212,255,0.15)]'
                          : 'border-[rgba(255,255,255,0.1)] focus:border-[#00D4FF]/40'
                      }`}
                    />
                    {/* Divider after 3rd digit */}
                    {i === 2 && (
                      <div className="hidden" />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Timer */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-[rgba(240,244,255,0.4)]" />
                  <span
                    className={`text-sm font-mono ${
                      timeLeft <= 60
                        ? 'text-red-400'
                        : 'text-[rgba(240,244,255,0.55)]'
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    animate={{
                      width: `${timerPercent}%`,
                      backgroundColor:
                        timeLeft <= 60
                          ? '#EF4444'
                          : timeLeft <= 180
                            ? '#F59E0B'
                            : '#00D4FF',
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Verify button */}
              <motion.button
                onClick={handleSubmit}
                disabled={loading || otp.some((d) => !d)}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3.5 rounded-xl font-sora font-semibold text-sm text-[#050A14] bg-gradient-to-r from-[#00D4FF] to-[#00D4FF]/80 hover:shadow-[0_0_30px_rgba(0,212,255,0.35)] transition-shadow duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="w-5 h-5 border-2 border-[#050A14]/30 border-t-[#050A14] rounded-full"
                  />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verify Identity
                  </>
                )}
              </motion.button>

              {/* Resend */}
              <div className="text-center mt-5">
                {canResend ? (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleResend}
                    className="flex items-center gap-2 mx-auto text-sm text-[#00D4FF] font-dm-sans hover:underline transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Resend verification code
                  </motion.button>
                ) : (
                  <p className="text-xs text-[rgba(240,244,255,0.35)] font-dm-sans flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    You can resend after the timer expires
                  </p>
                )}
              </div>
            </>
          )}

          {/* Success state */}
          {verified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </motion.div>
              <p className="text-sm text-[rgba(240,244,255,0.55)] font-dm-sans">
                Signing you in...
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   VERIFY OTP PAGE — wrapped in Suspense
   ═══════════════════════════════════════════ */
export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#050A14]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-[#00D4FF]/30 border-t-[#00D4FF] rounded-full"
          />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
