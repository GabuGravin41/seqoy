import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as patientsRepo from "@/db/repository/patients";
import { requirePermission } from "@/lib/rbac/server";
import { logAudit } from "@/lib/security/audit";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("canViewAllPatients");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const riskFilter = searchParams.get("risk") ?? undefined;
  const clinicId = searchParams.get("clinicId");

  const patients = await patientsRepo.listPatients({
    risk: riskFilter,
    facilityId: clinicId ? Number(clinicId) : undefined,
  });

  return NextResponse.json({ total: patients.length, patients });
}

const newPatientSchema = z.object({
  fullName: z.string().min(1),
  phoneNumber: z.string().min(7),
  age: z.coerce.number().int().min(10).max(60).default(25),
  gestationalWeeks: z.coerce.number().int().min(1).max(45),
  gravida: z.coerce.number().int().min(0).default(1),
  parity: z.coerce.number().int().min(0).default(0),
  bloodType: z.string().default("O+"),
  preferredLanguage: z.enum(["SWAHILI", "ENGLISH", "KIKUYU", "LUO"]).default("SWAHILI"),
  primaryFacilityId: z.coerce.number().int().default(1),
  nationalId: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
  checkinFrequencyDays: z.coerce.number().int().min(7).max(28).optional(),
  preferredCheckinDayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
  preferredCheckinHour: z.coerce.number().int().min(0).max(23).optional(),
  contactChannel: z.enum(["WHATSAPP", "SMS"]).optional(),
  whatsappNumber: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requirePermission("canEnrolPatients");
  if (!auth.ok) return auth.response;

  try {
    const body = newPatientSchema.parse(await req.json());
    const patient = await patientsRepo.createPatient({
      ...body,
      estimatedDeliveryDate: body.estimatedDeliveryDate ?? "",
    });

    await logAudit(auth.actor, "PATIENT_ENROLL", "patient", String(patient.id));

    return NextResponse.json({ success: true, patient });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid patient payload", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to register patient" }, { status: 500 });
  }
}
