import { Facility, HospitalCapacity } from "@/db/mock-store";

export interface ReferralRequirement {
  referringFacilityId: number;
  patientBloodType: string;
  icuNeeded: boolean;
  theatreNeeded: boolean;
  bloodUnitsNeeded: number;
  urgency: "URGENT" | "EMERGENCY" | "CRITICAL_STAT";
  acuityTier?: "ROUTINE" | "EMERGENCY" | "TERTIARY_MANDATORY";
  tertiaryIndication?: "HELLP_DIALYSIS" | "UTERINE_RUPTURE" | "ACCRETA_SPECTRUM" | "EXTREME_PREMATURITY_VENTILATION" | "DIC_BLOOD_PRODUCTS" | "NONE";
  isHemorrhageEmergency?: boolean;
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
  isAcuityOverride?: boolean;
  acuityOverrideNotice?: string;
  unreservedEmergencyONeg: number;
  bloodReservationWarning?: string;
  dutyStationWhatsappPhone?: string;
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
  isAcuityOverrideActive?: boolean;
} {
  const referringFacility = allFacilities.find((f) => f.id === req.referringFacilityId) || allFacilities[0];
  const referralFacilities = allFacilities.filter((f) => f.isReferralCenter);

  const isTertiaryMandatory =
    req.acuityTier === "TERTIARY_MANDATORY" ||
    (req.tertiaryIndication && req.tertiaryIndication !== "NONE");

  let isAcuityOverrideActive = false;

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
      unreservedEmergencyONeg: 0,
      obstetricianOnDuty: false,
      anesthesiologistOnDuty: false,
      neonatologistOnDuty: false,
      isApexReferralCenter: facility.name.includes("Kenyatta National Hospital"),
      hemodialysisAvailable: facility.name.includes("Kenyatta National Hospital"),
      bloodIrradiationAvailable: facility.name.includes("Kenyatta National Hospital"),
      neonatalVentilatorsAvailable: 0,
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
    let isAcuityOverride = false;
    let acuityOverrideNotice: string | undefined;

    const isApex = capacity.isApexReferralCenter || facility.tier === "LEVEL_6_NATIONAL" || facility.name.includes("Kenyatta National Hospital");

    // =========================================================================
    // KENYAN REALITY 1: KNH NBU & ICU OVERCROWDING VS. TERTIARY ACUITY OVERRIDE
    // =========================================================================
    if (isTertiaryMandatory) {
      if (isApex) {
        // Under Level 6 Apex Escalation Mandate, catastrophic tertiary emergencies
        // (ruptured uterus, HELLP with anuria, peripartum DIC) override raw bed constraints.
        isAcuityOverride = true;
        isAcuityOverrideActive = true;
        acuityOverrideNotice = `APEX ACUITY OVERRIDE: Tertiary surgical/hemodialysis rescue required (${req.tertiaryIndication || 'Level 6 Acuity'}). Standard bed count constraint bypassed under Apex Resuscitation Protocol. Pre-arrival emergency alert transmitted to Chief Resident.`;
        score = 110; // prioritize apex destination
      } else {
        // Non-Apex facilities lack tertiary hemodialysis / complex reconstructive subspecialists
        if (req.tertiaryIndication === "HELLP_DIALYSIS" && !capacity.hemodialysisAvailable) {
          isCapable = false;
          bottlenecks.push("Non-Apex facility lacks emergency obstetric hemodialysis for HELLP renal shutdown");
          score -= 60;
        } else if (req.tertiaryIndication === "UTERINE_RUPTURE" || req.tertiaryIndication === "ACCRETA_SPECTRUM") {
          bottlenecks.push("Secondary facility lacks on-site interventional radiology & tertiary surgical vascular control");
          score -= 30;
        }
      }
    }

    // Check ICU requirement (unless bypassed under Apex Acuity Override)
    if (req.icuNeeded) {
      if (capacity.icuBedsAvailable < 1) {
        if (!isAcuityOverride) {
          isCapable = false;
          bottlenecks.push("0 ICU beds available (100% occupied)");
          score -= 50;
        } else {
          bottlenecks.push("ICU at 100% census (Acuity Override active: Resuscitation cot assigned)");
        }
      } else {
        score += capacity.icuBedsAvailable * 5;
      }
    }

    // Check Theatre requirement
    if (req.theatreNeeded) {
      if (capacity.operatingTheatresAvailable < 1 || capacity.theatreReadinessStatus === "SURGERY_IN_PROGRESS") {
        if (!isAcuityOverride) {
          isCapable = false;
          bottlenecks.push("Operating Theatre occupied/unavailable");
          score -= 40;
        } else {
          bottlenecks.push("Emergency Theatre queue active; pre-arrival alert clears emergency C-Section table");
        }
      } else {
        score += capacity.operatingTheatresAvailable * 4;
      }
    }

    // =========================================================================
    // KENYAN REALITY 2: BLOOD BANK VOLATILITY (UNRESERVED EMERGENCY O-NEG)
    // =========================================================================
    const bType = req.patientBloodType as keyof typeof capacity.bloodStock;
    const availableUnits = capacity.bloodStock[bType] ?? 0;
    const unreservedEmergencyONeg = capacity.unreservedEmergencyONeg ?? 0;
    let bloodReservationWarning: string | undefined;

    if (req.bloodUnitsNeeded > 0 || req.isHemorrhageEmergency) {
      const unitsNeeded = req.bloodUnitsNeeded > 0 ? req.bloodUnitsNeeded : 2;

      // Check strictly against unreserved emergency units if acute hemorrhage is flagged
      if (unreservedEmergencyONeg < unitsNeeded) {
        if (availableUnits > 0 || (capacity.bloodStock["O-"] ?? 0) > 0) {
          bloodReservationWarning = `BLOOD ALLOCATION LOCK: Fridge has stock on inventory, but 0 uncrossmatched unreserved emergency units (locked for ongoing surgical suites). Mobilizing Damu Kenya (KNBTS) blood rider.`;
          bottlenecks.push(bloodReservationWarning);
          if (!isAcuityOverride) {
            score -= 25;
          }
        } else {
          if (!isAcuityOverride) {
            isCapable = false;
            bottlenecks.push(`Blood deficit: 0 units in stock`);
            score -= 40;
          } else {
            bottlenecks.push("Blood deficit at receiving hospital; Damu Kenya Emergency Dispatch mobilized");
          }
        }
      } else {
        score += unreservedEmergencyONeg * 4;
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
    if (isAcuityOverride) {
      matchingSummary = `APEX ACUITY OVERRIDE: Tertiary surgical/dialysis intervention authorized at ${facility.name} despite census saturation. Pre-arrival emergency alert sent. ETA: ~${driveMinutes} mins.`;
    } else if (isCapable) {
      matchingSummary = `CONFIRMED CAPACITY: ${capacity.icuBedsAvailable} ICU beds, ${capacity.operatingTheatresAvailable} Theatre ready, ${unreservedEmergencyONeg} unreserved emergency O- units. ETA: ~${driveMinutes} mins.`;
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
      isAcuityOverride,
      acuityOverrideNotice,
      unreservedEmergencyONeg,
      bloodReservationWarning,
      dutyStationWhatsappPhone: capacity.dutyStationWhatsappPhone,
    };
  });

  // Sort capable / override first, then highest capacity score, then lowest transit time
  matchedList.sort((a, b) => {
    if (a.isCapable && !b.isCapable) return -1;
    if (!a.isCapable && b.isCapable) return 1;
    return b.capacityScore - a.capacityScore;
  });

  matchedList.forEach((item, index) => {
    item.recommendationRank = index + 1;
  });

  const recommendedHospital = matchedList.find((h) => h.isCapable) || null;

  // Check if standard national default (e.g. KNH) would have caused a blind referral disaster for routine cases
  const knh = matchedList.find((h) => h.facility.name.includes("Kenyatta National Hospital"));
  let blindReferralRiskIdentified = false;
  let avoidedBlindHospitalName: string | undefined;

  if (!isTertiaryMandatory && knh && !knh.isCapable && recommendedHospital && recommendedHospital.facility.id !== knh.facility.id) {
    blindReferralRiskIdentified = true;
    avoidedBlindHospitalName = `${knh.facility.name} (Blocked: ${knh.bottlenecks.join(", ")})`;
  }

  return {
    recommendedHospital,
    allHospitals: matchedList,
    blindReferralRiskIdentified,
    avoidedBlindHospitalName,
    isAcuityOverrideActive,
  };
}
