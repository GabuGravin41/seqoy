import { NextRequest, NextResponse } from "next/server";
import { matchReferralHospitals, ReferralRequirement } from "@/lib/routing/capacity-matcher";
import { mockStore } from "@/db/mock-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      referringFacilityId = 1,
      patientId,
      patientBloodType,
      icuNeeded = true,
      theatreNeeded = true,
      bloodUnitsNeeded = 2,
      urgency = "EMERGENCY",
    } = body;

    let bloodType = patientBloodType;
    let patientName = "Emergency Patient";

    if (patientId) {
      const patient = mockStore.patients.find((p) => p.id === Number(patientId));
      if (patient) {
        if (!bloodType) bloodType = patient.bloodType;
        patientName = patient.fullName;
      }
    }

    if (!bloodType) bloodType = "O+";

    const requirement: ReferralRequirement = {
      referringFacilityId: Number(referringFacilityId),
      patientBloodType: bloodType,
      icuNeeded: Boolean(icuNeeded),
      theatreNeeded: Boolean(theatreNeeded),
      bloodUnitsNeeded: Number(bloodUnitsNeeded),
      urgency: urgency as any,
    };

    const matchResult = matchReferralHospitals(requirement);

    return NextResponse.json({
      success: true,
      patientName,
      requirement,
      recommendedHospital: matchResult.recommendedHospital,
      allHospitals: matchResult.allHospitals,
      blindReferralRiskIdentified: matchResult.blindReferralRiskIdentified,
      avoidedBlindHospitalName: matchResult.avoidedBlindHospitalName,
      insight: matchResult.blindReferralRiskIdentified
        ? `🚨 AVOIDED REFERRAL BLINDNESS: Standard transfer to ${matchResult.avoidedBlindHospitalName} was prevented because required ICU beds or blood were depleted. Safely routed to ${matchResult.recommendedHospital?.facility.name}.`
        : `✅ Confirmed capable facility found within ${matchResult.recommendedHospital?.estimatedTransitMinutes} mins transit.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to compute referral match" }, { status: 500 });
  }
}
