import { NextRequest, NextResponse } from "next/server";
import * as facilitiesRepo from "@/db/repository/facilities";
import { requirePermission } from "@/lib/rbac/server";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("canViewCapacity");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const referralOnly = searchParams.get("referralOnly") === "true";
  const county = searchParams.get("county") ?? undefined;

  const facilities = await facilitiesRepo.listFacilities({ referralOnly, county });
  return NextResponse.json({ total: facilities.length, facilities });
}
