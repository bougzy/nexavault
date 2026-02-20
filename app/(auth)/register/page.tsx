'use client';

import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  Check,
  X,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── country codes ─── */
const countryCodes = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+55', country: 'BR', flag: '🇧🇷' },
  { code: '+234', country: 'NG', flag: '🇳🇬' },
  { code: '+27', country: 'ZA', flag: '🇿🇦' },
  { code: '+971', country: 'AE', flag: '🇦🇪' },
  { code: '+65', country: 'SG', flag: '🇸🇬' },
  { code: '+82', country: 'KR', flag: '🇰🇷' },
  { code: '+52', country: 'MX', flag: '🇲🇽' },
];

/* ─── password strength helper ─── */
function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: '#EF4444', width: '33%' };
  if (score <= 4) return { label: 'Medium', color: '#F59E0B', width: '66%' };
  return { label: 'Strong', color: '#22C55E', width: '100%' };
}

/* ─── floating shape (memoized) ─── */
const FloatingShape = memo(function FloatingShape({
  delay,
  size,
  x,
  y,
  color,
}: {
  delay: number;
  size: number;
  x: string;
  y: string;
  color: string;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: color,
        filter: 'blur(60px)',
      }}
      animate={{
        y: [0, -30, 0, 30, 0],
        x: [0, 20, 0, -20, 0],
        scale: [1, 1.2, 1, 0.9, 1],
        opacity: [0.3, 0.6, 0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
});

/* ═══════════════════════════════════════════
   REGISTER PAGE
   ═══════════════════════════════════════════ */
export default function RegisterPage() {
  const router = useRouter();

  /* form state */
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = getPasswordStrength(password);
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  /* close country dropdown on outside click */
  useEffect(() => {
    const handler = () => setShowCountryDropdown(false);
    if (showCountryDropdown) {
      window.addEventListener('click', handler);
      return () => window.removeEventListener('click', handler);
    }
  }, [showCountryDropdown]);

  /* validation */
  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Invalid email address';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{7,15}$/.test(phone.replace(/\s/g, '')))
      errs.phone = 'Invalid phone number';
    if (!address.trim()) errs.address = 'Address is required';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8)
      errs.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    if (!agreedToTerms) errs.terms = 'You must accept the terms';
    return errs;
  }, [fullName, email, phone, address, password, confirmPassword, agreedToTerms]);

  /* submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          phone: `${countryCode}${phone}`,
          address,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      toast.success('Account created successfully!');
      const otp = data.otp || '123456';
      router.push(
        `/verify-otp?email=${encodeURIComponent(email)}&otp=${otp}`
      );
    } catch {
      toast.error('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  /* ─── input wrapper ─── */
  const InputWrapper = ({
    children,
    label,
    error,
  }: {
    children: React.ReactNode;
    label: string;
    error?: string;
  }) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-dm-sans text-[rgba(240,244,255,0.55)]">
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-400 font-dm-sans"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );

  const inputBase =
    'w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-[#F0F4FF] font-dm-sans placeholder:text-[rgba(240,244,255,0.3)] focus:outline-none focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/25 transition-all duration-300';

  const decorativePanel = useMemo(() => (
    <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 30% 40%, rgba(0,212,255,0.15), transparent 60%), radial-gradient(circle at 70% 60%, rgba(123,94,167,0.15), transparent 60%)',
              'radial-gradient(circle at 60% 30%, rgba(123,94,167,0.15), transparent 60%), radial-gradient(circle at 40% 70%, rgba(0,212,255,0.15), transparent 60%)',
              'radial-gradient(circle at 30% 40%, rgba(0,212,255,0.15), transparent 60%), radial-gradient(circle at 70% 60%, rgba(123,94,167,0.15), transparent 60%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <FloatingShape delay={0} size={200} x="15%" y="20%" color="rgba(0,212,255,0.08)" />
      <FloatingShape delay={2} size={150} x="60%" y="60%" color="rgba(123,94,167,0.1)" />
      <FloatingShape delay={4} size={120} x="75%" y="15%" color="rgba(255,215,0,0.06)" />
      <FloatingShape delay={1} size={180} x="30%" y="70%" color="rgba(0,212,255,0.06)" />
      <FloatingShape delay={3} size={100} x="50%" y="35%" color="rgba(123,94,167,0.08)" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="relative z-10 text-center px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#00D4FF]/10 to-[#7B5EA7]/10 border border-[#00D4FF]/20 mb-8"
          >
            <Shield className="w-12 h-12 text-[#00D4FF]" />
          </motion.div>
          <h2 className="text-3xl font-sora font-bold text-[#F0F4FF] mb-4">Bank-Grade Security</h2>
          <p className="text-[rgba(240,244,255,0.55)] font-dm-sans max-w-sm mx-auto leading-relaxed">
            Your financial data is protected with state-of-the-art encryption and multi-factor authentication.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['256-bit Encryption', 'Biometric Auth', 'Real-time Alerts'].map((feat, i) => (
              <motion.div
                key={feat}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.15 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-sm text-[rgba(240,244,255,0.7)] font-dm-sans"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                {feat}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  ), []);

  return (
    <div className="min-h-screen flex bg-[#050A14] overflow-hidden">
      {/* ── LEFT: Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-lg"
        >
          {/* Glass card */}
          <div className="relative rounded-2xl border border-[rgba(0,212,255,0.15)] bg-[rgba(255,255,255,0.05)] backdrop-blur-xl p-8 shadow-[0_0_60px_rgba(0,212,255,0.08)]">
            {/* Glow border accent */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#00D4FF]/20 via-transparent to-[#7B5EA7]/20 -z-10 blur-sm" />

            {/* Animated lock header */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 4 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D4FF]/20 to-[#7B5EA7]/20 border border-[#00D4FF]/30 flex items-center justify-center mb-4"
              >
                <Lock className="w-8 h-8 text-[#00D4FF]" />
              </motion.div>
              <h1 className="text-2xl font-sora font-bold text-[#F0F4FF]">
                Create Your Account
              </h1>
              <p className="text-sm text-[rgba(240,244,255,0.55)] font-dm-sans mt-1">
                Join <span className="text-[#00D4FF]">NexaVault</span> — secure
                digital banking
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <InputWrapper label="Full Name" error={errors.fullName}>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(240,244,255,0.35)]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className={`${inputBase} pl-10`}
                  />
                </div>
              </InputWrapper>

              {/* Phone */}
              <InputWrapper label="Phone Number" error={errors.phone}>
                <div className="flex gap-2">
                  {/* Country code selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCountryDropdown((v) => !v);
                      }}
                      className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-3 text-[#F0F4FF] text-sm font-dm-sans hover:border-[#00D4FF]/30 transition-all duration-300 min-w-[90px]"
                    >
                      <span>
                        {countryCodes.find((c) => c.code === countryCode)
                          ?.flag || '🌐'}
                      </span>
                      <span>{countryCode}</span>
                      <ChevronDown className="w-3 h-3 text-[rgba(240,244,255,0.4)]" />
                    </button>
                    <AnimatePresence>
                      {showCountryDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute top-full left-0 mt-1 w-48 max-h-52 overflow-y-auto bg-[#0D1520] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-xl z-50 scrollbar-thin"
                        >
                          {countryCodes.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setCountryCode(c.code);
                                setShowCountryDropdown(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#F0F4FF] font-dm-sans hover:bg-[rgba(0,212,255,0.1)] transition-colors"
                            >
                              <span>{c.flag}</span>
                              <span className="text-[rgba(240,244,255,0.55)]">
                                {c.country}
                              </span>
                              <span>{c.code}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(240,244,255,0.35)]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/[^0-9\s]/g, ''))
                      }
                      placeholder="123 456 7890"
                      className={`${inputBase} pl-10`}
                    />
                  </div>
                </div>
              </InputWrapper>

              {/* Email */}
              <InputWrapper label="Email Address" error={errors.email}>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(240,244,255,0.35)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className={`${inputBase} pl-10`}
                  />
                </div>
              </InputWrapper>

              {/* Address */}
              <InputWrapper label="Address" error={errors.address}>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-[rgba(240,244,255,0.35)]" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City, Country"
                    className={`${inputBase} pl-10`}
                  />
                </div>
              </InputWrapper>

              {/* Password */}
              <InputWrapper label="Password" error={errors.password}>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(240,244,255,0.35)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className={`${inputBase} pl-10 pr-10`}
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
                {/* Strength meter */}
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 space-y-1"
                  >
                    <div className="h-1.5 w-full rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: strength.width,
                          backgroundColor: strength.color,
                        }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                    <p
                      className="text-xs font-dm-sans"
                      style={{ color: strength.color }}
                    >
                      {strength.label}
                    </p>
                  </motion.div>
                )}
              </InputWrapper>

              {/* Confirm Password */}
              <InputWrapper
                label="Confirm Password"
                error={errors.confirmPassword}
              >
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(240,244,255,0.35)]" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={`${inputBase} pl-10 pr-16`}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {passwordsMatch && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Check className="w-4 h-4 text-green-400" />
                      </motion.div>
                    )}
                    {passwordsMismatch && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </motion.div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="text-[rgba(240,244,255,0.35)] hover:text-[#00D4FF] transition-colors"
                    >
                      {showConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </InputWrapper>

              {/* Terms */}
              <div className="space-y-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${
                        agreedToTerms
                          ? 'bg-[#00D4FF] border-[#00D4FF]'
                          : 'border-[rgba(255,255,255,0.15)] group-hover:border-[#00D4FF]/40'
                      }`}
                    >
                      {agreedToTerms && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check className="w-3 h-3 text-[#050A14]" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-[rgba(240,244,255,0.55)] font-dm-sans">
                    I agree to the{' '}
                    <span className="text-[#00D4FF] hover:underline cursor-pointer">
                      Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="text-[#00D4FF] hover:underline cursor-pointer">
                      Privacy Policy
                    </span>
                  </span>
                </label>
                {errors.terms && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-400 font-dm-sans"
                  >
                    {errors.terms}
                  </motion.p>
                )}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full relative py-3.5 rounded-xl font-sora font-semibold text-sm text-[#050A14] bg-gradient-to-r from-[#00D4FF] to-[#00D4FF]/80 hover:shadow-[0_0_30px_rgba(0,212,255,0.35)] transition-shadow duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-[#050A14]/30 border-t-[#050A14] rounded-full"
                  />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer link */}
            <p className="text-center text-sm text-[rgba(240,244,255,0.55)] font-dm-sans mt-6">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#00D4FF] font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT: Decorative panel (memoized) ── */}
      {decorativePanel}
    </div>
  );
}
