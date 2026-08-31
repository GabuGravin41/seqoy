// In-memory data store for zero-friction local development and API testing

export interface Facility {
  id: number;
  name: string;
  tier: "LEVEL_3_CLINIC" | "LEVEL_4_SUBCOUNTY" | "LEVEL_5_COUNTY" | "LEVEL_6_NATIONAL";
  county: string;
  subCounty: string;
  latitude: number;
  longitude: number;
  emergencyPhone: string;
  isReferralCenter: boolean;
  createdAt: string;
}

export interface Patient {
  id: number;
  nationalId?: string;
  fullName: string;
  phoneNumber: string;
  age: number;
  gravida: number;
  parity: number;
  gestationalWeeks: number;
  estimatedDeliveryDate: string;
  bloodType: string;
  preferredLanguage: "SWAHILI" | "ENGLISH" | "KIKUYU" | "LUO";
  primaryFacilityId: number;
  currentRiskLevel: "NORMAL" | "ELEVATED_RISK" | "CRITICAL_EMERGENCY";
  lastCheckinAt?: string;
  createdAt: string;
}

export interface HealthCheckin {
  id: number;
  patientId: number;
  channel: "VOICE_AI" | "USSD" | "SMS" | "IN_PERSON";
  languageUsed: string;
  hasSevereHeadache: boolean;
  hasBlurredVision: boolean;
  hasSevereSwelling: boolean;
  hasVaginalBleeding: boolean;
  hasHighFever: boolean;
  hasReducedFetalMovement: boolean;
  hasSevereAbdominalPain: boolean;
  systolicBp?: number;
  diastolicBp?: number;
  transcript?: string;
  aiClinicalSummary?: string;
  riskScore: number;
  riskLevel: "NORMAL" | "ELEVATED_RISK" | "CRITICAL_EMERGENCY";
  suspectedCondition?: "PREECLAMPSIA" | "PPH" | "SEPSIS" | "OBSTRUCTED_LABOR" | "NONE";
  flaggedForImmediateReferral: boolean;
  createdAt: string;
}

export interface HospitalCapacity {
  id: number;
  facilityId: number;
  facilityName?: string;
  county?: string;
  distanceKm?: number;
  estimatedDriveMinutes?: number;
  
  icuBedsTotal: number;
  icuBedsAvailable: number;
  hduBedsTotal: number;
  hduBedsAvailable: number;
  maternityBedsAvailable: number;
  
  operatingTheatresTotal: number;
  operatingTheatresAvailable: number;
  theatreReadinessStatus: "READY" | "SURGERY_IN_PROGRESS" | "STERILIZING" | "SHORT_STAFFED";
  
  bloodStock: {
    "A+": number;
    "A-": number;
    "B+": number;
    "B-": number;
    "AB+": number;
    "AB-": number;
    "O+": number;
    "O-": number;
  };
  
  obstetricianOnDuty: boolean;
  anesthesiologistOnDuty: boolean;
  neonatologistOnDuty: boolean;
  lastUpdated: string;
}

export interface EmergencyReferral {
  id: number;
  referralCode: string;
  patientId: number;
  patientName?: string;
  referringFacilityId: number;
  referringFacilityName?: string;
  receivingFacilityId: number;
  receivingFacilityName?: string;
  clinicalIndication: string;
  urgencyLevel: "URGENT" | "EMERGENCY" | "CRITICAL_STAT";
  
  icuBedReserved: boolean;
  theatreReserved: boolean;
  bloodUnitsReserved: number;
  bloodTypeReserved?: string;
  
  transportDispatchId?: string;
  ambulanceCallSign?: string;
  estimatedTransitMinutes?: number;
  transportTrackingUrl?: string;
  
  status: "REQUESTED" | "MATCHED" | "AMBULANCE_DISPATCHED" | "IN_TRANSIT" | "ARRIVED_AT_RECEIVING" | "ADMITTED" | "COMPLETED";
  preArrivalHandoverNote?: string;
  initiatedAt: string;
  ambulanceDispatchedAt?: string;
  patientAdmittedAt?: string;
}

