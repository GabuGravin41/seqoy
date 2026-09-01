import React from 'react';
import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { TelephonyProvider } from '@/context/TelephonyContext';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'SEQOY — Maternal Health Monitoring & Hospital Capacity Network',
  description:
    'SEQOY connects clinics and referral hospitals in real time — continuous patient risk monitoring and live capacity visibility to eliminate preventable maternal deaths in Kenya.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={dmSans.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('seqoy_theme');
                  var theme = saved === 'light' || saved === 'dark' ? saved : 'light';
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${dmSans.className} min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground`}>
        <ThemeProvider>
          <AuthProvider>
            <TelephonyProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  },
                }}
              />
            </TelephonyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
