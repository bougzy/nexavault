'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Bell, Globe, User, LogOut, Menu, X,
  LayoutDashboard, Heart, Award, HelpCircle, Info, Shield,
} from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeProvider';

interface NavbarProps {
  initialUser?: { name: string; email: string; role: string } | null;
}

export default function Navbar({ initialUser }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(initialUser ?? null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Re-check auth on every route change (handles login/logout transitions)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          const u = data.user;
          setUser({ name: u.name, email: u.email, role: u.role });
        } else {
          setUser(null);
        }
      } catch {
        // keep current state on network error
      }
    };
    checkAuth();
  }, [pathname]);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/chat/messages?unread=true');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.unreadCount || 0);
        }
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setShowUserMenu(false);
    router.push('/login');
  };

  const navLinks = user?.role === 'admin'
    ? [
        { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/users', label: 'Users', icon: User },
        { href: '/admin/messages', label: 'Messages', icon: Bell },
        { href: '/admin/donations', label: 'Donations', icon: Heart },
        { href: '/admin/wallet', label: 'Wallet', icon: Shield },
      ]
    : user
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/donate', label: 'Donate', icon: Heart },
        { href: '/grants', label: 'Grants', icon: Award },
        { href: '/faq', label: 'FAQ', icon: HelpCircle },
        { href: '/about', label: 'About', icon: Info },
      ]
    : [
        { href: '/grants', label: 'Grants', icon: Award },
        { href: '/faq', label: 'FAQ', icon: HelpCircle },
        { href: '/about', label: 'About', icon: Info },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10">
      <div className="glass-card rounded-none border-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={user ? (user.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/'} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-sora font-bold text-lg text-white">
                Nexa<span className="text-cyan-400">Vault</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      active
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <motion.div
                  animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-white/60" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  )}
                </motion.div>
              </motion.button>

              {/* Language */}
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Globe className="w-5 h-5 text-white/60" />
              </button>

              {/* Notifications */}
              {user && (
                <button className="p-2 rounded-lg hover:bg-white/5 transition-colors relative">
                  <motion.div
                    animate={notifications > 0 ? { rotate: [0, -10, 10, -10, 0] } : {}}
                    transition={{ duration: 0.5, repeat: notifications > 0 ? Infinity : 0, repeatDelay: 3 }}
                  >
                    <Bell className="w-5 h-5 text-white/60" />
                  </motion.div>
                  {notifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                      {notifications}
                    </span>
                  )}
                </button>
              )}

              {/* User menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden sm:block text-sm text-white/80">{user.name.split(' ')[0]}</span>
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 glass-card rounded-xl p-2 border border-white/10"
                      >
                        <div className="px-3 py-2 border-b border-white/10 mb-1">
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-white/40">{user.email}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5"
              >
                {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden glass-card rounded-none border-0 border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      active ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
              {!user && (
                <div className="pt-2 flex gap-2">
                  <Link href="/login" className="flex-1 text-center px-4 py-2 text-sm text-white/80 border border-white/10 rounded-lg">
                    Sign In
                  </Link>
                  <Link href="/register" className="flex-1 text-center px-4 py-2 text-sm bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-lg">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