export interface MPDSRAuditLog {
  id: number;
  referralId: number;
  patientId: number;
  patientName: string;
  county: string;
  delay1DurationMinutes: number;
  delay2DurationMinutes: number;
  delay3DurationMinutes: number;
  delay1Factor: string;
  delay2Factor: string;
  delay3Factor: string;
  wasPreventableDelayIdentified: boolean;
  clinicalOutcome: string;
  executiveAuditSummary: string;
  createdAt: string;
}

// Initial Mock Data (Kenyan Health Facilities)
export const initialFacilities: Facility[] = [
  {
    id: 1,
    name: "Kangemi Health Centre",
    tier: "LEVEL_3_CLINIC",
    county: "Nairobi",
    subCounty: "Westlands",
    latitude: -1.2618,
    longitude: 36.7513,
    emergencyPhone: "+254711000101",
    isReferralCenter: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Pumwani Maternity Hospital",
    tier: "LEVEL_5_COUNTY",
    county: "Nairobi",
    subCounty: "Kamukunji",
    latitude: -1.2789,
    longitude: 36.8488,
    emergencyPhone: "+254711000202",
    isReferralCenter: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Kenyatta National Hospital (KNH)",
    tier: "LEVEL_6_NATIONAL",
    county: "Nairobi",
    subCounty: "Kibra",
    latitude: -1.3015,
    longitude: 36.8073,
    emergencyPhone: "+254711000303",
    isReferralCenter: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Kiambu County Referral Hospital",
    tier: "LEVEL_5_COUNTY",
    county: "Kiambu",
    subCounty: "Kiambu Town",
    latitude: -1.1714,
    longitude: 36.8356,
    emergencyPhone: "+254711000404",
    isReferralCenter: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Mbagathi County Hospital",
    tier: "LEVEL_4_SUBCOUNTY",
    county: "Nairobi",
    subCounty: "Lang'ata",
    latitude: -1.3121,
    longitude: 36.7942,
    emergencyPhone: "+254711000505",
    isReferralCenter: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    name: "Mama Lucy Kibaki Hospital",
    tier: "LEVEL_5_COUNTY",
    county: "Nairobi",
    subCounty: "Embakasi Central",
    latitude: -1.2731,
    longitude: 36.9022,
    emergencyPhone: "+254711000606",
    isReferralCenter: true,
    createdAt: new Date().toISOString(),
  }
];

