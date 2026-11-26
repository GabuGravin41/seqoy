'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const STAFF_ROLES = [
  { label: 'System Admin', email: 'admin@seqoy.health' },
  { label: 'ANC Midwife', email: 'midwife@seqoy.health' },
  { label: 'Bed Manager', email: 'bedmanager@seqoy.health' },
  { label: 'Blood Bank', email: 'bloodbank@seqoy.health' },
  { label: 'County Director', email: 'director@seqoy.health' },
  { label: 'CHP', email: 'chp@seqoy.health' },
];

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/capacity';
  const { refreshProfile } = useAuth();

  const [email, setEmail] = useState('admin@seqoy.health');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Invalid email or password');
        setSubmitting(false);
        return;
      }

      refreshProfile();
      window.location.href = redirectTo;
    } catch {
      setError('Could not connect to server. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-manrope text-navy flex flex-col justify-between">
      <header className="mx-auto w-full max-w-6xl px-6 py-6 flex items-center justify-between">
        <Link href="/" aria-label="seqoy home" className="inline-flex items-center gap-2.5">
          <img
            src="/brand/seqoy-logo-primary-transparent.png"
            alt="seqoy"
            className="h-9 w-auto object-contain select-none"
          />
          <span className="pt-1 text-[22px] font-semibold leading-none tracking-[-0.02em] text-navy">
            seqoy
          </span>
        </Link>
        <Link href="/" className="text-sm font-medium text-navy-muted transition hover:text-navy">
          ← Back to home
        </Link>
      </header>

      <main className="mx-auto w-full max-w-md px-6 py-10">
        <p className="text-[11px] font-bold tracking-[0.18em] text-crimson uppercase">
          Clinical Portal Access
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.025em] text-navy">
          Sign in to seqoy
        </h1>
        <p className="mt-2 text-sm text-navy-muted">
          Enter your clinical staff email and password to access hospital readiness and patient monitoring.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-md border border-crimson-border border-l-2 border-l-crimson bg-crimson-soft px-3.5 py-2.5 text-xs font-semibold text-crimson">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-navy">
              Staff Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@seqoy.health"
              className="mt-1.5 w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-navy-muted/60 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-navy">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="mt-1.5 w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-navy-muted/60 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-crimson px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-navy disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Quick role email selector for testing RBAC */}
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-[11px] font-bold tracking-[0.14em] text-navy-muted uppercase">
            Pilot Staff Accounts (click to fill email)
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {STAFF_ROLES.map((r) => (
              <button
                key={r.email}
                type="button"
                onClick={() => setEmail(r.email)}
                className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                  email === r.email
                    ? 'border-navy bg-navy text-white'
                    : 'border-border bg-secondary text-navy hover:border-navy/40'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-6 text-xs text-navy-muted">
        © {new Date().getFullYear()} seqoy · Maternal Health, Kenya.
      </footer>
    </div>
  );
}
