'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Search, ChevronDown, MessageCircle } from 'lucide-react';

const faqCategories = [
  {
    category: 'Account & Registration',
    items: [
      { q: 'How do I register for a NexaVault account?', a: 'Click "Get Started" on the homepage and fill in your personal details including name, email, phone number, and address. After submission, you\'ll receive a 6-digit OTP for verification.' },
      { q: 'What is an OTP and how does it work?', a: 'OTP stands for One-Time Password. It\'s a 6-digit security code generated during registration to verify your identity. Enter it on the verification page within 10 minutes of generation.' },
      { q: 'How do I log in after registration?', a: 'After verifying your OTP, your account becomes active. Visit the login page, enter your registered email and password, and you\'ll be redirected to your dashboard.' },
      { q: 'What should I do if I forget my password?', a: 'Currently, please contact our admin support via the chat assistant for password reset assistance. We\'re working on adding a self-service password reset feature.' },
      { q: 'Can I change my registered email address?', a: 'For security purposes, email changes must be processed by an administrator. Please reach out through our chat support to request an email update.' },
    ],
  },
  {
    category: 'Balance & Transactions',
    items: [
      { q: 'Why can\'t I deposit or withdraw directly?', a: 'NexaVault uses an admin-managed balance system for enhanced security. All balance adjustments are processed by authorized administrators, ensuring every transaction is verified and tracked.' },
      { q: 'How is my balance updated?', a: 'Your balance is updated by our admin team. They can add funds, subtract amounts, or set a specific balance. Every change is logged with a complete transaction history.' },
      { q: 'What currencies are supported?', a: 'NexaVault supports multiple currencies including USD, EUR, GBP, NGN, JPY, CAD, AUD, and more. Your admin can set your preferred currency in your account settings.' },
      { q: 'How can I view my transaction history?', a: 'Navigate to your dashboard page. The transaction history section shows all balance changes including the date, description, amount, and running balance.' },
    ],
  },
  {
    category: 'Grants',
    items: [
      { q: 'How do I apply for a grant?', a: 'Visit the Grants page to explore available categories. To apply, contact our admin team via the chat assistant with your grant category of interest and supporting details.' },
      { q: 'What documents do I need for a grant application?', a: 'Required documents vary by grant category but typically include identification, a project proposal, budget plan, and relevant credentials. Our admin team will guide you through specific requirements.' },
      { q: 'How long does grant approval take?', a: 'Grant review typically takes 2-4 weeks depending on the category and completeness of your application. You\'ll be notified of updates through your notification center.' },
      { q: 'What grant categories are available?', a: 'We offer Business Grants, Individual Grants, Office Capital Grants, General Grants, School Grants, and Women Empowerment Grants. Each category has specific funding ranges and eligibility criteria.' },
    ],
  },
  {
    category: 'Donations',
    items: [
      { q: 'How do I make a donation?', a: 'Visit the Donate page, copy the wallet address provided, send your donation via your preferred crypto wallet, then log your donation details in the form for our records.' },
      { q: 'Is my donation secure?', a: 'All donations are processed through blockchain transactions, providing transparent and immutable records. The wallet address is managed and verified by our admin team.' },
      { q: 'Can I donate anonymously?', a: 'While we require basic contact information for donation logging, your donation details are kept confidential and are only accessible to authorized administrators.' },
    ],
  },
  {
    category: 'Technical',
    items: [
      { q: 'What languages is the app available in?', a: 'NexaVault supports English, French, Spanish, German, Arabic (with RTL support), and Chinese. You can switch languages using the globe icon in the navigation bar.' },
      { q: 'How do I switch between dark and light mode?', a: 'Click the moon/sun icon in the top navigation bar to toggle between dark and light themes. Your preference is automatically saved.' },
      { q: 'What happens during chat inactivity?', a: 'If there\'s no chat activity for 5 minutes, the conversation is automatically ended. You can restart by clicking "Restart Conversation" and re-entering your name and email.' },
      { q: 'What browsers are supported?', a: 'NexaVault works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.' },
      { q: 'Is NexaVault available on mobile devices?', a: 'Yes! NexaVault is fully responsive and works seamlessly on smartphones and tablets. Simply access it through your mobile browser.' },
    ],
  },
];

export default function FAQPage() {
  const [search, setSearch] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    const next = new Set(openItems);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setOpenItems(next);
  };

  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Hero */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-sora font-bold text-white mb-4">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Questions</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-8">
            Find answers to common questions about NexaVault. Can&apos;t find what you&apos;re looking for? Chat with our support team.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </motion.div>
      </section>

      {/* FAQ List */}
      <section className="max-w-3xl mx-auto px-4 space-y-8">
        {filteredCategories.map((cat, ci) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.1 }}
          >
            <h2 className="text-lg font-sora font-semibold text-white mb-4">{cat.category}</h2>
            <div className="space-y-2">
              {cat.items.map((item, qi) => {
                const key = `${ci}-${qi}`;
                const isOpen = openItems.has(key);
                return (
                  <div
                    key={key}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <span className="text-sm text-white/80 pr-4">{item.q}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-4 pb-4 text-sm text-white/50 leading-relaxed border-t border-white/5 pt-3">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40">No questions match your search.</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 mt-12">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-sora font-bold text-white mb-2">Still have questions?</h3>
          <p className="text-white/40 mb-4">Our support team is ready to help you.</p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('nexavault:chatpulse'))}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-xl hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with Support
          </button>
        </div>
      </section>
    </div>
  );
}