export const initialCapacities: HospitalCapacity[] = [
  {
    id: 1,
    facilityId: 2, // Pumwani
    icuBedsTotal: 8,
    icuBedsAvailable: 3,
    hduBedsTotal: 12,
    hduBedsAvailable: 5,
    maternityBedsAvailable: 24,
    operatingTheatresTotal: 4,
    operatingTheatresAvailable: 2,
    theatreReadinessStatus: "READY",
    bloodStock: {
      "A+": 6,
      "A-": 2,
      "B+": 8,
      "B-": 1,
      "AB+": 3,
      "AB-": 1,
      "O+": 14,
      "O-": 4,
    },
    obstetricianOnDuty: true,
    anesthesiologistOnDuty: true,
    neonatologistOnDuty: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 2,
    facilityId: 3, // KNH (Overcrowded baseline)
    icuBedsTotal: 30,
    icuBedsAvailable: 0, // 0 ICU Beds available (Simulates Delay 3 problem!)
    hduBedsTotal: 25,
    hduBedsAvailable: 1,
    maternityBedsAvailable: 3,
    operatingTheatresTotal: 8,
    operatingTheatresAvailable: 0,
    theatreReadinessStatus: "SURGERY_IN_PROGRESS",
    bloodStock: {
      "A+": 2,
      "A-": 0,
      "B+": 3,
      "B-": 0,
      "AB+": 1,
      "AB-": 0,
      "O+": 5,
      "O-": 0, // Out of O-
    },
    obstetricianOnDuty: true,
    anesthesiologistOnDuty: true,
    neonatologistOnDuty: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 3,
    facilityId: 4, // Kiambu County Referral (Great Alternative!)
    icuBedsTotal: 6,
    icuBedsAvailable: 4,
    hduBedsTotal: 8,
    hduBedsAvailable: 4,
    maternityBedsAvailable: 18,
    operatingTheatresTotal: 3,
    operatingTheatresAvailable: 2,
    theatreReadinessStatus: "READY",
    bloodStock: {
      "A+": 8,
      "A-": 3,
      "B+": 6,
      "B-": 2,
      "AB+": 4,
      "AB-": 2,
      "O+": 16,
      "O-": 5, // Rich in O-
    },
    obstetricianOnDuty: true,
    anesthesiologistOnDuty: true,
    neonatologistOnDuty: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 4,
    facilityId: 5, // Mbagathi
    icuBedsTotal: 4,
    icuBedsAvailable: 1,
    hduBedsTotal: 6,
    hduBedsAvailable: 2,
    maternityBedsAvailable: 10,
    operatingTheatresTotal: 2,
    operatingTheatresAvailable: 1,
    theatreReadinessStatus: "READY",
    bloodStock: {
      "A+": 4,
      "A-": 1,
      "B+": 5,
      "B-": 1,
      "AB+": 2,
      "AB-": 0,
      "O+": 9,
      "O-": 2,
    },
    obstetricianOnDuty: true,
    anesthesiologistOnDuty: true,
    neonatologistOnDuty: false,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 5,
    facilityId: 6, // Mama Lucy Kibaki
    icuBedsTotal: 6,
    icuBedsAvailable: 2,
    hduBedsTotal: 8,
    hduBedsAvailable: 3,
    maternityBedsAvailable: 14,
    operatingTheatresTotal: 3,
    operatingTheatresAvailable: 1,
    theatreReadinessStatus: "READY",
    bloodStock: {
      "A+": 5,
      "A-": 2,
      "B+": 7,
      "B-": 2,
      "AB+": 3,
      "AB-": 1,
      "O+": 11,
      "O-": 3,
    },
    obstetricianOnDuty: true,
    anesthesiologistOnDuty: true,
    neonatologistOnDuty: true,
    lastUpdated: new Date().toISOString(),
  }
];

export const initialPatients: Patient[] = [
  {
    id: 1,
    nationalId: "29481902",
    fullName: "Amina Wanjiku Mwangi",
    phoneNumber: "+254712345678",
    age: 26,
    gravida: 2,
    parity: 1,
    gestationalWeeks: 34,
    estimatedDeliveryDate: "2026-10-15",
    bloodType: "O-",
    preferredLanguage: "SWAHILI",
    primaryFacilityId: 1, // Kangemi Health Centre
    currentRiskLevel: "CRITICAL_EMERGENCY",
    lastCheckinAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    nationalId: "33190822",
    fullName: "Faith Nekesa Juma",
    phoneNumber: "+254722998877",
    age: 22,
    gravida: 1,
    parity: 0,
    gestationalWeeks: 28,
    estimatedDeliveryDate: "2026-11-28",
    bloodType: "A+",
    preferredLanguage: "ENGLISH",
    primaryFacilityId: 1,
    currentRiskLevel: "NORMAL",
    lastCheckinAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    nationalId: "24881900",
    fullName: "Mary Akinyi Ochieng",
    phoneNumber: "+254733445566",
    age: 31,
    gravida: 3,
    parity: 2,
    gestationalWeeks: 38,
    estimatedDeliveryDate: "2026-09-10",
    bloodType: "B+",
    preferredLanguage: "SWAHILI",
    primaryFacilityId: 1,
    currentRiskLevel: "ELEVATED_RISK",
    lastCheckinAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    createdAt: new Date().toISOString(),
  }
];

export const initialCheckins: HealthCheckin[] = [
  {
    id: 1,
    patientId: 1,
    channel: "VOICE_AI",
    languageUsed: "SWAHILI",
    hasSevereHeadache: true,
    hasBlurredVision: true,
    hasSevereSwelling: true,
    hasVaginalBleeding: false,
    hasHighFever: false,
    hasReducedFetalMovement: true,
    hasSevereAbdominalPain: true,
    systolicBp: 165,
    diastolicBp: 110,
    transcript: "Mama alieleza maumivu makali ya kichwa tangu asubuhi, kutoona vizuri (ukungu machoni), na uvimbe miguuni na usoni. Alisema mtoto hachezi vizuri.",
    aiClinicalSummary: "CRITICAL PRE-ECLAMPSIA TRIAD: Severe refractory headache, visual scotoma, marked peripheral edema, and reduced fetal movement at 34 weeks gestation. High risk of imminent eclamptic convulsion.",
    riskScore: 92,
    riskLevel: "CRITICAL_EMERGENCY",
    suspectedCondition: "PREECLAMPSIA",
    flaggedForImmediateReferral: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  }
];

