import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { getUserProfile } from "@/db/repository/users";
import { hasPermission, RolePermissions, UserRole } from "./permissions";

export interface AuthedActor {
  userId: string;
  role: UserRole;
}

type RequirePermissionResult = { ok: true; actor: AuthedActor } | { ok: false; response: NextResponse };

/**
 * Server-side RBAC enforcement for API routes.
 * Verifies the HMAC-signed HttpOnly session cookie and resolves the user's
 * role from Postgres (or the signed session claim when running stateless).
 */
export async function requirePermission(permission: keyof RolePermissions): Promise<RequirePermissionResult> {
  const session = await getServerSession();
  if (!session) {
    return { ok: false, response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }

  const profile = await getUserProfile(session.userId);
  const role: UserRole = profile?.role ?? session.role;

  if (!hasPermission(role, permission)) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true, actor: { userId: session.userId, role } };
}
