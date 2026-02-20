'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Bell, Globe, User, LogOut, Menu, X,
  LayoutDashboard, Heart, Award, HelpCircle, Info, Shield,
  ChevronRight,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  // Re-check auth on every route change
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

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setShowUserMenu(false);
    setSidebarOpen(false);
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
    <>
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
                {/* Theme toggle — hide on small mobile to save space */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTheme}
                  className="hidden sm:block p-2 rounded-lg hover:bg-white/5 transition-colors"
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

                {/* Language — desktop only */}
                <button className="hidden sm:block p-2 rounded-lg hover:bg-white/5 transition-colors">
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

                {/* Desktop user menu */}
                {user ? (
                  <div className="relative hidden md:block">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-sm text-white/80">{user.name.split(' ')[0]}</span>
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
                  <div className="hidden md:flex items-center gap-2">
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

                {/* Mobile hamburger */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-white/5"
                  aria-label="Toggle menu"
                >
                  <AnimatePresence mode="wait">
                    {sidebarOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <X className="w-5 h-5 text-white" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Menu className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══ Mobile Sidebar Overlay + Drawer ═══ */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Sidebar drawer */}
            <motion.aside
              key="sidebar-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-[70] w-72 md:hidden flex flex-col"
              style={{ background: 'var(--bg-primary)' }}
            >
              {/* Sidebar header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 flex-shrink-0">
                <Link
                  href={user ? (user.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/'}
                  className="flex items-center gap-2"
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-sora font-bold text-lg text-white">
                    Nexa<span className="text-cyan-400">Vault</span>
                  </span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              {/* User card (if logged in) */}
              {user && (
                <div className="px-4 py-4 border-b border-white/5">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-white/35 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <div className="flex-1 overflow-y-auto px-3 py-4">
                <p className="px-3 text-[10px] uppercase tracking-widest text-white/25 mb-2 font-semibold">
                  {user?.role === 'admin' ? 'Admin Panel' : user ? 'Navigation' : 'Explore'}
                </p>
                <div className="space-y-0.5">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all group ${
                          active
                            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                            : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            active ? 'bg-cyan-500/20' : 'bg-white/5 group-hover:bg-white/10'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{link.label}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${
                          active ? 'text-cyan-400' : 'text-white/20 group-hover:text-white/40'
                        }`} />
                      </Link>
                    );
                  })}
                </div>

                {/* Extra actions */}
                <div className="mt-6 px-3 space-y-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/25 font-semibold">Settings</p>

                  {/* Theme toggle */}
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 w-full py-2 text-sm text-white/50 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-yellow-400" />}
                    </div>
                    <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                  </button>

                  {/* Language */}
                  <button className="flex items-center gap-3 w-full py-2 text-sm text-white/50 hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span>Language</span>
                  </button>
                </div>
              </div>

              {/* Bottom section */}
              <div className="flex-shrink-0 border-t border-white/10 px-4 py-4">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Sign Out</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center justify-center w-full py-3 text-sm text-white/80 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center justify-center w-full py-3 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
