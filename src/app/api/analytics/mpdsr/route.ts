import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as mpdsrRepo from "@/db/repository/mpdsr";
import { generateCountyMPDSRReport } from "@/lib/analytics/mpdsr";
import { requirePermission } from "@/lib/rbac/server";
import { logAudit } from "@/lib/security/audit";

export async function GET(request: NextRequest) {
  const auth = await requirePermission("canViewMPDSRAudits");
  if (!auth.ok) return auth.response;

  const auditLogs = await mpdsrRepo.listAuditLogs();
  const report = generateCountyMPDSRReport(auditLogs);

  return NextResponse.json({ report, recentAuditLogs: auditLogs.slice(0, 10) });
}

const auditSchema = z.object({
  referralId: z.coerce.number().int().optional(),
  patientId: z.coerce.number().int(),
  county: z.string().default("Nairobi"),
  delay1Identified: z.boolean().default(false),
  delay1Notes: z.string().optional(),
  delay2Notes: z.string().optional(),
  delay3Identified: z.boolean().default(false),
  delay3Notes: z.string().optional(),
  finalOutcome: z
    .enum(["DISCHARGED_HEALTHY", "STABLE_WARD", "ICU_ADMITTED", "MATERNAL_DEATH", "PERINATAL_DEATH"])
    .default("DISCHARGED_HEALTHY"),
  executiveAuditSummary: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const auth = await requirePermission("canViewMPDSRAudits");
  if (!auth.ok) return auth.response;

  try {
    const body = auditSchema.parse(await request.json());
    const audit = await mpdsrRepo.createAuditLog({
      referralId: body.referralId,
      patientId: body.patientId,
      county: body.county,
      delay1Identified: body.delay1Identified,
      delay1Notes: body.delay1Notes,
      delay2Notes: body.delay2Notes,
      delay3Identified: body.delay3Identified,
      delay3Notes: body.delay3Notes,
      clinicalOutcome: body.finalOutcome,
      executiveAuditSummary: body.executiveAuditSummary,
    });

    await logAudit(auth.actor, "MPDSR_AUDIT_CREATE", "mpdsr_audit", String(audit.id));

    return NextResponse.json({ success: true, message: `MPDSR Audit Log #${audit.id} saved`, audit });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid audit payload", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