export const initialReferrals: EmergencyReferral[] = [
  {
    id: 1,
    referralCode: "SEQ-REF-2026-001",
    patientId: 1,
    patientName: "Amina Wanjiku Mwangi",
    referringFacilityId: 1,
    referringFacilityName: "Kangemi Health Centre",
    receivingFacilityId: 4,
    receivingFacilityName: "Kiambu County Referral Hospital",
    clinicalIndication: "SEVERE_PREECLAMPSIA",
    urgencyLevel: "CRITICAL_STAT",
    icuBedReserved: true,
    theatreReserved: true,
    bloodUnitsReserved: 2,
    bloodTypeReserved: "O-",
    transportDispatchId: "DISPATCH-8831",
    ambulanceCallSign: "MEDIC-ALPHA-04",
    estimatedTransitMinutes: 18,
    transportTrackingUrl: "https://track.seqoy.health/dispatch/DISPATCH-8831",
    status: "IN_TRANSIT",
    preArrivalHandoverNote: "Patient 34wks with BP 165/110, severe headache, blurred vision. Loading dose Magnesium Sulphate 4g IV given at 20:10. O- blood reserved. ICU Bed #2 requested.",
    initiatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    ambulanceDispatchedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  }
];

export const initialMPDSRLogs: MPDSRAuditLog[] = [
  {
    id: 1,
    referralId: 1,
    patientId: 1,
    patientName: "Amina Wanjiku Mwangi",
    county: "Nairobi / Kiambu Corridor",
    delay1DurationMinutes: 15,
    delay2DurationMinutes: 18,
    delay3DurationMinutes: 5,
    delay1Factor: "Voice AI weekly call prompted immediate danger symptom detection at 07:15 AM",
    delay2Factor: "Emergency transport dispatched ambulance bypassing traffic directly to Kiambu Level 5",
    delay3Factor: "Kiambu Hospital received pre-arrival EHR with O- blood & ICU bed pre-allocated",
    wasPreventableDelayIdentified: false,
    clinicalOutcome: "SAVED_STABLE",
    executiveAuditSummary: "Systemic referral blindness successfully averted. KNH had 0 ICU beds and 0 units O- blood. Routing to Kiambu County Referral Hospital saved mother and fetus within the Golden Hour window.",
    createdAt: new Date().toISOString(),
  }
];

// Persistent runtime state container for serverless warm execution
class MockDataStore {
  facilities = [...initialFacilities];
  capacities = [...initialCapacities];
  patients = [...initialPatients];
  checkins = [...initialCheckins];
  referrals = [...initialReferrals];
  mpdsrLogs = [...initialMPDSRLogs];

  reset() {
    this.facilities = [...initialFacilities];
    this.capacities = [...initialCapacities];
    this.patients = [...initialPatients];
    this.checkins = [...initialCheckins];
    this.referrals = [...initialReferrals];
    this.mpdsrLogs = [...initialMPDSRLogs];
  }
}

// Global singleton for Next.js dev server
const globalForStore = globalThis as unknown as { seqoyStore?: MockDataStore };
export const mockStore = globalForStore.seqoyStore ?? new MockDataStore();
if (process.env.NODE_ENV !== "production") globalForStore.seqoyStore = mockStore;

export const mockFacilities = mockStore.facilities;
export const mockCapacities = mockStore.capacities;
export const mockPatients = mockStore.patients;
export const mockCheckins = mockStore.checkins;
export const mockEmergencyReferrals = mockStore.referrals;
export const mockMpdsrAuditLogs = mockStore.mpdsrLogs;
