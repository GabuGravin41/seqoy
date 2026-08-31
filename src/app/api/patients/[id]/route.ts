import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/db/mock-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const patientId = Number(params.id);
  const patient = mockStore.patients.find((p) => p.id === patientId);

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const checkins = mockStore.checkins.filter((c) => c.patientId === patientId);
  const facility = mockStore.facilities.find((f) => f.id === patient.primaryFacilityId);
  const referrals = mockStore.referrals.filter((r) => r.patientId === patientId);

  return NextResponse.json({
    patient,
    primaryFacility: facility,
    checkins,
    referrals,
  });
}
