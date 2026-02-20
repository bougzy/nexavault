'use client';

import { motion } from 'framer-motion';
import {
  Shield, Eye, Users, Lightbulb, Lock, Globe,
  Linkedin, Github, Twitter, Mail,
} from 'lucide-react';

const values = [
  { icon: Lock, title: 'Transparency', desc: 'Every transaction is tracked and visible. We believe in complete financial transparency.', color: 'from-cyan-400 to-blue-500' },
  { icon: Shield, title: 'Security', desc: 'Bank-grade encryption and security protocols protect every account and transaction.', color: 'from-violet-400 to-purple-500' },
  { icon: Users, title: 'Inclusivity', desc: 'Financial services accessible to everyone, regardless of geography or background.', color: 'from-green-400 to-emerald-500' },
  { icon: Lightbulb, title: 'Innovation', desc: 'Continuously pushing the boundaries of what digital banking can achieve.', color: 'from-amber-400 to-orange-500' },
];

const team = [
  { name: 'Alexandra Chen', role: 'CEO & Co-Founder', bio: 'Former VP at Goldman Sachs with 15 years in fintech innovation.' },
  { name: 'Marcus Williams', role: 'CTO', bio: 'Ex-Google engineer specializing in distributed systems and blockchain.' },
  { name: 'Sarah Okonkwo', role: 'Head of Operations', bio: 'Operations expert with experience scaling startups across 3 continents.' },
  { name: 'David Kim', role: 'Lead Designer', bio: 'Award-winning UX designer focused on making finance beautiful and accessible.' },
  { name: 'Priya Patel', role: 'Head of Compliance', bio: 'Regulatory expert ensuring NexaVault meets global financial standards.' },
  { name: 'James Rivera', role: 'Head of Growth', bio: 'Growth strategist who helped scale two fintech unicorns.' },
];

const techStack = [
  { name: 'Next.js', desc: 'React Framework' },
  { name: 'MongoDB', desc: 'Database' },
  { name: 'TailwindCSS', desc: 'Styling' },
  { name: 'TypeScript', desc: 'Language' },
  { name: 'Framer Motion', desc: 'Animations' },
  { name: 'JWT', desc: 'Authentication' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/5 to-transparent" />
        <div className="absolute top-20 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl font-sora font-bold text-white mb-4">
            Building Trust Through{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">Technology</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            NexaVault is redefining digital banking by combining cutting-edge technology with unwavering commitment to security and accessibility.
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-6 mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-4">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-sora font-bold text-white mb-3">Our Mission</h2>
          <p className="text-white/50 leading-relaxed">
            To democratize access to banking and financial opportunities worldwide. We believe that everyone deserves access to secure, transparent, and efficient financial services, regardless of their location or economic status. Through innovative technology and inclusive design, we&apos;re breaking down the barriers that have traditionally excluded millions from the global financial system.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mb-4">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-sora font-bold text-white mb-3">Our Vision</h2>
          <p className="text-white/50 leading-relaxed">
            A world where financial empowerment is universal. We envision a future where digital banking is so intuitive, secure, and accessible that it becomes a catalyst for economic growth in every community. By 2030, we aim to serve over 1 million users across 150+ countries, distributing $100M+ in grants and facilitating billions in transactions.
          </p>
        </motion.div>
      </section>

      {/* Core Values */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-sora font-bold text-white text-center mb-8">Core Values</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, i) => (
            <motion.div
              key={val.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${val.color} flex items-center justify-center mx-auto mb-4`}>
                <val.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-sora font-semibold text-white mb-2">{val.title}</h3>
              <p className="text-sm text-white/40">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-sora font-bold text-white text-center mb-3">Meet Our Team</h2>
        <p className="text-white/40 text-center mb-8 max-w-lg mx-auto">The brilliant minds behind NexaVault, united by a passion for financial innovation.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-white">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="font-sora font-semibold text-white text-center">{member.name}</h3>
              <p className="text-xs text-cyan-400 text-center mb-2">{member.role}</p>
              <p className="text-sm text-white/40 text-center mb-4">{member.bio}</p>
              <div className="flex items-center justify-center gap-2">
                {[Linkedin, Twitter, Github].map((Icon, idx) => (
                  <button key={idx} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-white/40" />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-sora font-bold text-white text-center mb-8">Our Technology</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {techStack.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-colors"
            >
              <p className="font-sora font-semibold text-white text-sm">{tech.name}</p>
              <p className="text-[10px] text-white/30 mt-1">{tech.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-white/10 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-sora font-bold text-white mb-3">Get in Touch</h2>
          <p className="text-white/40 mb-6">Have questions or want to learn more about NexaVault?</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Mail className="w-4 h-4 text-cyan-400" />
              contact@nexavault.com
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Globe className="w-4 h-4 text-cyan-400" />
              San Francisco, CA
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
