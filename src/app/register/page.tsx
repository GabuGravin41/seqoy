'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/context/AuthContext';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('CLINIC_NURSE');
  const [facilityName, setFacilityName] = useState('');
  const [mflCode, setMflCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({
        name,
        email,
        role,
        facilityName: facilityName || 'Primary Health Centre',
        password,
      });
      toast.success('Account registered successfully', {
        description: `Welcome to SEQOY, ${name}!`,
      });
      router.push('/');
    } catch (err: any) {
      toast.error('Registration failed', { description: err?.message || 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <AppLogo size={44} />
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold text-foreground tracking-tight">
          Register Health Worker Account
        </h2>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Join the SEQOY Maternal & Emergency Referral Network
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4 sm:px-0">
        <div className="bg-card py-8 px-6 shadow-xl border border-border sm:rounded-2xl sm:px-10 card-glow-primary space-y-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field text-xs"
                  placeholder="e.g. Dr. Jane Mwangi"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field text-xs"
                  placeholder="jane@facility.health.go.ke"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Clinical Cadre / Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="input-field text-xs"
                >
                  <option value="CLINIC_NURSE">Clinic Midwife / Nurse (ANC)</option>
                  <option value="BED_MANAGER">Charge Nurse / Bed Manager</option>
                  <option value="BLOOD_BANK_OFFICER">Blood Transfusion Officer</option>
                  <option value="AMBULANCE_PARAMEDIC">Ambulance Paramedic / Driver</option>
                  <option value="COUNTY_DIRECTOR">County MPDSR Director</option>
                  <option value="COMMUNITY_PROMOTER">Community Health Promoter</option>
                  <option value="SYSTEM_ADMIN">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Health Facility Name
                </label>
                <input
                  type="text"
                  required
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="input-field text-xs"
                  placeholder="e.g. Kangemi Health Centre"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Kenya Master Facility Code (MFL Code)
              </label>
              <input
                type="text"
                value={mflCode}
                onChange={(e) => setMflCode(e.target.value)}
                className="input-field text-xs font-mono"
                placeholder="e.g. MFL-13044 (Optional)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field text-xs font-mono"
                  placeholder="••••••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field text-xs font-mono"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </div>
          </form>

          <div className="text-center pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
