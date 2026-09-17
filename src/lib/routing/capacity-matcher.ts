import { Facility, HospitalCapacity } from "@/db/mock-store";

export interface ReferralRequirement {
  referringFacilityId: number;
  patientBloodType: string;
  icuNeeded: boolean;
  theatreNeeded: boolean;
  bloodUnitsNeeded: number;
  urgency: "URGENT" | "EMERGENCY" | "CRITICAL_STAT";
}

export interface MatchedHospital {
  facility: Facility;
  capacity: HospitalCapacity;
  distanceKm: number;
  estimatedTransitMinutes: number;
  isCapable: boolean;
  bottlenecks: string[];
  capacityScore: number; // 0 - 100
  recommendationRank: number;
  matchingSummary: string;
}

// Calculate Great Circle Distance in KM (Haversine formula)
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Estimated transit time accounting for urban traffic (e.g. Nairobi average speed ~ 30 km/h in emergency dispatch)
export function estimateEmergencyDriveMinutes(distanceKm: number): number {
  const emergencySpeedKmH = 35; // ambulance priority speed
  const baseMinutes = (distanceKm / emergencySpeedKmH) * 60;
  return Math.max(8, Math.round(baseMinutes + 4)); // include 4 min dispatch mobilization
}

export function matchReferralHospitals(
  req: ReferralRequirement,
  allFacilities: Facility[],
  allCapacities: HospitalCapacity[]
): {
  recommendedHospital: MatchedHospital | null;
  allHospitals: MatchedHospital[];
  blindReferralRiskIdentified: boolean;
  avoidedBlindHospitalName?: string;
} {
  const referringFacility = allFacilities.find((f) => f.id === req.referringFacilityId) || allFacilities[0];

  const referralFacilities = allFacilities.filter((f) => f.isReferralCenter);

  const matchedList: MatchedHospital[] = referralFacilities.map((facility) => {
    const capacity = allCapacities.find((c) => c.facilityId === facility.id) || {
      id: 0,
      facilityId: facility.id,
      icuBedsTotal: 0,
      icuBedsAvailable: 0,
      hduBedsTotal: 0,
      hduBedsAvailable: 0,
      maternityBedsAvailable: 0,
      operatingTheatresTotal: 0,
      operatingTheatresAvailable: 0,
      theatreReadinessStatus: "SHORT_STAFFED",
      bloodStock: { "A+": 0, "A-": 0, "B+": 0, "B-": 0, "AB+": 0, "AB-": 0, "O+": 0, "O-": 0 },
      obstetricianOnDuty: false,
      anesthesiologistOnDuty: false,
      neonatologistOnDuty: false,
      syncMode: "MANUAL" as const,
      lastUpdated: new Date().toISOString(),
    };

    const distKm = calculateHaversineDistance(
      referringFacility.latitude,
      referringFacility.longitude,
      facility.latitude,
      facility.longitude
    );
    const driveMinutes = estimateEmergencyDriveMinutes(distKm);

    const bottlenecks: string[] = [];
    let isCapable = true;
    let score = 100;

    // Check ICU requirement
    if (req.icuNeeded) {
      if (capacity.icuBedsAvailable < 1) {
        isCapable = false;
        bottlenecks.push("0 ICU beds available (100% occupied)");
        score -= 50;
      } else {
        score += capacity.icuBedsAvailable * 5;
      }
    }

    // Check Theatre requirement
    if (req.theatreNeeded) {
      if (capacity.operatingTheatresAvailable < 1 || capacity.theatreReadinessStatus === "SURGERY_IN_PROGRESS") {
        isCapable = false;
        bottlenecks.push("Operating Theatre occupied/unavailable");
        score -= 40;
      } else {
        score += capacity.operatingTheatresAvailable * 4;
      }
    }

    // Check Blood stock
    const bType = req.patientBloodType as keyof typeof capacity.bloodStock;
    const availableUnits = capacity.bloodStock[bType] ?? 0;
    if (req.bloodUnitsNeeded > 0) {
      if (availableUnits < req.bloodUnitsNeeded) {
        // Check emergency universal O- fallback
        const oNegUnits = capacity.bloodStock["O-"] ?? 0;
        if (bType !== "O-" && oNegUnits >= req.bloodUnitsNeeded) {
          bottlenecks.push(`Exact ${bType} low (${availableUnits} units), but ${oNegUnits} units O- universal reserve available`);
        } else {
          isCapable = false;
          bottlenecks.push(`Blood deficit: ${availableUnits}/${req.bloodUnitsNeeded} units ${bType} in stock`);
          score -= 40;
        }
      } else {
        score += availableUnits * 2;
      }
    }

    // Check Specialist Staffing
    if (!capacity.obstetricianOnDuty) {
      bottlenecks.push("Obstetric specialist off-site");
      score -= 20;
    }

    // Distance penalty
    score -= distKm * 1.5;

    let matchingSummary = "";
    if (isCapable) {
      matchingSummary = `CONFIRMED CAPACITY: ${capacity.icuBedsAvailable} ICU beds, ${capacity.operatingTheatresAvailable} Theatre ready, ${availableUnits} units ${req.patientBloodType} blood. ETA: ~${driveMinutes} mins.`;
    } else {
      matchingSummary = `CAPACITY BLOCKED: ${bottlenecks.join("; ")}`;
    }

    return {
      facility,
      capacity,
      distanceKm: distKm,
      estimatedTransitMinutes: driveMinutes,
      isCapable,
      bottlenecks,
      capacityScore: Math.max(0, Math.round(score)),
      recommendationRank: 0,
      matchingSummary,
    };
  });

  // Sort capable first, then highest capacity score, then lowest transit time
  matchedList.sort((a, b) => {
    if (a.isCapable && !b.isCapable) return -1;
    if (!a.isCapable && b.isCapable) return 1;
    return b.capacityScore - a.capacityScore;
  });

  matchedList.forEach((item, index) => {
    item.recommendationRank = index + 1;
  });

  const recommendedHospital = matchedList.find((h) => h.isCapable) || null;

  // Check if standard national default (e.g. KNH) would have caused a blind referral disaster
  const knh = matchedList.find((h) => h.facility.name.includes("Kenyatta National Hospital"));
  let blindReferralRiskIdentified = false;
  let avoidedBlindHospitalName: string | undefined;

  if (knh && !knh.isCapable && recommendedHospital && recommendedHospital.facility.id !== knh.facility.id) {
    blindReferralRiskIdentified = true;
    avoidedBlindHospitalName = `${knh.facility.name} (Blocked: ${knh.bottlenecks.join(", ")})`;
  }

  return {
    recommendedHospital,
    allHospitals: matchedList,
    blindReferralRiskIdentified,
    avoidedBlindHospitalName,
  };
}
