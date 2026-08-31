import { NextRequest, NextResponse } from "next/server";
import { mockStore, HospitalCapacity } from "@/db/mock-store";
import { calculateHaversineDistance, estimateEmergencyDriveMinutes } from "@/lib/routing/capacity-matcher";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get("facilityId");
  const referringClinicId = searchParams.get("referringClinicId") || "1";

  const referringFacility = mockStore.facilities.find(
    (f) => f.id === Number(referringClinicId)
  ) || mockStore.facilities[0];

  let capacities = mockStore.capacities.map((cap) => {
    const facility = mockStore.facilities.find((f) => f.id === cap.facilityId);
    let distanceKm = 0;
    let estimatedDriveMinutes = 0;

    if (facility) {
      distanceKm = calculateHaversineDistance(
        referringFacility.latitude,
        referringFacility.longitude,
        facility.latitude,
        facility.longitude
      );
      estimatedDriveMinutes = estimateEmergencyDriveMinutes(distanceKm);
    }

    return {
      ...cap,
      facilityName: facility?.name || `Hospital #${cap.facilityId}`,
      facilityTier: facility?.tier || "LEVEL_5_COUNTY",
      county: facility?.county || "Nairobi",
      subCounty: facility?.subCounty || "General",
      emergencyPhone: facility?.emergencyPhone || "+254700000000",
      distanceKm,
      estimatedDriveMinutes,
    };
  });

  if (facilityId) {
    const single = capacities.find((c) => c.facilityId === Number(facilityId));
    if (!single) {
      return NextResponse.json({ error: "Hospital capacity record not found" }, { status: 404 });
    }
    return NextResponse.json({ capacity: single });
  }

  return NextResponse.json({
    referringClinic: {
      id: referringFacility.id,
      name: referringFacility.name,
      county: referringFacility.county,
    },
    totalHospitals: capacities.length,
    capacities,
    lastRefreshed: new Date().toISOString(),
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { facilityId } = body;

    if (!facilityId) {
      return NextResponse.json({ error: "facilityId is required" }, { status: 400 });
    }

    let capacity = mockStore.capacities.find((c) => c.facilityId === Number(facilityId));

    if (!capacity) {
      return NextResponse.json({ error: "Hospital capacity not found" }, { status: 404 });
    }

    // Update bed counts if passed
    if (body.icuBedsAvailable !== undefined) capacity.icuBedsAvailable = Number(body.icuBedsAvailable);
    if (body.icuBedsTotal !== undefined) capacity.icuBedsTotal = Number(body.icuBedsTotal);
    if (body.hduBedsAvailable !== undefined) capacity.hduBedsAvailable = Number(body.hduBedsAvailable);
    if (body.maternityBedsAvailable !== undefined) capacity.maternityBedsAvailable = Number(body.maternityBedsAvailable);

    // Update theatre
    if (body.operatingTheatresAvailable !== undefined)
      capacity.operatingTheatresAvailable = Number(body.operatingTheatresAvailable);
    if (body.theatreReadinessStatus !== undefined)
      capacity.theatreReadinessStatus = body.theatreReadinessStatus;

    // Update blood stock
    if (body.bloodStock) {
      capacity.bloodStock = {
        ...capacity.bloodStock,
        ...body.bloodStock,
      };
    }

    // Update staff
    if (body.obstetricianOnDuty !== undefined) capacity.obstetricianOnDuty = Boolean(body.obstetricianOnDuty);
    if (body.anesthesiologistOnDuty !== undefined) capacity.anesthesiologistOnDuty = Boolean(body.anesthesiologistOnDuty);
    if (body.neonatologistOnDuty !== undefined) capacity.neonatologistOnDuty = Boolean(body.neonatologistOnDuty);

    capacity.lastUpdated = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: "Hospital capacity state updated in real time",
      capacity,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update capacity" }, { status: 500 });
  }
}
