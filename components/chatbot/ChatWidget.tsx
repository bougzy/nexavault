'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, RefreshCw, Clock, User, Bot, ShieldCheck, LogIn } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ChatMessage {
  _id: string;
  senderId: string;
  senderRole: 'user' | 'admin' | 'bot';
  content: string;
  createdAt: string;
  isBot?: boolean;
}

interface GuestInfo {
  name: string;
  email: string;
}

type AuthStatus = 'checking' | 'authenticated' | 'guest';

// ─── Smart Bot Response Engine v2 ───────────────────────────────────────────────

interface SmartCategory {
  name: string;
  keywords: string[];
  responses: string[];
  priority?: number; // higher = checked first
}

const SMART_CATEGORIES: SmartCategory[] = [
  {
    name: 'greeting',
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'sup', 'whats up', "what's up", 'yo'],
    responses: [
      'Hello! Welcome to NexaVault. How can I assist you today? I can help with account info, grants, donations, or general support.',
      'Hi there! I\'m your NexaVault assistant. What can I help you with today?',
      'Hey! Welcome to NexaVault support. Feel free to ask me anything about your account, grants, transfers, or security.',
    ],
    priority: 1,
  },
  {
    name: 'goodbye',
    keywords: ['bye', 'goodbye', 'see you', 'later', 'take care', 'goodnight', 'good night', 'gotta go'],
    responses: [
      'Goodbye! Feel free to reach out anytime you need help. Have a great day!',
      'Take care! NexaVault support is always here when you need us.',
      'See you later! Don\'t hesitate to come back if you have more questions.',
    ],
    priority: 1,
  },
  {
    name: 'thanks',
    keywords: ['thank', 'thanks', 'awesome', 'great', 'perfect', 'appreciate', 'helpful', 'nice'],
    responses: [
      'You\'re welcome! Is there anything else I can help you with today?',
      'Happy to help! Let me know if you need anything else.',
      'Glad I could assist! Don\'t hesitate to ask if you have more questions.',
      'Anytime! That\'s what I\'m here for.',
    ],
    priority: 1,
  },
  {
    name: 'balance',
    keywords: ['balance', 'account balance', 'how much', 'money', 'funds', 'available'],
    responses: [
      'Your balance is displayed on your Dashboard. For any balance inquiries or adjustments, our admin team is available to assist you.',
      'You can check your current balance on your Dashboard page. If you need help with balance adjustments, our support team can help.',
      'Head over to your Dashboard to see your account balance. For discrepancies, contact our admin team through this chat.',
    ],
    priority: 2,
  },
  {
    name: 'account',
    keywords: ['account', 'my account', 'account info', 'account details', 'open account', 'close account', 'account number'],
    responses: [
      'Your account details are available on the Dashboard. You can view and update your profile from the Settings page.',
      'For account-related inquiries, visit your Dashboard or Settings page. If you need further assistance, our admin team is here to help.',
    ],
    priority: 2,
  },
  {
    name: 'grants',
    keywords: ['grant', 'funding', 'loan', 'apply', 'application', 'scholarship', 'financial aid'],
    responses: [
      'NexaVault offers 6 grant categories: Business, Individual, Office Capital, General, School, and Women Empowerment grants. Visit our Grants page to explore them!',
      'We have multiple grant programs available. Check out the Grants page for eligibility details and how to apply.',
      'Looking for financial support? Our Grants page has all the details on our Business, Individual, School, and Women Empowerment programs.',
    ],
    priority: 2,
  },
  {
    name: 'donation',
    keywords: ['donate', 'donation', 'charity', 'give', 'contribute', 'philanthropy'],
    responses: [
      'You can make donations through our Donate page. We accept multiple currencies and crypto. Every donation is tracked transparently.',
      'Want to make a difference? Visit our Donate page to contribute. We support 25+ currencies and provide full transparency.',
      'Donations are easy through NexaVault. Head to the Donate page to get started — we accept fiat and crypto.',
    ],
    priority: 2,
  },
  {
    name: 'password',
    keywords: ['password', "can't login", 'cant login', 'forgot', 'reset password', 'change password', 'locked out', 'credentials'],
    responses: [
      'For password issues, please ensure you\'re using the correct email. If you continue to have trouble, our admin team can help reset your credentials.',
      'Having trouble logging in? Double-check your email address. If the issue persists, reach out to our admin team for a password reset.',
      'If you\'ve forgotten your password, contact our support team through this chat and they\'ll help you regain access.',
    ],
    priority: 2,
  },
  {
    name: 'security',
    keywords: ['security', 'safe', 'hack', 'fraud', 'phishing', 'scam', 'protect', 'encryption', '2fa', 'two factor'],
    responses: [
      'Your security is our top priority. NexaVault uses 256-bit AES encryption, real-time fraud detection, and biometric authentication. All transactions are monitored 24/7.',
      'We take security seriously — 256-bit encryption, fraud detection, and continuous monitoring keep your account safe. Report any suspicious activity immediately.',
      'NexaVault employs bank-grade security: AES-256 encryption, 24/7 fraud monitoring, and multi-factor authentication to protect your funds.',
    ],
    priority: 3,
  },
  {
    name: 'transfer',
    keywords: ['transfer', 'send money', 'withdraw', 'deposit', 'wire', 'payment', 'transaction'],
    responses: [
      'Deposits and withdrawals are managed by our admin team for enhanced security. Contact support through this chat, and an admin will process your request.',
      'For transfers and payments, please reach out through this chat. Our admin team handles all transactions to ensure maximum security.',
      'Need to make a transaction? Send us the details here and our admin team will handle it securely and promptly.',
    ],
    priority: 2,
  },
  {
    name: 'help',
    keywords: ['help', 'support', 'human', 'agent', 'speak', 'talk to', 'real person', 'customer service', 'escalate'],
    responses: [
      'I\'m here to help! For complex issues, I\'ll notify our admin team who will respond shortly. Can you describe your issue in more detail?',
      'I\'ll do my best to assist you! If you need a human agent, just say so and our admin team will be notified to jump in.',
      'Our support team monitors this chat. If you need a real person, they\'ll see your messages and respond. What can I help with in the meantime?',
    ],
    priority: 2,
  },
  {
    name: 'fees',
    keywords: ['fee', 'charge', 'cost', 'price', 'pricing', 'rate', 'commission', 'free'],
    responses: [
      'NexaVault offers competitive rates. Account maintenance is free, and transaction fees vary by type. Visit our FAQ page for detailed pricing.',
      'Good news — basic accounts are free! Transaction fees depend on the type and amount. Check the FAQ page for a full breakdown.',
    ],
    priority: 2,
  },
  {
    name: 'currency',
    keywords: ['currency', 'exchange', 'convert', 'crypto', 'bitcoin', 'usd', 'eur', 'forex'],
    responses: [
      'We support 25+ currencies including USD, EUR, GBP, JPY, and popular cryptocurrencies. Manage your currencies through Dashboard settings.',
      'NexaVault supports fiat and crypto currencies. You can set your preferred currency in your account settings.',
    ],
    priority: 2,
  },
  {
    name: 'profile',
    keywords: ['profile', 'settings', 'update', 'edit profile', 'change name', 'change email', 'preferences', 'theme', 'dark mode', 'light mode', 'language'],
    responses: [
      'You can update your profile and preferences from the Settings page on your Dashboard. This includes theme, language, and personal details.',
      'Head to Settings to customize your experience — change your theme, language, name, and other preferences.',
      'Your profile is fully customizable! Visit Dashboard > Settings to update your personal info and preferences.',
    ],
    priority: 2,
  },
  {
    name: 'status',
    keywords: ['status', 'pending', 'verified', 'verification', 'activate', 'suspended', 'blocked', 'inactive'],
    responses: [
      'Your account status is shown on your Dashboard. If your account is pending, please complete email verification. For suspended accounts, contact admin support.',
      'Account statuses include: Pending (verify email), Active (fully operational), and Suspended (contact admin). Check your Dashboard for current status.',
    ],
    priority: 2,
  },
  {
    name: 'complaint',
    keywords: ['complaint', 'issue', 'problem', 'bug', 'error', 'not working', 'broken', 'wrong', 'terrible', 'bad experience', 'frustrated'],
    responses: [
      'I\'m sorry to hear you\'re having trouble. Please describe the issue in detail, and I\'ll make sure our admin team addresses it promptly.',
      'We take all feedback seriously. Please share the details of your issue, and our support team will look into it right away.',
      'I apologize for the inconvenience. Let me know exactly what went wrong and I\'ll escalate this to our admin team immediately.',
    ],
    priority: 3,
  },
];

