import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as facilitiesRepo from "@/db/repository/facilities";
import * as capacitiesRepo from "@/db/repository/capacities";
import { calculateHaversineDistance, estimateEmergencyDriveMinutes } from "@/lib/routing/capacity-matcher";
import { requirePermission } from "@/lib/rbac/server";
import { hasPermission } from "@/lib/rbac/permissions";
import { logAudit } from "@/lib/security/audit";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("canViewCapacity");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get("facilityId");
  const referringClinicId = searchParams.get("referringClinicId") || "1";

  const [facilities, capacities] = await Promise.all([facilitiesRepo.listFacilities(), capacitiesRepo.listCapacities()]);
  const referringFacility = facilities.find((f) => f.id === Number(referringClinicId)) || facilities[0];

  const enriched = capacities.map((cap) => {
    const facility = facilities.find((f) => f.id === cap.facilityId);
    let distanceKm = 0;
    let estimatedDriveMinutes = 0;
    if (facility && referringFacility) {
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
    const single = enriched.find((c) => c.facilityId === Number(facilityId));
    if (!single) return NextResponse.json({ error: "Hospital capacity record not found" }, { status: 404 });
    return NextResponse.json({ capacity: single });
  }

  return NextResponse.json({
    referringClinic: referringFacility
      ? { id: referringFacility.id, name: referringFacility.name, county: referringFacility.county }
      : null,
    totalHospitals: enriched.length,
    capacities: enriched,
    lastRefreshed: new Date().toISOString(),
  });
}

const capacityUpdateSchema = z.object({
  facilityId: z.coerce.number().int(),
  icuBedsAvailable: z.coerce.number().int().min(0).optional(),
  icuBedsTotal: z.coerce.number().int().min(0).optional(),
  hduBedsAvailable: z.coerce.number().int().min(0).optional(),
  maternityBedsAvailable: z.coerce.number().int().min(0).optional(),
  operatingTheatresAvailable: z.coerce.number().int().min(0).optional(),
  theatreReadinessStatus: z.enum(["READY", "SURGERY_IN_PROGRESS", "STERILIZING", "SHORT_STAFFED"]).optional(),
  bloodStock: z
    .record(z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]), z.coerce.number().int().min(0))
    .optional(),
  obstetricianOnDuty: z.boolean().optional(),
  anesthesiologistOnDuty: z.boolean().optional(),
  neonatologistOnDuty: z.boolean().optional(),
});

/** Manual capacity update screen — the fallback for facilities without an EHR/HIMS webhook feed. */
export async function PUT(req: NextRequest) {
  const auth = await requirePermission("canViewCapacity");
  if (!auth.ok) return auth.response;

  const isBedUpdate =
    !hasPermission(auth.actor.role, "canUpdateCapacity") &&
    !hasPermission(auth.actor.role, "canUpdateBloodStock");
  if (isBedUpdate) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = capacityUpdateSchema.parse(await req.json());
    const { facilityId, bloodStock, ...bedPatch } = body;

    const hasBedFields = Object.keys(bedPatch).length > 0;
    if (hasBedFields && !hasPermission(auth.actor.role, "canUpdateCapacity")) {
      return NextResponse.json({ error: "Only a bed manager can update bed/theatre capacity" }, { status: 403 });
    }
    if (bloodStock && !hasPermission(auth.actor.role, "canUpdateBloodStock")) {
      return NextResponse.json({ error: "Only a blood bank officer can update blood stock" }, { status: 403 });
    }

    const capacity = await capacitiesRepo.updateCapacity(facilityId, { ...bedPatch, bloodStock, source: "MANUAL" });
    if (!capacity) return NextResponse.json({ error: "Hospital capacity not found" }, { status: 404 });

    await logAudit(auth.actor, "CAPACITY_UPDATE", "facility", String(facilityId), body);

    return NextResponse.json({ success: true, message: "Hospital capacity updated", capacity });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid capacity payload", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update capacity" }, { status: 500 });
  }
}
