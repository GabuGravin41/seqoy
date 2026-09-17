/**
 * SEQOY role/permission matrix. Single source of truth used both for
 * client-side UI gating (AuthContext) and server-side enforcement
 * (requirePermission) — previously this matrix only existed inlined in
 * AuthContext.tsx and nothing on the server ever checked it.
 *
 * No ambulance/transport role exists: the product only addresses Delay 1
 * (early identification) and Delay 3 (facility readiness) — transport
 * coordination was cut entirely, not just deprioritized.
 */

export type UserRole =
  | "CLINIC_NURSE"
  | "BED_MANAGER"
  | "BLOOD_BANK_OFFICER"
  | "COUNTY_DIRECTOR"
  | "COMMUNITY_PROMOTER"
  | "SYSTEM_ADMIN";

export interface RolePermissions {
  canEnrolPatients: boolean;
  canViewAllPatients: boolean;
  canViewAssignedOnly: boolean;
  canEditCheckinSchedule: boolean;
  canViewCapacity: boolean;
  canUpdateCapacity: boolean;
  canUpdateBloodStock: boolean;
  canCreateReferral: boolean;
  canAcknowledgeReferral: boolean;
  canViewMPDSRAudits: boolean;
  canManageSystem: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  CLINIC_NURSE: {
    canEnrolPatients: true,
    canViewAllPatients: true,
    canViewAssignedOnly: false,
    canEditCheckinSchedule: true,
    canViewCapacity: true,
    canUpdateCapacity: false,
    canUpdateBloodStock: false,
    canCreateReferral: true,
    canAcknowledgeReferral: false,
    canViewMPDSRAudits: false,
    canManageSystem: false,
  },
  BED_MANAGER: {
    canEnrolPatients: false,
    canViewAllPatients: false,
    canViewAssignedOnly: false,
    canEditCheckinSchedule: false,
    canViewCapacity: true,
    canUpdateCapacity: true,
    canUpdateBloodStock: false,
    canCreateReferral: false,
    canAcknowledgeReferral: true,
    canViewMPDSRAudits: true,
    canManageSystem: false,
  },
  BLOOD_BANK_OFFICER: {
    canEnrolPatients: false,
    canViewAllPatients: false,
    canViewAssignedOnly: false,
    canEditCheckinSchedule: false,
    canViewCapacity: true,
    canUpdateCapacity: false,
    canUpdateBloodStock: true,
    canCreateReferral: false,
    canAcknowledgeReferral: false,
    canViewMPDSRAudits: false,
    canManageSystem: false,
  },
  COUNTY_DIRECTOR: {
    canEnrolPatients: false,
    canViewAllPatients: true,
    canViewAssignedOnly: false,
    canEditCheckinSchedule: false,
    canViewCapacity: true,
    canUpdateCapacity: false,
    canUpdateBloodStock: false,
    canCreateReferral: false,
    canAcknowledgeReferral: false,
    canViewMPDSRAudits: true,
    canManageSystem: false,
  },
  COMMUNITY_PROMOTER: {
    canEnrolPatients: true,
    canViewAllPatients: false,
    canViewAssignedOnly: true,
    canEditCheckinSchedule: true,
    canViewCapacity: false,
    canUpdateCapacity: false,
    canUpdateBloodStock: false,
    canCreateReferral: false,
    canAcknowledgeReferral: false,
    canViewMPDSRAudits: false,
    canManageSystem: false,
  },
  SYSTEM_ADMIN: {
    canEnrolPatients: true,
    canViewAllPatients: true,
    canViewAssignedOnly: false,
    canEditCheckinSchedule: true,
    canViewCapacity: true,
    canUpdateCapacity: true,
    canUpdateBloodStock: true,
    canCreateReferral: true,
    canAcknowledgeReferral: true,
    canViewMPDSRAudits: true,
    canManageSystem: true,
  },
};

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return Boolean(ROLE_PERMISSIONS[role]?.[permission]);
}
