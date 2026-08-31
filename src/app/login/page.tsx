'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/context/AuthContext';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, personas } = useAuth();
  const [email, setEmail] = useState('kamau@kangemi.health.go.ke');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Signed in successfully', {
        description: `Welcome back to SEQOY Maternal Network.`,
      });
      router.push('/');
    } catch (err: any) {
      toast.error('Authentication failed', { description: 'Please check your email and password.' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleFill = (personaEmail: string) => {
    setEmail(personaEmail);
    setPassword('SecurePass2026!');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <AppLogo size={44} />
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold text-foreground tracking-tight">
          Sign in to SEQOY
        </h2>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Maternal Health Monitoring & Hospital Referral Network
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-card py-8 px-6 shadow-xl border border-border sm:rounded-2xl sm:px-10 card-glow-primary space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Official Work Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field text-xs pl-9"
                  placeholder="name@facility.health.go.ke"
                />
                <Icon
                  name="EnvelopeIcon"
                  size={16}
                  variant="outline"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-foreground">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field text-xs pl-9 font-mono"
                  placeholder="••••••••••••"
                />
                <Icon
                  name="LockClosedIcon"
                  size={16}
                  variant="outline"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary accent-primary"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-muted-foreground">
                  Keep me signed in
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign in to Clinical Portal'}
              </button>
            </div>
          </form>

          {/* Quick Demo Persona Fill */}
          <div className="border-t border-border pt-4">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider text-center mb-2.5">
              Or 1-Click Demo Sign-In
            </p>
            <div className="grid grid-cols-2 gap-2">
              {personas.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleQuickRoleFill(p.email)}
                  className="p-2 rounded-lg bg-muted/40 hover:bg-muted border border-border text-left transition"
                >
                  <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{p.roleTitle}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Need a new healthcare worker account?{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Register facility
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
