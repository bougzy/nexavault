import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/chatbot/ChatWidget';
import { getSession } from '@/lib/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'NexaVault — Banking Without Boundaries',
  description: 'Secure, smart, and seamless next-generation digital banking with real-time balance management and global grant opportunities.',
  keywords: ['banking', 'fintech', 'grants', 'digital banking', 'NexaVault'],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const initialUser = session
    ? { name: session.name, email: session.email, role: session.role }
    : null;

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-dm-sans min-h-screen antialiased">
        <ThemeProvider>
          <Navbar initialUser={initialUser} />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ChatWidget />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(10, 22, 40, 0.95)',
                color: '#F0F4FF',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
              },
              success: {
                iconTheme: { primary: '#00E676', secondary: '#050A14' },
              },
              error: {
                iconTheme: { primary: '#FF5252', secondary: '#050A14' },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