const DEFAULT_RESPONSES = [
  "Thank you for your message. I'll make sure our support team sees this. You can ask me about accounts, grants, donations, security, or transfers.",
  "I'm not sure I fully understand, but I'm here to help! Try asking about your balance, grants, donations, security, or transfers.",
  "That's an interesting question! For the best answer, our admin team will review your message. In the meantime, feel free to ask about common topics like grants, account info, or security.",
  "I appreciate your message! While I work on understanding it better, you can also try asking about specific topics like grants, donations, or your account.",
  "Got it! I've logged your message for our support team. Is there anything specific I can help with — like account info, grants, or security?",
];

const CONTINUATION_PHRASES = ['tell me more', 'more info', 'explain', 'go on', 'continue', 'what else', 'elaborate', 'details', 'more about', 'expand on'];

// Lightweight Levenshtein distance for typo tolerance
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function fuzzyMatch(word: string, keyword: string): number {
  // Exact substring match
  if (word.includes(keyword) || keyword.includes(word)) return 1.0;
  // Levenshtein for short keywords (typo tolerance)
  if (keyword.length >= 3 && word.length >= 3) {
    const dist = levenshtein(word, keyword);
    const maxLen = Math.max(word.length, keyword.length);
    const similarity = 1 - dist / maxLen;
    if (similarity >= 0.7) return 0.5;
  }
  return 0;
}

