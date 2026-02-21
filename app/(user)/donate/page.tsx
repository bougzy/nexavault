'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Copy, Check, Wallet, Bitcoin, CircleDollarSign,
  Globe, Users, Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

const categories = [
  'General', 'Education', 'Health', 'Environment', 'Women Empowerment', 'Community Development',
];

const currencies = ['USD', 'EUR', 'GBP', 'BTC', 'ETH', 'USDT', 'BNB'];

export default function DonatePage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', category: 'General', amount: '',
    currency: 'USD', txHash: '', note: '',
  });

  useEffect(() => {
    fetch('/api/admin/wallet')
      .then(r => r.json())
      .then(d => setWalletAddress(d.walletAddress || ''))
      .catch(() => {});
  }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.amount) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      if (res.ok) {
        toast.success('Donation recorded successfully!');
        setForm({ name: '', email: '', category: 'General', amount: '', currency: 'USD', txHash: '', note: '' });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit');
      }
    } catch {
      toast.error('Network error');
    }
    setLoading(false);
  };

  const heroSection = useMemo(() => (
    <section className="relative py-16 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 to-transparent" />
      <div className="absolute top-20 left-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-4xl mx-auto text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-sora font-bold text-white mb-4">
          Your Generosity <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">Changes Lives</span>
        </h1>
        <p className="text-lg text-white/50 max-w-2xl mx-auto">
          Every contribution makes a meaningful impact. Support causes that matter and help build a better future for communities worldwide.
        </p>
      </motion.div>
    </section>
  ), []);

  return (
    <div className="min-h-screen pt-20 pb-12">
      {heroSection}

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
        {/* Left - Wallet Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-5 h-5 text-cyan-400" />
              <h2 className="font-sora font-semibold text-white text-lg">Donation Wallet Address</h2>
            </div>
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="font-mono text-sm text-cyan-300 break-all leading-relaxed">
                {walletAddress || 'Loading...'}
              </p>
            </div>
            <button
              onClick={copyAddress}
              disabled={!walletAddress}
              className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Address
                </>
              )}
            </button>

            {/* Supported currencies */}
            <div className="mt-6">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-3">Supported Currencies</p>
              <div className="flex gap-3">
                {[
                  { icon: Bitcoin, label: 'BTC', color: 'text-orange-400' },
                  { icon: CircleDollarSign, label: 'ETH', color: 'text-violet-400' },
                  { icon: CircleDollarSign, label: 'USDT', color: 'text-green-400' },
                  { icon: CircleDollarSign, label: 'BNB', color: 'text-yellow-400' },
                ].map(c => (
                  <div key={c.label} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <c.icon className={`w-5 h-5 ${c.color}`} />
                    </div>
                    <span className="text-[10px] text-white/40">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right - Donation Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Send className="w-5 h-5 text-violet-400" />
              <h2 className="font-sora font-semibold text-white text-lg">Log Your Donation</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider">Full Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-base text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50"
                  placeholder="John Doe"
                  autoComplete="name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                />
              </div>

              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider">Email Address *</label>
                <input
                  type="email"
                  inputMode="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-base text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50"
                  placeholder="john@example.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  enterKeyHint="next"
                />
              </div>

              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-base text-white focus:outline-none focus:border-cyan-500/50"
                >
                  {categories.map(c => (
                    <option key={c} value={c} className="bg-gray-900">{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider">Amount *</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.amount}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setForm({ ...form, amount: val });
                      }
                    }}
                    className="w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-base text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50"
                    placeholder="0.00"
                    enterKeyHint="next"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider">Currency</label>
                  <select
                    value={form.currency}
                    onChange={e => setForm({ ...form, currency: e.target.value })}
                    className="w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-base text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    {currencies.map(c => (
                      <option key={c} value={c} className="bg-gray-900">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider">Transaction Hash (Optional)</label>
                <input
                  value={form.txHash}
                  onChange={e => setForm({ ...form, txHash: e.target.value })}
                  className="w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-base text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50"
                  placeholder="0x..."
                  autoCapitalize="none"
                  autoComplete="off"
                  enterKeyHint="next"
                />
              </div>

              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider">Message (Optional)</label>
                <textarea
                  value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                  rows={3}
                  className="w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-base text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 resize-none"
                  placeholder="Leave a note..."
                  enterKeyHint="done"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    Submit Donation Record
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </section>

      {/* Impact Stats */}
      <section className="max-w-6xl mx-auto px-4 mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: CircleDollarSign, value: '2,400+', label: 'Donations Logged', color: 'from-cyan-400 to-blue-500' },
            { icon: Globe, value: '45+', label: 'Countries Reached', color: 'from-violet-400 to-pink-500' },
            { icon: Users, value: '18K+', label: 'Lives Impacted', color: 'from-amber-400 to-orange-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-sora font-bold text-white">{stat.value}</p>
              <p className="text-sm text-white/40 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
