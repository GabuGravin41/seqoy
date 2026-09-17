import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { UserRole } from "@/lib/rbac/permissions";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  facilityId?: number;
  facilityName?: string;
  createdAt: string;
}

function rowToProfile(row: typeof schema.userProfiles.$inferSelect): UserProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    role: row.role as UserRole,
    facilityId: row.facilityId ?? undefined,
    facilityName: row.facilityName ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

// In local/offline mode (no DATABASE_URL) profiles live in memory for the life
// of the dev server, since there is no Clerk-backed identity to persist against.
const memoryProfiles = new Map<string, UserProfile>();

export async function getUserProfile(clerkUserId: string): Promise<UserProfile | undefined> {
  const db = getDb();
  if (!db) return memoryProfiles.get(clerkUserId);
  const [row] = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.id, clerkUserId));
  return row ? rowToProfile(row) : undefined;
}

export async function createUserProfile(input: {
  id: string;
  email: string;
  fullName: string;
  role?: UserRole;
}): Promise<UserProfile> {
  const profile: UserProfile = {
    id: input.id,
    email: input.email,
    fullName: input.fullName,
    role: input.role ?? "CLINIC_NURSE",
    createdAt: new Date().toISOString(),
  };

  const db = getDb();
  if (!db) {
    memoryProfiles.set(profile.id, profile);
    return profile;
  }

  const [row] = await db
    .insert(schema.userProfiles)
    .values({ id: profile.id, email: profile.email, fullName: profile.fullName, role: profile.role })
    .onConflictDoNothing()
    .returning();
  return row ? rowToProfile(row) : profile;
}

export async function updateUserRole(
  clerkUserId: string,
  role: UserRole,
  facilityId?: number,
  facilityName?: string
): Promise<UserProfile | undefined> {
  const db = getDb();
  if (!db) {
    const existing = memoryProfiles.get(clerkUserId);
    if (!existing) return undefined;
    const updated = { ...existing, role, facilityId, facilityName };
    memoryProfiles.set(clerkUserId, updated);
    return updated;
  }

  const [row] = await db
    .update(schema.userProfiles)
    .set({ role, facilityId, facilityName, updatedAt: new Date() })
    .where(eq(schema.userProfiles.id, clerkUserId))
    .returning();
  return row ? rowToProfile(row) : undefined;
}

export async function listUserProfiles(): Promise<UserProfile[]> {
  const db = getDb();
  if (!db) return Array.from(memoryProfiles.values());
  const rows = await db.select().from(schema.userProfiles);
  return rows.map(rowToProfile);
}
