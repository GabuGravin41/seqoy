// In-memory data store for zero-friction local development and API testing.
// The repository layer (src/db/repository/*) falls back to this when
// DATABASE_URL isn't set; every real request path goes through Postgres.

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

  // Delay 1 check-in schedule (all have sane defaults, all editable per mother)
  checkinFrequencyDays: number; // default 14 (every 2 weeks)
  preferredCheckinDayOfWeek: number; // 0=Sun ... 6=Sat, default 6
  preferredCheckinHour: number; // 24h, default 14 (2PM)
  contactChannel: "WHATSAPP" | "SMS"; // weekly message channel
  whatsappNumber?: string;
  nextCallAt?: string;
  nextWeeklyMessageAt?: string;

  // ODPC Data Protection Act (2019) consent tracking
  consentStatus?: "GRANTED" | "PENDING" | "REVOKED";
  consentRecordedAt?: string;
  consentChannel?: "VERBAL_CLINIC" | "WRITTEN_ANC" | "USSD_OPT_IN" | "SMS_OPT_IN" | "REVOKED_BY_PATIENT";
  consentVersion?: string;

  createdAt: string;
}

export interface HealthCheckin {
  id: number;
  // null when an inbound check-in's phone number couldn't be matched to an
  // enrolled patient — see reportedPhoneNumber/requiresPatientMatch below.
  patientId: number | null;
  reportedPhoneNumber?: string;
  requiresPatientMatch?: boolean;
  channel: "VOICE_AI" | "USSD" | "SMS" | "WHATSAPP" | "IN_PERSON" | "MANUAL_CALL";
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

  // CRITICAL KENYAN REALITY: Uncrossmatched units strictly locked for acute PPH/APH hemorrhage
  unreservedEmergencyONeg: number;

  obstetricianOnDuty: boolean;
  anesthesiologistOnDuty: boolean;
  neonatologistOnDuty: boolean;
  isApexReferralCenter: boolean; // Level 6 apex facilities (KNH, MTRH)
  hemodialysisAvailable: boolean; // for severe HELLP syndrome with acute kidney injury
  bloodIrradiationAvailable: boolean;
  neonatalVentilatorsAvailable: number;
  dutyStationWhatsappPhone?: string;

  // How these numbers get updated: an automated EHR/HIMS webhook push, or a
  // staff member using the manual update screen. Shown honestly instead of a
  // blanket "connected" claim.
  syncMode: "EHR_WEBHOOK" | "MANUAL";
  lastWebhookSyncAt?: string;

  lastUpdated: string;
}

export interface FacilityReferral {
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

  // Acuity Override Protocol (for catastrophic tertiary emergencies at Level 6 Apex)
  acuityTier?: "ROUTINE" | "EMERGENCY" | "TERTIARY_MANDATORY";
  isAcuityOverride?: boolean;
  acuityOverrideReason?: string;

  icuBedReserved: boolean;
  theatreReserved: boolean;
  bloodUnitsReserved: number;
  bloodTypeReserved?: string;
  unreservedBloodReserved?: number;

  // Zero-login WhatsApp Dispatch Telemetry
  whatsappDispatchStatus?: "NOT_DISPATCHED" | "DISPATCHED" | "ACKNOWLEDGED";
  whatsappDispatchedAt?: string;

  status: "REQUESTED" | "ACKNOWLEDGED" | "ACCEPTED" | "ADMITTED" | "COMPLETED" | "DECLINED";
  preArrivalHandoverNote?: string;
  initiatedAt: string;
  acknowledgedAt?: string;
  admittedAt?: string;
  completedAt?: string;
}

