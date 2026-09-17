import React from 'react';
import type { Metadata, Viewport } from 'next';
import { DM_Sans, Fraunces } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'SEQOY — Early Warning & Facility Readiness for Maternal Care',
  description:
    'SEQOY reaches every enrolled mother with automatic biweekly calls and weekly WhatsApp/SMS check-ins, and gives clinics live hospital bed and blood capacity so they never refer a mother somewhere already full.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`} suppressHydrationWarning>
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
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: '#0f766e',
              borderRadius: '0.75rem',
            },
          }}
        >
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
        </ClerkProvider>
      </body>
    </html>
  );
}
