'use client';

import Link from 'next/link';
import { Shield, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050A14]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-sora font-bold text-lg text-white">
                Nexa<span className="text-cyan-400">Vault</span>
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              Next-generation digital banking platform. Secure, smart, and seamless financial management for everyone.
            </p>
            <div className="flex items-center gap-3">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <button key={i} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Icon className="w-4 h-4 text-white/40" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sora font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/grants', label: 'Grants' },
                { href: '/donate', label: 'Donate' },
                { href: '/faq', label: 'FAQ' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-cyan-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-sora font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Compliance'].map(item => (
                <li key={item}>
                  <span className="text-sm text-white/40 hover:text-cyan-400 transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-sora font-semibold text-white mb-4">Stay Updated</h4>
            <p className="text-sm text-white/40 mb-3">Subscribe to our newsletter for the latest updates.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
              />
              <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm rounded-lg hover:opacity-90 transition-opacity">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} NexaVault. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Built with Next.js, MongoDB & TailwindCSS
          </p>
        </div>
      </div>
    </footer>
  );
}
