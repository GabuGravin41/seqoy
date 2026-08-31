'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Password reset instructions sent', {
        description: `Check your inbox at ${email} for your secure reset link.`,
      });
    }, 600);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResetSuccess(true);
      toast.success('Password updated successfully', {
        description: 'You can now sign in with your new password.',
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <AppLogo size={44} />
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold text-foreground tracking-tight">
          Reset Your Password
        </h2>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Enter your registered health worker email to receive recovery instructions
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-card py-8 px-6 shadow-xl border border-border sm:rounded-2xl sm:px-10 card-glow-primary space-y-6">
          {!submitted ? (
            <form className="space-y-4" onSubmit={handleRequestReset}>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Registered Email Address
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
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending Instructions...' : 'Send Password Reset Code'}
                </button>
              </div>
            </form>
          ) : !resetSuccess ? (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div className="bg-primary/10 border border-primary/30 p-3 rounded-xl">
                <p className="text-xs text-primary font-semibold">
                  A verification code has been dispatched to {email}.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="input-field text-xs font-mono text-center tracking-widest text-sm"
                  placeholder="894210"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  New Secure Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field text-xs font-mono"
                  placeholder="••••••••••••"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  {loading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <Icon name="CheckCircleIcon" size={24} variant="solid" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Password Reset Complete</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Your account password has been updated. You can now log in securely.
                </p>
              </div>
              <Link href="/login" className="btn-primary w-full py-2.5 text-xs font-bold block">
                Return to Sign In
              </Link>
            </div>
          )}

          <div className="text-center pt-2 border-t border-border">
            <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <Icon name="ArrowLeftIcon" size={12} variant="outline" />
              Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
