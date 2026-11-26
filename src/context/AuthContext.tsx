'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { UserRole, RolePermissions, ROLE_PERMISSIONS } from '@/lib/rbac/permissions';

export type { UserRole };

interface RoleDisplayMeta {
  roleTitle: string;
  description: string;
  avatarColor: string;
  facilityType: 'PRIMARY_CLINIC' | 'REFERRAL_HOSPITAL' | 'COUNTY_HQ' | 'COMMUNITY' | 'HQ';
  allowedRoutes: string[];
  primaryRoute: string;
}

// Presentation-only metadata per role — the actual identity (name, email,
// facility, role) always comes from the signed-in Clerk user + our
// userProfiles row, never from this table.
const ROLE_DISPLAY: Record<UserRole, RoleDisplayMeta> = {
  CLINIC_NURSE: {
    roleTitle: 'Primary ANC Midwife',
    description: 'Enrols expectant mothers, sets their check-in schedule, and reviews danger-sign check-ins.',
    avatarColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    facilityType: 'PRIMARY_CLINIC',
    primaryRoute: '/patient-risk-monitoring',
    allowedRoutes: ['/patient-risk-monitoring', '/mothers', '/emergency-referral-management', '/capacity', '/profile', '/simulator'],
  },
  BED_MANAGER: {
    roleTitle: 'Charge Nurse & Bed Manager',
    description: 'Keeps live ICU/HDU bed and theatre readiness accurate so referring clinics never refer blind.',
    avatarColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    facilityType: 'REFERRAL_HOSPITAL',
    primaryRoute: '/capacity',
    allowedRoutes: ['/capacity', '/emergency-referral-management', '/facilities', '/profile'],
  },
  BLOOD_BANK_OFFICER: {
    roleTitle: 'Blood Transfusion Officer',
    description: 'Maintains real-time unit counts across ABO/Rh groups.',
    avatarColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    facilityType: 'REFERRAL_HOSPITAL',
    primaryRoute: '/capacity',
    allowedRoutes: ['/capacity', '/facilities', '/profile'],
  },
  COUNTY_DIRECTOR: {
    roleTitle: 'County Reproductive Health Director',
    description: 'Monitors county-wide MPDSR surveillance and facility readiness bottlenecks for MoH reporting.',
    avatarColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    facilityType: 'COUNTY_HQ',
    primaryRoute: '/surveillance',
    allowedRoutes: ['/surveillance', '/facilities', '/clinics', '/capacity', '/emergency-referral-management', '/profile'],
  },
  COMMUNITY_PROMOTER: {
    roleTitle: 'Community Health Promoter (CHP)',
    description: 'Follows up with mothers who missed a scheduled check-in and helps them set a workable call time.',
    avatarColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    facilityType: 'COMMUNITY',
    primaryRoute: '/mothers',
    allowedRoutes: ['/mothers', '/profile', '/simulator'],
  },
  SYSTEM_ADMIN: {
    roleTitle: 'SEQOY Network Super-Admin',
    description: 'Registers health facilities, assigns staff roles, and has unrestricted network access.',
    avatarColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    facilityType: 'HQ',
    primaryRoute: '/facilities',
    allowedRoutes: ['/capacity', '/patient-risk-monitoring', '/emergency-referral-management', '/surveillance', '/facilities', '/clinics', '/mothers', '/integrations', '/simulator', '/profile', '/admin'],
  },
};

export function getDefaultRouteForRole(role: UserRole): string {
  return ROLE_DISPLAY[role]?.primaryRoute || '/';
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  facilityName: string;
  facilityType: RoleDisplayMeta['facilityType'];
  avatarInitials: string;
  avatarColor: string;
  description: string;
  allowedRoutes: string[];
  permissions: RolePermissions;
}

interface RemoteProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  facilityName?: string;
}

interface AuthContextType {
  currentUser: CurrentUser | null;
  isLoading: boolean;
  canAccessRoute: (pathname: string) => boolean;
  refreshProfile: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<RemoteProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    setLoadingProfile(true);
    fetch('/api/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProfile(data?.profile ?? null))
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));
  }, [refreshTick]);

  const currentUser: CurrentUser | null = useMemo(() => {
    if (!profile) return null;
    const meta = ROLE_DISPLAY[profile.role] ?? ROLE_DISPLAY.CLINIC_NURSE;
    return {
      id: profile.id,
      name: profile.fullName,
      email: profile.email,
      role: profile.role,
      roleTitle: meta.roleTitle,
      facilityName: profile.facilityName || 'Facility not yet assigned',
      facilityType: meta.facilityType,
      avatarInitials: initialsFromName(profile.fullName),
      avatarColor: meta.avatarColor,
      description: meta.description,
      allowedRoutes: meta.allowedRoutes,
      permissions: ROLE_PERMISSIONS[profile.role] ?? ROLE_PERMISSIONS.CLINIC_NURSE,
    };
  }, [profile]);

  const canAccessRoute = (pathname: string): boolean => {
    if (!currentUser) return false;
    const allowed = currentUser.allowedRoutes;
    if (!allowed || allowed.length === 0) return true;
    return allowed.some((route) => (route === '/' ? pathname === '/' : pathname.startsWith(route)));
  };

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setProfile(null);
    window.location.href = '/sign-in';
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading: loadingProfile,
        canAccessRoute,
        refreshProfile: () => setRefreshTick((t) => t + 1),
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * For components that only ever render inside AppLayout's ready-gate (which
 * waits for `currentUser` to load before rendering children) — avoids
 * threading a null-check through every page that displays the current role.
 */
export function useCurrentUser(): CurrentUser {
  const { currentUser } = useAuth();
  if (!currentUser) {
    throw new Error('useCurrentUser() was called before the profile loaded — render this inside AppLayout');
  }
  return currentUser;
}
