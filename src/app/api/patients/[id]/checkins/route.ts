import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as patientsRepo from "@/db/repository/patients";
import * as checkinsRepo from "@/db/repository/checkins";
import { evaluateClinicalRisk } from "@/lib/clinical/risk-scorer";
import { requirePermission } from "@/lib/rbac/server";
import { logAudit } from "@/lib/security/audit";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission("canViewAllPatients");
  if (!auth.ok) return auth.response;

  const patientId = Number(params.id);
  const checkins = await checkinsRepo.listCheckinsForPatient(patientId);
  return NextResponse.json({ patientId, total: checkins.length, checkins });
}

const checkinSchema = z.object({
  channel: z.enum(["VOICE_AI", "USSD", "SMS", "WHATSAPP", "IN_PERSON"]).default("IN_PERSON"),
  languageUsed: z.string().optional(),
  hasSevereHeadache: z.boolean().default(false),
  hasBlurredVision: z.boolean().default(false),
  hasSevereSwelling: z.boolean().default(false),
  hasVaginalBleeding: z.boolean().default(false),
  hasHighFever: z.boolean().default(false),
  hasReducedFetalMovement: z.boolean().default(false),
  hasSevereAbdominalPain: z.boolean().default(false),
  systolicBp: z.coerce.number().optional(),
  diastolicBp: z.coerce.number().optional(),
  transcript: z.string().optional(),
  aiClinicalSummary: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission("canViewAllPatients");
  if (!auth.ok) return auth.response;

  try {
    const patientId = Number(params.id);
    const patient = await patientsRepo.getPatientById(patientId);
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const body = checkinSchema.parse(await req.json());
    const triage = evaluateClinicalRisk({
      ...body,
      gestationalWeeks: patient.gestationalWeeks,
    });

    await patientsRepo.updatePatientRiskState(patientId, triage.riskLevel);

    const checkin = await checkinsRepo.createCheckin({
      patientId,
      channel: body.channel,
      languageUsed: body.languageUsed || patient.preferredLanguage,
      hasSevereHeadache: body.hasSevereHeadache,
      hasBlurredVision: body.hasBlurredVision,
      hasSevereSwelling: body.hasSevereSwelling,
      hasVaginalBleeding: body.hasVaginalBleeding,
      hasHighFever: body.hasHighFever,
      hasReducedFetalMovement: body.hasReducedFetalMovement,
      hasSevereAbdominalPain: body.hasSevereAbdominalPain,
      systolicBp: body.systolicBp,
      diastolicBp: body.diastolicBp,
      transcript: body.transcript,
      aiClinicalSummary: body.aiClinicalSummary,
      triage,
    });

    await logAudit(auth.actor, "CHECKIN_LOG", "patient", String(patientId), { channel: body.channel });

    return NextResponse.json({ success: true, checkin, triage });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid check-in payload", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to log checkin" }, { status: 500 });
  }
}