function getSmartResponse(message: string, lastCategory: string | null): { response: string; category: string | null } {
  const lower = message.toLowerCase().trim();
  const words = lower.split(/\s+/);

  // Check for continuation phrases
  const isContinuation = CONTINUATION_PHRASES.some((p) => lower.includes(p));
  if (isContinuation && lastCategory) {
    const cat = SMART_CATEGORIES.find((c) => c.name === lastCategory);
    if (cat) {
      // Pick a different response from the same category
      const resp = cat.responses[Math.floor(Math.random() * cat.responses.length)];
      return { response: resp, category: lastCategory };
    }
  }

  // Score each category
  const scores: { category: SmartCategory; score: number }[] = [];
  for (const cat of SMART_CATEGORIES) {
    let totalScore = 0;
    for (const keyword of cat.keywords) {
      const kWords = keyword.split(/\s+/);
      // Multi-word keyword: check if all words present
      if (kWords.length > 1 && lower.includes(keyword)) {
        totalScore += 1.5;
        continue;
      }
      // Single word matching
      for (const w of words) {
        const score = fuzzyMatch(w, keyword);
        if (score > 0) totalScore += score;
      }
    }
    // Apply priority weighting
    totalScore *= (cat.priority || 1);
    if (totalScore > 0) scores.push({ category: cat, score: totalScore });
  }

  if (scores.length > 0) {
    scores.sort((a, b) => b.score - a.score);
    const best = scores[0];
    const resp = best.category.responses[Math.floor(Math.random() * best.category.responses.length)];
    return { response: resp, category: best.category.name };
  }

  // Default fallback with variety
  const defaultIdx = Math.floor(Math.random() * DEFAULT_RESPONSES.length);
  return { response: DEFAULT_RESPONSES[defaultIdx], category: null };
}

function generateId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getRandomDelay(): number {
  return 500 + Math.random() * 300;
}

// ─── Typing Indicator Component ─────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex gap-2"
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex-shrink-0 flex items-center justify-center">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-white/5 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
        <motion.span
          className="w-2 h-2 rounded-full bg-cyan-400/70"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="w-2 h-2 rounded-full bg-cyan-400/70"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
        />
        <motion.span
          className="w-2 h-2 rounded-full bg-cyan-400/70"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
        />
      </div>
    </motion.div>
  );
}

