import React from 'react';
import type { Metadata, Viewport } from 'next';
import { DM_Sans, Fraunces, Manrope } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { TelephonyProvider } from '@/context/TelephonyContext';

// Every route here is either behind Clerk auth or reads per-request session
// state — there's no benefit to statically prerendering any of it at build
// time, and doing so requires a real Clerk key to even be present at build.
export const dynamic = 'force-dynamic';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-fraunces',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'seqoy — Maternal Early Warning & Hospital Readiness Network',
  description:
    'seqoy closes Delay 1 and Delay 3 in Kenyan maternal care: SMS & direct midwife outreach catch danger signs early, while live bed, theatre, and O-negative blood readiness stops blind hospital referrals.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} ${manrope.variable}`} suppressHydrationWarning>
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
      <body className={`${manrope.className} min-h-screen bg-background text-foreground antialiased selection:bg-scarlet selection:text-white`}>
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
