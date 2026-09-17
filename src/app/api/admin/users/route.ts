import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listUserProfiles, updateUserRole } from "@/db/repository/users";
import { requirePermission } from "@/lib/rbac/server";
import { logAudit } from "@/lib/security/audit";

export async function GET() {
  const auth = await requirePermission("canManageSystem");
  if (!auth.ok) return auth.response;

  const users = await listUserProfiles();
  return NextResponse.json({ users });
}

const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["CLINIC_NURSE", "BED_MANAGER", "BLOOD_BANK_OFFICER", "COUNTY_DIRECTOR", "COMMUNITY_PROMOTER", "SYSTEM_ADMIN"]),
  facilityId: z.coerce.number().int().optional(),
  facilityName: z.string().optional(),
});

/** Only a SYSTEM_ADMIN can assign roles — self-service role switching is gone. */
export async function PATCH(req: NextRequest) {
  const auth = await requirePermission("canManageSystem");
  if (!auth.ok) return auth.response;

  try {
    const body = updateRoleSchema.parse(await req.json());
    const updated = await updateUserRole(body.userId, body.role, body.facilityId, body.facilityName);
    if (!updated) return NextResponse.json({ error: "User profile not found" }, { status: 404 });

    await logAudit(auth.actor, "USER_ROLE_ASSIGN", "user_profile", body.userId, { role: body.role });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid role assignment payload", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update role" }, { status: 500 });
  }
}
