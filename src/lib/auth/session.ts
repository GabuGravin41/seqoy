import { cookies } from "next/headers";
import type { UserRole } from "@/lib/rbac/permissions";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "./session-edge";

export { SESSION_COOKIE_NAME, createSessionToken, verifySessionToken, type SessionPayload };

export interface StaffAccountSeed {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  facilityName: string;
}

export function getPilotStaffAccounts(): StaffAccountSeed[] {
  const adminEmail = (process.env.AUTH_ADMIN_EMAIL || "admin@seqoy.health").trim().toLowerCase();
  return [
    {
      id: "seqoy_admin_01",
      email: adminEmail,
      fullName: "Dalton Omondi",
      role: "SYSTEM_ADMIN",
      facilityName: "seqoy National Operations",
    },
    {
      id: "seqoy_nurse_01",
      email: "midwife@seqoy.health",
      fullName: "Grace Wanjiku",
      role: "CLINIC_NURSE",
      facilityName: "Kibera Health Centre (L3)",
    },
    {
      id: "seqoy_bed_01",
      email: "bedmanager@seqoy.health",
      fullName: "Peter Kamau",
      role: "BED_MANAGER",
      facilityName: "Mama Lucy Kibaki Hospital (L5)",
    },
    {
      id: "seqoy_blood_01",
      email: "bloodbank@seqoy.health",
      fullName: "Amina Hassan",
      role: "BLOOD_BANK_OFFICER",
      facilityName: "Pumwani Maternity Hospital (L5)",
    },
    {
      id: "seqoy_director_01",
      email: "director@seqoy.health",
      fullName: "Dr. Faith Muthoni",
      role: "COUNTY_DIRECTOR",
      facilityName: "Nairobi County Health Services",
    },
    {
      id: "seqoy_chp_01",
      email: "chp@seqoy.health",
      fullName: "Mercy Akinyi",
      role: "COMMUNITY_PROMOTER",
      facilityName: "Mathare Community Health Unit",
    },
  ];
}

/** Reads and verifies the current manual session cookie on the server. */
export async function getServerSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
