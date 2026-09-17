import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { matchReferralHospitals, ReferralRequirement } from "@/lib/routing/capacity-matcher";
import * as patientsRepo from "@/db/repository/patients";
import * as facilitiesRepo from "@/db/repository/facilities";
import * as capacitiesRepo from "@/db/repository/capacities";
import { requirePermission } from "@/lib/rbac/server";

const matchSchema = z.object({
  referringFacilityId: z.coerce.number().int().default(1),
  patientId: z.coerce.number().int().optional(),
  patientBloodType: z.string().optional(),
  icuNeeded: z.boolean().default(true),
  theatreNeeded: z.boolean().default(true),
  bloodUnitsNeeded: z.coerce.number().int().min(0).default(2),
  urgency: z.enum(["URGENT", "EMERGENCY", "CRITICAL_STAT"]).default("EMERGENCY"),
});

/** Delay 3: which referral hospital genuinely has capacity for this patient right now. */
export async function POST(req: NextRequest) {
  const auth = await requirePermission("canViewCapacity");
  if (!auth.ok) return auth.response;

  try {
    const body = matchSchema.parse(await req.json());

    let bloodType = body.patientBloodType;
    let patientName = "Expectant Mother";
    if (body.patientId) {
      const patient = await patientsRepo.getPatientById(body.patientId);
      if (patient) {
        if (!bloodType) bloodType = patient.bloodType;
        patientName = patient.fullName;
      }
    }
    if (!bloodType) bloodType = "O+";

    const requirement: ReferralRequirement = {
      referringFacilityId: body.referringFacilityId,
      patientBloodType: bloodType,
      icuNeeded: body.icuNeeded,
      theatreNeeded: body.theatreNeeded,
      bloodUnitsNeeded: body.bloodUnitsNeeded,
      urgency: body.urgency,
    };

    const [facilities, capacities] = await Promise.all([facilitiesRepo.listFacilities(), capacitiesRepo.listCapacities()]);
    const matchResult = matchReferralHospitals(requirement, facilities, capacities);

    return NextResponse.json({
      success: true,
      patientName,
      requirement,
      recommendedHospital: matchResult.recommendedHospital,
      allHospitals: matchResult.allHospitals,
      blindReferralRiskIdentified: matchResult.blindReferralRiskIdentified,
      avoidedBlindHospitalName: matchResult.avoidedBlindHospitalName,
      insight: matchResult.blindReferralRiskIdentified
        ? `Referral blindness avoided: ${matchResult.avoidedBlindHospitalName} was ruled out because required beds or blood were depleted. ${matchResult.recommendedHospital?.facility.name} has confirmed capacity instead.`
        : `Confirmed capable facility found within ${matchResult.recommendedHospital?.estimatedTransitMinutes ?? "an estimated"} mins travel.`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid match request", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to compute referral match" }, { status: 500 });
  }
}