export interface MPDSRAuditLog {
  id: number;
  referralId: number;
  patientId: number;
  patientName: string;
  county: string;
  delay1DurationMinutes: number;
  delay3DurationMinutes: number;
  delay1Factor: string;
  delay2Note?: string; // optional manual note only; transport is not a product feature
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
    facilityId: 2, // Pumwani Maternity Hospital
    icuBedsTotal: 8,
    icuBedsAvailable: 3,
    hduBedsTotal: 12,
    hduBedsAvailable: 5,
    maternityBedsAvailable: 24,
    operatingTheatresTotal: 4,
    operatingTheatresAvailable: 2,
    theatreReadinessStatus: "READY",
    bloodStock: { "A+": 6, "A-": 2, "B+": 8, "B-": 1, "AB+": 3, "AB-": 1, "O+": 14, "O-": 4 },
    unreservedEmergencyONeg: 3, // 3 unreserved emergency O- units strictly available for PPH
    obstetricianOnDuty: true,
    anesthesiologistOnDuty: true,
    neonatologistOnDuty: true,
    isApexReferralCenter: false,
    hemodialysisAvailable: false,
    bloodIrradiationAvailable: false,
    neonatalVentilatorsAvailable: 6,
    dutyStationWhatsappPhone: "+254711000202",
    syncMode: "EHR_WEBHOOK",
    lastWebhookSyncAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 2,
    facilityId: 3, // KNH (Level 6 Apex - Overcrowded baseline but sole Tertiary Rescue)
    icuBedsTotal: 30,
    icuBedsAvailable: 0, // 0 ICU Beds available (Simulates Delay 3 problem!)
    hduBedsTotal: 25,
    hduBedsAvailable: 1,
    maternityBedsAvailable: 3,
    operatingTheatresTotal: 8,
    operatingTheatresAvailable: 0,
    theatreReadinessStatus: "SURGERY_IN_PROGRESS",
    bloodStock: { "A+": 2, "A-": 0, "B+": 3, "B-": 0, "AB+": 1, "AB-": 0, "O+": 5, "O-": 0 },
    unreservedEmergencyONeg: 0, // 0 unreserved emergency units in fridge
    obstetricianOnDuty: true,
    anesthesiologistOnDuty: true,
    neonatologistOnDuty: true,
    isApexReferralCenter: true, // Sole Level 6 Apex in Nairobi Corridor
    hemodialysisAvailable: true, // Emergency dialysis for HELLP / anuria
    bloodIrradiationAvailable: true,
    neonatalVentilatorsAvailable: 18,
    dutyStationWhatsappPhone: "+254711000303",
    syncMode: "MANUAL",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 3,
    facilityId: 4, // Kiambu County Referral (Great Secondary/Tertiary Alternative!)
    icuBedsTotal: 6,
    icuBedsAvailable: 4,
    hduBedsTotal: 8,
    hduBedsAvailable: 4,
    maternityBedsAvailable: 18,
    operatingTheatresTotal: 3,
    operatingTheatresAvailable: 2,
    theatreReadinessStatus: "READY",
    bloodStock: { "A+": 8, "A-": 3, "B+": 6, "B-": 2, "AB+": 4, "AB-": 2, "O+": 16, "O-": 5 },
    unreservedEmergencyONeg: 4,
    obstetricianOnDuty: true,
    anesthesiologistOnDuty: true,
    neonatologistOnDuty: true,
    isApexReferralCenter: false,
    hemodialysisAvailable: false,
    bloodIrradiationAvailable: false,
    neonatalVentilatorsAvailable: 4,
    dutyStationWhatsappPhone: "+254711000404",
    syncMode: "EHR_WEBHOOK",
    lastWebhookSyncAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 4,
    facilityId: 5, // Mbagathi County Hospital
    icuBedsTotal: 4,
    icuBedsAvailable: 1,
    hduBedsTotal: 6,
    hduBedsAvailable: 2,
    maternityBedsAvailable: 10,
    operatingTheatresTotal: 2,
    operatingTheatresAvailable: 1,
    theatreReadinessStatus: "READY",
    bloodStock: { "A+": 4, "A-": 1, "B+": 5, "B-": 1, "AB+": 2, "AB-": 0, "O+": 9, "O-": 2 },
    unreservedEmergencyONeg: 1,
    obstetricianOnDuty: true,
    anesthesiologistOnDuty: true,
    neonatologistOnDuty: false,
    isApexReferralCenter: false,
    hemodialysisAvailable: false,
    bloodIrradiationAvailable: false,
    neonatalVentilatorsAvailable: 2,
    dutyStationWhatsappPhone: "+254711000505",
    syncMode: "MANUAL",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 5,
    facilityId: 6, // Mama Lucy Kibaki Hospital
    icuBedsTotal: 6,
    icuBedsAvailable: 2,
    hduBedsTotal: 8,
    hduBedsAvailable: 3,
    maternityBedsAvailable: 14,
    operatingTheatresTotal: 3,
    operatingTheatresAvailable: 1,
    theatreReadinessStatus: "READY",
    bloodStock: { "A+": 5, "A-": 2, "B+": 7, "B-": 2, "AB+": 3, "AB-": 1, "O+": 11, "O-": 3 },
    unreservedEmergencyONeg: 2,
    obstetricianOnDuty: true,
    anesthesiologistOnDuty: true,
    neonatologistOnDuty: true,
    isApexReferralCenter: false,
    hemodialysisAvailable: false,
    bloodIrradiationAvailable: false,
    neonatalVentilatorsAvailable: 4,
    dutyStationWhatsappPhone: "+254711000606",
    syncMode: "MANUAL",
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
    checkinFrequencyDays: 14,
    preferredCheckinDayOfWeek: 6,
    preferredCheckinHour: 14,
    contactChannel: "WHATSAPP",
    whatsappNumber: "+254712345678",
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
    checkinFrequencyDays: 14,
    preferredCheckinDayOfWeek: 6,
    preferredCheckinHour: 14,
    contactChannel: "SMS",
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
    checkinFrequencyDays: 7,
    preferredCheckinDayOfWeek: 3,
    preferredCheckinHour: 10,
    contactChannel: "WHATSAPP",
    whatsappNumber: "+254733445566",
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

export const initialReferrals: FacilityReferral[] = [
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
    status: "ACCEPTED",
    preArrivalHandoverNote: "Patient 34wks with BP 165/110, severe headache, blurred vision. Loading dose Magnesium Sulphate 4g IV given at 20:10. O- blood reserved. ICU Bed #2 requested.",
    initiatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
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
    delay3DurationMinutes: 5,
    delay1Factor: "Biweekly Voice AI call prompted immediate danger symptom detection at 07:15 AM",
    delay3Factor: "Kiambu Hospital's live capacity feed showed an open ICU bed & O- blood before referral was placed",
    wasPreventableDelayIdentified: false,
    clinicalOutcome: "SAVED_STABLE",
    executiveAuditSummary: "Referral blindness averted: KNH showed 0 ICU beds and 0 units O- blood on the live capacity board, so the clinic referred directly to Kiambu County Referral Hospital instead.",
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
export const mockFacilityReferrals = mockStore.referrals;
export const mockMpdsrAuditLogs = mockStore.mpdsrLogs;
