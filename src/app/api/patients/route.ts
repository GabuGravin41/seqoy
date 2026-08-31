import { NextRequest, NextResponse } from "next/server";
import { mockStore, Patient } from "@/db/mock-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const riskFilter = searchParams.get("risk");
  const clinicId = searchParams.get("clinicId");

  let list = mockStore.patients;

  if (riskFilter) {
    list = list.filter((p) => p.currentRiskLevel === riskFilter.toUpperCase());
  }

  if (clinicId) {
    list = list.filter((p) => p.primaryFacilityId === Number(clinicId));
  }

  return NextResponse.json({
    total: list.length,
    patients: list,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      phoneNumber,
      age,
      gestationalWeeks,
      bloodType = "O+",
      preferredLanguage = "SWAHILI",
      primaryFacilityId = 1,
      nationalId,
    } = body;

    if (!fullName || !phoneNumber || !gestationalWeeks) {
      return NextResponse.json(
        { error: "fullName, phoneNumber, and gestationalWeeks are required" },
        { status: 400 }
      );
    }

    const newPatient: Patient = {
      id: mockStore.patients.length + 1,
      nationalId,
      fullName,
      phoneNumber,
      age: Number(age) || 25,
      gravida: Number(body.gravida) || 1,
      parity: Number(body.parity) || 0,
      gestationalWeeks: Number(gestationalWeeks),
      estimatedDeliveryDate: body.estimatedDeliveryDate || "2026-11-01",
      bloodType,
      preferredLanguage: preferredLanguage.toUpperCase() as any,
      primaryFacilityId: Number(primaryFacilityId),
      currentRiskLevel: "NORMAL",
      createdAt: new Date().toISOString(),
    };

    mockStore.patients.unshift(newPatient);

    return NextResponse.json({
      success: true,
      patient: newPatient,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to register patient" }, { status: 500 });
  }
}
