'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, User, Building2, Globe, GraduationCap, Heart,
  X, ArrowRight, MessageCircle, Sparkles, CheckCircle,
} from 'lucide-react';

const grants = [
  {
    icon: Briefcase,
    title: 'Business Grants',
    emoji: '🏢',
    color: 'from-cyan-400 to-blue-500',
    tagline: 'Fuel your entrepreneurial spirit',
    items: ['Startups', 'Expansion', 'Innovation', 'Industry-specific initiatives'],
    description: 'Our business grants are designed to empower entrepreneurs at every stage of their journey. Whether you\'re launching a startup, scaling an existing venture, or pioneering innovative solutions, we provide the financial support to turn your vision into reality. From seed funding for early-stage companies to growth capital for established businesses, our comprehensive grant programs cover diverse industries and business models.',
    amount: 'Up to $250,000',
  },
  {
    icon: User,
    title: 'Individual Grants',
    emoji: '👤',
    color: 'from-violet-400 to-purple-500',
    tagline: 'Empower personal growth and development',
    items: ['Education', 'Research', 'Artistic pursuits', 'Community service'],
    description: 'Individuals with vision deserve support. Our individual grants recognize and fund personal development initiatives, academic research, creative endeavors, and community service projects. We believe that investing in individuals creates ripple effects that benefit entire communities. Whether you\'re pursuing higher education, conducting groundbreaking research, or launching a community initiative, we\'re here to support your journey.',
    amount: 'Up to $50,000',
  },
  {
    icon: Building2,
    title: 'Office Capital Grants',
    emoji: '🏗️',
    color: 'from-amber-400 to-orange-500',
    tagline: 'Enhance your workplace environment',
    items: ['Equipment upgrades', 'Technology advancements', 'Renovations', 'Relocation'],
    description: 'A productive workspace is essential for success. Our office capital grants help organizations upgrade their physical infrastructure, adopt cutting-edge technology, renovate existing spaces, or relocate to more suitable premises. We understand that the right environment can dramatically boost productivity, employee satisfaction, and overall business performance.',
    amount: 'Up to $150,000',
  },
  {
    icon: Globe,
    title: 'General Grants',
    emoji: '🌍',
    color: 'from-green-400 to-emerald-500',
    tagline: 'Broad funding for community impact',
    items: ['Community development', 'Health initiatives', 'Environmental conservation', 'Cultural preservation'],
    description: 'Our general grants fund a wide spectrum of impactful projects that don\'t fit neatly into other categories. From community development programs and public health initiatives to environmental conservation efforts and cultural preservation projects, these grants support the diverse needs of communities worldwide. If you have a project that creates positive change, we want to hear about it.',
    amount: 'Up to $100,000',
  },
  {
    icon: GraduationCap,
    title: 'School Grants',
    emoji: '🎒',
    color: 'from-blue-400 to-indigo-500',
    tagline: 'Invest in the future of education',
    items: ['Infrastructure improvements', 'Program development', 'Scholarships', 'Teacher training'],
    description: 'Education is the foundation of progress. Our school grants support educational institutions in building better infrastructure, developing innovative programs, funding scholarships for deserving students, and investing in teacher training and development. We believe every student deserves access to quality education, and every teacher deserves the resources to excel.',
    amount: 'Up to $200,000',
  },
  {
    icon: Heart,
    title: 'Women Empowerment Grants',
    emoji: '💜',
    color: 'from-pink-400 to-rose-500',
    tagline: 'Promoting gender equality and opportunity',
    items: ['Entrepreneurship programs', 'Education initiatives', 'Healthcare access', 'Social justice initiatives'],
    description: 'We believe in a world where every woman has equal opportunity to thrive. Our women empowerment grants support initiatives that promote gender equality, fund women-led businesses, improve access to education and healthcare for women, and advance social justice causes. These grants are designed to break barriers and create pathways for women to achieve their full potential.',
    amount: 'Up to $175,000',
  },
];

export default function GrantsPage() {
  const [selectedGrant, setSelectedGrant] = useState<typeof grants[0] | null>(null);

  const openChat = () => {
    window.dispatchEvent(new CustomEvent('nexavault:chatpulse'));
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Hero */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-600/5 to-transparent" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-violet-500/5 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-sora font-bold text-white mb-4">
            Grants That <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">Open Doors</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Explore our comprehensive range of funding opportunities designed to support businesses, individuals, and communities in achieving their goals.
          </p>
        </motion.div>
      </section>

      {/* Grant Cards */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grants.map((grant, i) => {
            const Icon = grant.icon;
            return (
              <motion.div
                key={grant.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-white/20 transition-all"
                onClick={() => setSelectedGrant(grant)}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grant.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-sora font-semibold text-white text-lg mb-1">
                  {grant.emoji} {grant.title}
                </h3>
                <p className="text-sm text-cyan-400/70 mb-3 italic">{grant.tagline}</p>
                <ul className="space-y-1.5 mb-4">
                  {grant.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-white/50">
                      <CheckCircle className="w-3.5 h-3.5 text-cyan-400/60 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs text-white/30">{grant.amount}</span>
                  <span className="flex items-center gap-1 text-xs text-cyan-400 group-hover:gap-2 transition-all">
                    Learn More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Grant Detail Modal */}
      <AnimatePresence>
        {selectedGrant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedGrant(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0A1628]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedGrant.color} flex items-center justify-center`}>
                  <selectedGrant.icon className="w-6 h-6 text-white" />
                </div>
                <button onClick={() => setSelectedGrant(null)} className="p-1 hover:bg-white/5 rounded-lg">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>
              <h2 className="text-xl font-sora font-bold text-white mb-1">
                {selectedGrant.emoji} {selectedGrant.title}
              </h2>
              <p className="text-sm text-cyan-400/70 italic mb-2">{selectedGrant.tagline}</p>
              <p className="text-sm font-mono text-amber-400/80 mb-4">{selectedGrant.amount}</p>
              <p className="text-sm text-white/60 leading-relaxed mb-6">{selectedGrant.description}</p>
              <div className="mb-6">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Covers</p>
                <ul className="space-y-2">
                  {selectedGrant.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle className="w-4 h-4 text-green-400/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => { setSelectedGrant(null); openChat(); }}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-4 h-4" />
                Contact Admin to Apply
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application CTA */}
      <section className="max-w-4xl mx-auto px-4 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-white/10 rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl font-sora font-bold text-white mb-3">Ready to Apply?</h2>
          <p className="text-white/50 mb-6 max-w-lg mx-auto">
            Our grant application process is straightforward. Reach out to our admin team through the chat assistant to begin your application journey.
          </p>
          <button
            onClick={openChat}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Contact Admin via Chat
          </button>
        </motion.div>
      </section>
    </div>
  );
}
