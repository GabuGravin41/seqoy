'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole =
  | 'CLINIC_NURSE'
  | 'BED_MANAGER'
  | 'BLOOD_BANK_OFFICER'
  | 'AMBULANCE_PARAMEDIC'
  | 'COUNTY_DIRECTOR'
  | 'COMMUNITY_PROMOTER'
  | 'SYSTEM_ADMIN';

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  facilityName: string;
  facilityType: 'PRIMARY_CLINIC' | 'REFERRAL_HOSPITAL' | 'COUNTY_HQ' | 'AMBULANCE_FLEET' | 'COMMUNITY' | 'HQ';
  avatarInitials: string;
  avatarColor: string;
  description: string;
  primaryRoute: string;
  allowedRoutes: string[];
  permissions: {
    canEnrolPatients: boolean;
    canViewAllPatients: boolean;
    canViewAssignedOnly: boolean;
    canViewCapacity: boolean;
    canUpdateCapacity: boolean;
    canUpdateBloodStock: boolean;
    canDispatchAmbulance: boolean;
    canUpdateAmbulanceStatus: boolean;
    canViewMPDSRAudits: boolean;
    canManageSystem: boolean;
  };
}

export const USER_PERSONAS: Record<UserRole, UserPersona> = {
  CLINIC_NURSE: {
    id: 'user-001',
    name: 'Nurse Kamau',
    email: 'kamau@kangemi.health.go.ke',
    role: 'CLINIC_NURSE',
    roleTitle: 'Primary ANC Midwife',
    facilityName: 'Kangemi Health Centre (Level 3)',
    facilityType: 'PRIMARY_CLINIC',
    avatarInitials: 'NK',
    avatarColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    description: 'Enrols expectant mothers, monitors danger scores, and dispatches emergency transfers to Level 5/6 hospitals without referral blindness.',
    primaryRoute: '/patient-risk-monitoring',
    allowedRoutes: ['/patient-risk-monitoring', '/mothers', '/emergency-referral-management', '/capacity', '/profile', '/simulator'],
    permissions: {
      canEnrolPatients: true,
      canViewAllPatients: true,
      canViewAssignedOnly: false,
      canViewCapacity: true,
      canUpdateCapacity: false,
      canUpdateBloodStock: false,
      canDispatchAmbulance: true,
      canUpdateAmbulanceStatus: false,
      canViewMPDSRAudits: false,
      canManageSystem: false,
    },
  },
  BED_MANAGER: {
    id: 'user-002',
    name: 'Sister Grace Ochieng',
    email: 'grace.ochieng@pumwani.go.ke',
    role: 'BED_MANAGER',
    roleTitle: 'Charge Nurse & Bed Manager',
    facilityName: 'Pumwani Maternity Hospital (Level 5)',
    facilityType: 'REFERRAL_HOSPITAL',
    avatarInitials: 'SG',
    avatarColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    description: 'Manages live ICU/HDU bed capacity, operating theatre readiness, and prepares surgical teams for incoming emergency ambulances.',
    primaryRoute: '/capacity',
    allowedRoutes: ['/capacity', '/emergency-referral-management', '/facilities', '/profile'],
    permissions: {
      canEnrolPatients: false,
      canViewAllPatients: false,
      canViewAssignedOnly: false,
      canViewCapacity: true,
      canUpdateCapacity: true,
      canUpdateBloodStock: false,
      canDispatchAmbulance: false,
      canUpdateAmbulanceStatus: false,
      canViewMPDSRAudits: true,
      canManageSystem: false,
    },
  },
  BLOOD_BANK_OFFICER: {
    id: 'user-003',
    name: 'Lab Tech Otieno',
    email: 'otieno.lab@pumwani.go.ke',
    role: 'BLOOD_BANK_OFFICER',
    roleTitle: 'Blood Transfusion Officer',
    facilityName: 'Pumwani Blood Bank & Lab',
    facilityType: 'REFERRAL_HOSPITAL',
    avatarInitials: 'TO',
    avatarColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    description: 'Maintains real-time unit counts across ABO/Rh groups and triggers shortage broadcasts for emergency PPH cases.',
    primaryRoute: '/capacity',
    allowedRoutes: ['/capacity', '/facilities', '/profile'],
    permissions: {
      canEnrolPatients: false,
      canViewAllPatients: false,
      canViewAssignedOnly: false,
      canViewCapacity: true,
      canUpdateCapacity: false,
      canUpdateBloodStock: true,
      canDispatchAmbulance: false,
      canUpdateAmbulanceStatus: false,
      canViewMPDSRAudits: false,
      canManageSystem: false,
    },
  },
  AMBULANCE_PARAMEDIC: {
    id: 'user-004',
    name: 'Paramedic Mwangi',
    email: 'mwangi.dispatch@nairobi.ems.ke',
    role: 'AMBULANCE_PARAMEDIC',
    roleTitle: 'Emergency Ambulance Unit MEDIC-04',
    facilityName: 'Nairobi Metro Emergency Fleet',
    facilityType: 'AMBULANCE_FLEET',
    avatarInitials: 'PM',
    avatarColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    description: 'Receives instant dispatch routing, transmits in-transit vital signs, and updates live ETA to receiving hospital triage teams.',
    primaryRoute: '/emergency-referral-management',
    allowedRoutes: ['/emergency-referral-management', '/facilities', '/profile'],
    permissions: {
      canEnrolPatients: false,
      canViewAllPatients: false,
      canViewAssignedOnly: false,
      canViewCapacity: false,
      canUpdateCapacity: false,
      canUpdateBloodStock: false,
      canDispatchAmbulance: false,
      canUpdateAmbulanceStatus: true,
      canViewMPDSRAudits: false,
      canManageSystem: false,
    },
  },
  COUNTY_DIRECTOR: {
    id: 'user-005',
    name: 'Dr. Odhiambo',
    email: 'dr.odhiambo@health.nairobi.go.ke',
    role: 'COUNTY_DIRECTOR',
    roleTitle: 'County Reproductive Health Director',
    facilityName: 'Nairobi County Health Directorate',
    facilityType: 'COUNTY_HQ',
    avatarInitials: 'DO',
    avatarColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    description: 'Monitors county-wide 3-Delays surveillance, reviews hospital bottleneck heatmaps, and tracks maternal mortality reduction metrics for MoH.',
    primaryRoute: '/surveillance',
    allowedRoutes: ['/surveillance', '/facilities', '/clinics', '/capacity', '/emergency-referral-management', '/profile'],
    permissions: {
      canEnrolPatients: false,
      canViewAllPatients: true,
      canViewAssignedOnly: false,
      canViewCapacity: true,
      canUpdateCapacity: false,
      canUpdateBloodStock: false,
      canDispatchAmbulance: false,
      canUpdateAmbulanceStatus: false,
      canViewMPDSRAudits: true,
      canManageSystem: false,
    },
  },
  COMMUNITY_PROMOTER: {
    id: 'user-006',
    name: 'Mama Zipporah',
    email: 'zipporah.chp@kangemi.community.ke',
    role: 'COMMUNITY_PROMOTER',
    roleTitle: 'Community Health Promoter (CHP)',
    facilityName: 'Kangemi Sub-Zone 4',
    facilityType: 'COMMUNITY',
    avatarInitials: 'MZ',
    avatarColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    description: 'Conducts household follow-ups on silent/unreachable mothers (48h+), assists with USSD check-ins, and promotes clinic attendance.',
    primaryRoute: '/mothers',
    allowedRoutes: ['/mothers', '/profile', '/simulator'],
    permissions: {
      canEnrolPatients: true,
      canViewAllPatients: false,
      canViewAssignedOnly: true,
      canViewCapacity: false,
      canUpdateCapacity: false,
      canUpdateBloodStock: false,
      canDispatchAmbulance: false,
      canUpdateAmbulanceStatus: false,
      canViewMPDSRAudits: false,
      canManageSystem: false,
    },
  },
  SYSTEM_ADMIN: {
    id: 'user-007',
    name: 'Alex Mutiso',
    email: 'admin@seqoy.health',
    role: 'SYSTEM_ADMIN',
    roleTitle: 'SEQOY Network Super-Admin',
    facilityName: 'National Operations HQ',
    facilityType: 'HQ',
    avatarInitials: 'AM',
    avatarColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    description: 'Unrestricted master access: registers health facilities, manages telecom shortcodes (*384#), and provisions system users.',
    primaryRoute: '/facilities',
    allowedRoutes: ['/capacity', '/patient-risk-monitoring', '/emergency-referral-management', '/surveillance', '/facilities', '/clinics', '/mothers', '/integrations', '/simulator', '/profile'],
    permissions: {
      canEnrolPatients: true,
      canViewAllPatients: true,
      canViewAssignedOnly: false,
      canViewCapacity: true,
      canUpdateCapacity: true,
      canUpdateBloodStock: true,
      canDispatchAmbulance: true,
      canUpdateAmbulanceStatus: true,
      canViewMPDSRAudits: true,
      canManageSystem: true,
    },
  },
};

