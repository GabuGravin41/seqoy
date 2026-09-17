import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserProfile } from "@/db/repository/users";
import { hasPermission, RolePermissions, UserRole } from "./permissions";

export interface AuthedActor {
  userId: string;
  role: UserRole;
}

type RequirePermissionResult = { ok: true; actor: AuthedActor } | { ok: false; response: NextResponse };

/**
 * Server-side RBAC enforcement for API routes. Resolves the Clerk session to
 * a SEQOY role via userProfiles and checks the permission matrix — previously
 * nothing on the server verified this at all; role was a client-side
 * `localStorage` costume anyone could switch.
 */
export async function requirePermission(permission: keyof RolePermissions): Promise<RequirePermissionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }

  const profile = await getUserProfile(userId);
  if (!profile) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No SEQOY profile provisioned for this account yet" }, { status: 403 }),
    };
  }

  if (!hasPermission(profile.role, permission)) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true, actor: { userId, role: profile.role } };
}