// ─── Main Widget ────────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const pathname = usePathname();

  // ── Auth state ──
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [guestFormName, setGuestFormName] = useState('');
  const [guestFormEmail, setGuestFormEmail] = useState('');

  // ── Chat state ──
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [timedOut, setTimedOut] = useState(false);
  const [showRestart, setShowRestart] = useState(false);
  const [restartName, setRestartName] = useState('');
  const [restartEmail, setRestartEmail] = useState('');
  const [pulse, setPulse] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [newMessageFlash, setNewMessageFlash] = useState(false);

  // ── Refs ──
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivity = useRef(Date.now());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastBotCategory = useRef<string | null>(null);

  // ────────────────────── Helpers ──────────────────────

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  const flashNewMessage = useCallback(() => {
    setNewMessageFlash(true);
    setTimeout(() => setNewMessageFlash(false), 600);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    lastActivity.current = Date.now();
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (!timedOut) {
      inactivityTimer.current = setTimeout(() => {
        setTimedOut(true);
      }, 5 * 60 * 1000);
    }
  }, [timedOut]);

  // ────────────────────── Auth Check (re-checks on route changes) ──────────────

  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (!cancelled) {
          if (res.ok) {
            setAuthStatus('authenticated');
          } else {
            setAuthStatus('guest');
          }
        }
      } catch {
        if (!cancelled) {
          setAuthStatus('guest');
        }
      }
    };
    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [pathname]); // Re-check auth whenever route changes

  // ────────────────────── Smart Bot Response ──────────────────────

  const addBotResponse = useCallback(
    (userMessage: string) => {
      setIsTyping(true);
      scrollToBottom();

      const delay = getRandomDelay();
      setTimeout(() => {
        const { response, category } = getSmartResponse(userMessage, lastBotCategory.current);
        lastBotCategory.current = category;
        const botReply: ChatMessage = {
          _id: generateId(),
          senderId: 'bot',
          senderRole: 'bot',
          content: response,
          createdAt: new Date().toISOString(),
          isBot: true,
        };
        setMessages((prev) => [...prev, botReply]);
        setIsTyping(false);
        flashNewMessage();
        scrollToBottom();
      }, delay);
    },
    [scrollToBottom, flashNewMessage]
  );

  // ────────────────────── API-backed messaging (authenticated users) ──────────

  const fetchMessages = useCallback(async () => {
    if (authStatus !== 'authenticated') return;
    try {
      const res = await fetch('/api/chat/messages');
      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setMessages((prev) => {
            const botMessages = prev.filter((m) => m.isBot);
            const apiMessages: ChatMessage[] = data.messages.map(
              (m: ChatMessage) => ({
                ...m,
                isBot: false,
              })
            );
            const merged = [...apiMessages, ...botMessages].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
            return merged;
          });
        }
      }
    } catch {
      // Silently fail - will retry on next poll
    }
  }, [authStatus]);

  const sendMessageToAPI = useCallback(
    async (content: string) => {
      try {
        const res = await fetch('/api/chat/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, sessionId }),
        });
        if (res.ok) {
          await fetchMessages();
        }
      } catch {
        // Silently fail - bot response still works
      }
    },
    [sessionId, fetchMessages]
  );

  // ────────────────────── Send Message Handler ──────────────────────

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || timedOut) return;

    setLoading(true);
    resetInactivityTimer();

    const userMsg: ChatMessage = {
      _id: generateId(),
      senderId: 'user',
      senderRole: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    if (authStatus === 'authenticated') {
      setInput('');
      await sendMessageToAPI(trimmed);
      addBotResponse(trimmed);
    } else {
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      scrollToBottom();
      addBotResponse(trimmed);
    }

    setLoading(false);
  }, [
    input,
    loading,
    timedOut,
    authStatus,
    resetInactivityTimer,
    sendMessageToAPI,
    addBotResponse,
    scrollToBottom,
  ]);

  // ────────────────────── Polling for authenticated users ──────────

  useEffect(() => {
    if (isOpen && !timedOut && authStatus === 'authenticated') {
      fetchMessages();
      pollingIntervalRef.current = setInterval(fetchMessages, 5000);
      resetInactivityTimer();
      return () => {
        if (pollingIntervalRef.current)
          clearInterval(pollingIntervalRef.current);
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      };
    }
    if (isOpen && !timedOut && authStatus === 'guest' && guestInfo) {
      resetInactivityTimer();
      return () => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      };
    }
  }, [isOpen, timedOut, authStatus, guestInfo, fetchMessages, resetInactivityTimer]);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  // ────────────────────── Restart Conversation ──────────────────────

  const handleRestart = useCallback(async () => {
    if (authStatus === 'authenticated') {
      setTimedOut(false);
      setShowRestart(false);
      setMessages([]);
      setSessionId(crypto.randomUUID());
      resetInactivityTimer();
      fetchMessages();
    } else {
      if (!restartName.trim() || !restartEmail.trim()) return;
      setGuestInfo({ name: restartName.trim(), email: restartEmail.trim() });
      setTimedOut(false);
      setShowRestart(false);
      setMessages([]);
      setSessionId(crypto.randomUUID());
      setRestartName('');
      setRestartEmail('');
      resetInactivityTimer();
    }
  }, [authStatus, restartName, restartEmail, resetInactivityTimer, fetchMessages]);

  // ────────────────────── Guest Form Submit ──────────────────────

  const handleGuestSubmit = useCallback(() => {
    if (!guestFormName.trim() || !guestFormEmail.trim()) return;
    setGuestInfo({ name: guestFormName.trim(), email: guestFormEmail.trim() });
    setGuestFormName('');
    setGuestFormEmail('');
  }, [guestFormName, guestFormEmail]);

  // ────────────────────── Pulse event ──────────────────────

  useEffect(() => {
    const handler = () => {
      setPulse(true);
      setTimeout(() => setPulse(false), 2000);
    };
    window.addEventListener('nexavault:chatpulse', handler);
    return () => window.removeEventListener('nexavault:chatpulse', handler);
  }, []);

  // ────────────────────── Determine what to show ──────────────────────

  const isGuestWithoutInfo = authStatus === 'guest' && !guestInfo;
  const canChat =
    authStatus === 'authenticated' ||
    (authStatus === 'guest' && guestInfo !== null);

  // ────────────────────── Render ──────────────────────

  return (
    <>
      {/* ── Floating Button with continuous bounce ── */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #00D4FF, #7B5EA7)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 ${
            pulse ? 'ring-4 ring-cyan-400/50' : ''
          }`}
          style={{
            background: 'linear-gradient(135deg, #00D4FF, #7B5EA7)',
          }}
          animate={
            isOpen
              ? { y: 0, scale: 1 }
              : {
                  y: [0, -8, 0],
                  scale: [1, 1.05, 1],
                }
          }
          transition={
            isOpen
              ? { duration: 0.2 }
              : {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
          whileHover={{ scale: 1.12, y: -2 }}
          whileTap={{ scale: 0.92 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[520px] max-w-[calc(100vw-3rem)] flex flex-col rounded-2xl overflow-hidden border border-white/10"
            style={{
              background: 'rgba(10, 22, 40, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* ── Header ── */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-sora font-semibold text-white">
                  NexaVault Support
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-white/40">
                    {authStatus === 'checking'
                      ? 'Connecting...'
                      : authStatus === 'authenticated'
                      ? 'Online'
                      : 'Guest Mode'}
                  </span>
                </div>
              </div>
              {authStatus === 'guest' && guestInfo && (
                <a
                  href="/login"
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <LogIn className="w-3 h-3" />
                  Sign in
                </a>
              )}
            </div>

            {/* ── Loading state ── */}
            {authStatus === 'checking' && (
              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw className="w-6 h-6 text-cyan-400/50" />
                </motion.div>
              </div>
            )}

            {/* ── Guest Info Form ── */}
            {isGuestWithoutInfo && (
              <div className="flex-1 flex items-center justify-center p-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-full max-w-[300px] rounded-2xl p-6 border border-white/10"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <div className="text-center mb-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center mx-auto mb-3">
                      <ShieldCheck className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="text-base font-sora font-semibold text-white">
                      Welcome to NexaVault
                    </h4>
                    <p className="text-xs text-white/40 mt-1">
                      Enter your details to start chatting
                    </p>
                  </div>

                  <div className="space-y-3">
                    <input
                      value={guestFormName}
                      onChange={(e) => setGuestFormName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGuestSubmit()}
                      placeholder="Your name"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    <input
                      value={guestFormEmail}
                      onChange={(e) => setGuestFormEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGuestSubmit()}
                      placeholder="Your email"
                      type="email"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleGuestSubmit}
                      disabled={!guestFormName.trim() || !guestFormEmail.trim()}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-xl text-sm font-medium disabled:opacity-40 transition-opacity"
                    >
                      Start Chat
                    </motion.button>
                  </div>

                  <div className="mt-4 text-center">
                    <a
                      href="/login"
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
                    >
                      <LogIn className="w-3 h-3" />
                      Sign in for full support
                    </a>
                  </div>
                </motion.div>
              </div>
            )}

            {/* ── Chat Interface ── */}
            {canChat && (
              <>
                {/* Messages Area */}
                <div
                  className={`flex-1 overflow-y-auto p-4 space-y-3 transition-colors duration-300 ${
                    newMessageFlash ? 'bg-cyan-500/[0.02]' : ''
                  }`}
                >
                  {/* Welcome message */}
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="flex gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex-shrink-0 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-400/60 font-medium block mb-0.5 ml-1">
                        Bot
                      </span>
                      <div className="bg-white/5 rounded-2xl rounded-tl-md px-3 py-2 max-w-[80%]">
                        <p className="text-sm text-white/80">
                          {authStatus === 'authenticated'
                            ? 'Hello! How can we help you today? Our support team and smart assistant are both here for you.'
                            : `Hi ${guestInfo?.name || 'there'}! I'm NexaVault's smart assistant. Ask me about accounts, grants, donations, security, or anything else!`}
                        </p>
                        <p className="text-[10px] mt-1 text-white/25">
                          {new Date().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Message list */}
                  {messages.map((msg, idx) => {
                    const isUser = msg.senderRole === 'user';
                    const isBot = msg.senderRole === 'bot' || msg.isBot;
                    const isAdmin = msg.senderRole === 'admin';

                    return (
                      <motion.div
                        key={msg._id}
                        initial={{
                          opacity: 0,
                          x: isUser ? 10 : -10,
                        }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          type: 'spring',
                          damping: 25,
                          stiffness: 400,
                          delay: idx === messages.length - 1 ? 0.02 : 0,
                        }}
                        className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
                      >
                        {!isUser && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex-shrink-0 flex items-center justify-center">
                            {isBot ? (
                              <Bot className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-white" />
                            )}
                          </div>
                        )}

                        <div className={isUser ? 'max-w-[80%]' : 'max-w-[80%]'}>
                          {!isUser && (
                            <span
                              className={`text-[10px] font-medium block mb-0.5 ml-1 ${
                                isBot
                                  ? 'text-cyan-400/60'
                                  : 'text-violet-400/60'
                              }`}
                            >
                              {isBot ? 'Bot' : 'Support Team'}
                            </span>
                          )}

                          <div
                            className={`rounded-2xl px-3 py-2 ${
                              isUser
                                ? 'bg-cyan-500/20 text-cyan-100 rounded-tr-md'
                                : isAdmin
                                ? 'bg-violet-500/10 text-white/80 rounded-tl-md border border-violet-500/10'
                                : 'bg-white/5 text-white/80 rounded-tl-md'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-[10px] mt-1 opacity-30">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Typing indicator */}
                  <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>

                  {/* Timeout overlay */}
                  {timedOut && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-4 space-y-3"
                    >
                      <div className="flex items-center justify-center gap-2 text-white/40">
                        <Clock className="w-4 h-4" />
                        <p className="text-sm">
                          This conversation has been marked as ended due to
                          inactivity.
                        </p>
                      </div>
                      {!showRestart ? (
                        <button
                          onClick={() => setShowRestart(true)}
                          className="flex items-center gap-2 mx-auto px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Restart Conversation
                        </button>
                      ) : authStatus === 'authenticated' ? (
                        <button
                          onClick={handleRestart}
                          className="mx-auto px-6 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-lg text-sm"
                        >
                          Resume Conversation
                        </button>
                      ) : (
                        <div className="space-y-2 max-w-[250px] mx-auto">
                          <input
                            value={restartName}
                            onChange={(e) => setRestartName(e.target.value)}
                            placeholder="Your name"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                          />
                          <input
                            value={restartEmail}
                            onChange={(e) => setRestartEmail(e.target.value)}
                            placeholder="Your email"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                          />
                          <button
                            onClick={handleRestart}
                            disabled={
                              !restartName.trim() || !restartEmail.trim()
                            }
                            className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-lg text-sm disabled:opacity-40"
                          >
                            Resume
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                {!timedOut && (
                  <div className="p-3 border-t border-white/10">
                    {authStatus === 'guest' && (
                      <div className="mb-2 px-1">
                        <a
                          href="/login"
                          className="text-[11px] text-cyan-400/60 hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                        >
                          <LogIn className="w-3 h-3" />
                          Sign in for full support
                        </a>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          resetInactivityTimer();
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      />
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 flex items-center justify-center disabled:opacity-50 transition-opacity"
                      >
                        <Send className="w-4 h-4 text-white" />
                      </motion.button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