export function getDefaultRouteForRole(role: UserRole): string {
  return USER_PERSONAS[role]?.primaryRoute || '/';
}

interface AuthContextType {
  currentUser: UserPersona;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: { name: string; email: string; role: UserRole; facilityName: string; password?: string }) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  canAccessRoute: (pathname: string) => boolean;
  personas: UserPersona[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('CLINIC_NURSE');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('seqoy_active_role', role);
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    // Find matching persona by email or default to clinic nurse
    const matchedRole = (Object.keys(USER_PERSONAS) as UserRole[]).find(
      (r) => USER_PERSONAS[r].email.toLowerCase() === email.toLowerCase()
    );
    const targetRole = matchedRole || 'CLINIC_NURSE';
    setCurrentRole(targetRole);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('seqoy_active_role', targetRole);
      localStorage.setItem('seqoy_auth_state', 'true');
    }
    return true;
  };

  const register = async (data: {
    name: string;
    email: string;
    role: UserRole;
    facilityName: string;
    password?: string;
  }): Promise<boolean> => {
    setCurrentRole(data.role);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('seqoy_active_role', data.role);
      localStorage.setItem('seqoy_auth_state', 'true');
    }
    return true;
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('seqoy_auth_state');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('seqoy_active_role') as UserRole;
      if (saved && USER_PERSONAS[saved]) {
        setCurrentRole(saved);
      }
      const savedAuth = localStorage.getItem('seqoy_auth_state');
      if (savedAuth === 'false') {
        setIsAuthenticated(false);
      }
    }
  }, []);

  const currentUser = USER_PERSONAS[currentRole] || USER_PERSONAS.CLINIC_NURSE;
  const personas = Object.values(USER_PERSONAS);

  const canAccessRoute = (pathname: string): boolean => {
    const allowed = currentUser.allowedRoutes;
    if (!allowed || allowed.length === 0) return true;
    return allowed.some((route) => {
      if (route === '/') return pathname === '/';
      return pathname.startsWith(route);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        register,
        forgotPassword,
        logout,
        switchRole,
        canAccessRoute,
        personas,
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
