import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as patientsRepo from "@/db/repository/patients";
import * as checkinsRepo from "@/db/repository/checkins";
import * as facilitiesRepo from "@/db/repository/facilities";
import * as referralsRepo from "@/db/repository/referrals";
import { requirePermission } from "@/lib/rbac/server";
import { logAudit } from "@/lib/security/audit";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission("canViewAllPatients");
  if (!auth.ok) return auth.response;

  const patientId = Number(params.id);
  const patient = await patientsRepo.getPatientById(patientId);
  if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

  const [facility, checkins, referrals] = await Promise.all([
    facilitiesRepo.getFacilityById(patient.primaryFacilityId),
    checkinsRepo.listCheckinsForPatient(patientId),
    referralsRepo.listReferrals({ patientId }),
  ]);

  await logAudit(auth.actor, "PATIENT_VIEW", "patient", String(patientId));

  return NextResponse.json({ patient, primaryFacility: facility, checkins, referrals });
}

const scheduleSchema = z.object({
  checkinFrequencyDays: z.coerce.number().int().min(7).max(28).optional(),
  preferredCheckinDayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
  preferredCheckinHour: z.coerce.number().int().min(0).max(23).optional(),
  contactChannel: z.enum(["WHATSAPP", "SMS"]).optional(),
  whatsappNumber: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission("canEditCheckinSchedule");
  if (!auth.ok) return auth.response;

  try {
    const patientId = Number(params.id);
    const patch = scheduleSchema.parse(await req.json());
    const patient = await patientsRepo.updatePatientSchedule(patientId, patch);
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    await logAudit(auth.actor, "PATIENT_SCHEDULE_UPDATE", "patient", String(patientId), patch);

    return NextResponse.json({ success: true, patient });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid schedule payload", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update schedule" }, { status: 500 });
  }
}
