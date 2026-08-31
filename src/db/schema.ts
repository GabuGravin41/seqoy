import { pgTable, text, serial, integer, timestamp, boolean, jsonb, doublePrecision, varchar } from "drizzle-orm/pg-core";

// Health Facilities (Clinics and Referral Hospitals)
export const facilities = pgTable("facilities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  tier: varchar("tier", { length: 50 }).notNull(), // LEVEL_3_CLINIC, LEVEL_4_SUBCOUNTY, LEVEL_5_COUNTY, LEVEL_6_NATIONAL
  county: varchar("county", { length: 100 }).notNull(),
  subCounty: varchar("sub_county", { length: 100 }).notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  emergencyPhone: varchar("emergency_phone", { length: 50 }).notNull(),
  isReferralCenter: boolean("is_referral_center").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expectant Mothers / Patients
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  nationalId: varchar("national_id", { length: 50 }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  age: integer("age").notNull(),
  gravida: integer("gravida").default(1).notNull(), // number of pregnancies
  parity: integer("parity").default(0).notNull(),  // number of births
  gestationalWeeks: integer("gestational_weeks").notNull(),
  estimatedDeliveryDate: varchar("estimated_delivery_date", { length: 50 }),
  bloodType: varchar("blood_type", { length: 10 }).notNull(), // A+, A-, B+, B-, AB+, AB-, O+, O-
  preferredLanguage: varchar("preferred_language", { length: 20 }).default("SWAHILI").notNull(), // SWAHILI, ENGLISH, KIKUYU, LUO
  primaryFacilityId: integer("primary_facility_id").references(() => facilities.id),
  currentRiskLevel: varchar("current_risk_level", { length: 30 }).default("NORMAL").notNull(), // NORMAL, ELEVATED_RISK, CRITICAL_EMERGENCY
  lastCheckinAt: timestamp("last_checkin_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Remote Health Check-in Logs (Voice AI, USSD, SMS)
export const healthCheckins = pgTable("health_checkins", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  channel: varchar("channel", { length: 30 }).notNull(), // VOICE_AI, USSD, SMS, IN_PERSON
  languageUsed: varchar("language_used", { length: 20 }).default("SWAHILI").notNull(),
  
  // Reported Symptoms
  hasSevereHeadache: boolean("has_severe_headache").default(false),
  hasBlurredVision: boolean("has_blurred_vision").default(false),
  hasSevereSwelling: boolean("has_severe_swelling").default(false),
  hasVaginalBleeding: boolean("has_vaginal_bleeding").default(false),
  hasHighFever: boolean("has_high_fever").default(false),
  hasReducedFetalMovement: boolean("has_reduced_fetal_movement").default(false),
  hasSevereAbdominalPain: boolean("has_severe_abdominal_pain").default(false),
  
  // Vitals (if recorded)
  systolicBp: integer("systolic_bp"),
  diastolicBp: integer("diastolic_bp"),
  
  // Voice AI specifics
  transcript: text("transcript"),
  aiClinicalSummary: text("ai_clinical_summary"),
  
  // Computed Risk
  riskScore: integer("risk_score").notNull(), // 0 - 100
  riskLevel: varchar("risk_level", { length: 30 }).notNull(), // NORMAL, ELEVATED_RISK, CRITICAL_EMERGENCY
  suspectedCondition: varchar("suspected_condition", { length: 100 }), // PREECLAMPSIA, PPH, SEPSIS, NONE
  
  flaggedForImmediateReferral: boolean("flagged_for_immediate_referral").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Real-Time Hospital Capacity State
export const hospitalCapacities = pgTable("hospital_capacities", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id").references(() => facilities.id).notNull().unique(),
  
  // Beds
  icuBedsTotal: integer("icu_beds_total").default(0).notNull(),
  icuBedsAvailable: integer("icu_beds_available").default(0).notNull(),
  hduBedsTotal: integer("hdu_beds_total").default(0).notNull(),
  hduBedsAvailable: integer("hdu_beds_available").default(0).notNull(),
  maternityBedsAvailable: integer("maternity_beds_available").default(0).notNull(),
  
  // Operating Theatres
  operatingTheatresTotal: integer("operating_theatres_total").default(1).notNull(),
  operatingTheatresAvailable: integer("operating_theatres_available").default(1).notNull(),
  theatreReadinessStatus: varchar("theatre_readiness_status", { length: 50 }).default("READY").notNull(), // READY, SURGERY_IN_PROGRESS, STERILIZING, SHORT_STAFFED
  
  // Blood Bank Inventory (units available)
  bloodStockA_Pos: integer("blood_stock_a_pos").default(0).notNull(),
  bloodStockA_Neg: integer("blood_stock_a_neg").default(0).notNull(),
  bloodStockB_Pos: integer("blood_stock_b_pos").default(0).notNull(),
  bloodStockB_Neg: integer("blood_stock_b_neg").default(0).notNull(),
  bloodStockAb_Pos: integer("blood_stock_ab_pos").default(0).notNull(),
  bloodStockAb_Neg: integer("blood_stock_ab_neg").default(0).notNull(),
  bloodStockO_Pos: integer("blood_stock_o_pos").default(0).notNull(),
  bloodStockO_Neg: integer("blood_stock_o_neg").default(0).notNull(),
  
  // Emergency Specialist Staffing
  obstetricianOnDuty: boolean("obstetrician_on_duty").default(true).notNull(),
  anesthesiologistOnDuty: boolean("anesthesiologist_on_duty").default(true).notNull(),
  neonatologistOnDuty: boolean("neonatologist_on_duty").default(false).notNull(),
  
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Emergency Referrals & Transport Dispatches
export const emergencyReferrals = pgTable("emergency_referrals", {
  id: serial("id").primaryKey(),
  referralCode: varchar("referral_code", { length: 50 }).notNull().unique(), // e.g. SEQ-REF-2026-001
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  referringFacilityId: integer("referring_facility_id").references(() => facilities.id).notNull(),
  receivingFacilityId: integer("receiving_facility_id").references(() => facilities.id).notNull(),
  
  clinicalIndication: varchar("clinical_indication", { length: 100 }).notNull(), // SEVERE_PREECLAMPSIA, PPH, ECLAMPSIA, OBSTRUCTED_LABOR
  urgencyLevel: varchar("urgency_level", { length: 20 }).default("EMERGENCY").notNull(), // URGENT, EMERGENCY, CRITICAL_STAT
  
  // Resource Reservations
  icuBedReserved: boolean("icu_bed_reserved").default(false).notNull(),
  theatreReserved: boolean("theatre_reserved").default(false).notNull(),
  bloodUnitsReserved: integer("blood_units_reserved").default(0).notNull(),
  bloodTypeReserved: varchar("blood_type_reserved", { length: 10 }),
  
  // Emergency Transport Dispatch Integration
  transportDispatchId: varchar("transport_dispatch_id", { length: 100 }),
  ambulanceCallSign: varchar("ambulance_call_sign", { length: 50 }),
  estimatedTransitMinutes: integer("estimated_transit_minutes"),
  transportTrackingUrl: text("transport_tracking_url"),
  
  // Lifecycle Status
  status: varchar("status", { length: 40 }).default("REQUESTED").notNull(), 
  // REQUESTED, MATCHED, AMBULANCE_DISPATCHED, IN_TRANSIT, ARRIVED_AT_RECEIVING, ADMITTED, COMPLETED, CANCELLED
  
  preArrivalHandoverNote: text("pre_arrival_handover_note"),
  
  // Timestamps for 3 Delays tracking
  initiatedAt: timestamp("initiated_at").defaultNow().notNull(),
  ambulanceDispatchedAt: timestamp("ambulance_dispatched_at"),
  ambulanceArrivedFacilityAt: timestamp("ambulance_arrived_facility_at"),
  patientAdmittedAt: timestamp("patient_admitted_at"),
  completedAt: timestamp("completed_at"),
});

// DANA MPDSR (Maternal & Perinatal Death Surveillance & Response) Audit Logs
export const mpdsrAuditLogs = pgTable("mpdsr_audit_logs", {
  id: serial("id").primaryKey(),
  referralId: integer("referral_id").references(() => emergencyReferrals.id),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  county: varchar("county", { length: 100 }).notNull(),
  
  // The Three Delays Quantification (in minutes)
  delay1DurationMinutes: integer("delay1_duration_minutes"), // Delay 1: Decision to seek care
  delay2DurationMinutes: integer("delay2_duration_minutes"), // Delay 2: Reaching suitable health facility
  delay3DurationMinutes: integer("delay3_duration_minutes"), // Delay 3: Receiving adequate care upon arrival
  
  // Delay Attributes & Root Causes
  delay1Factor: varchar("delay1_factor", { length: 255 }), // e.g. "Late recognition of eclamptic visual aura"
  delay2Factor: varchar("delay2_factor", { length: 255 }), // e.g. "Traffic gridlock bypassed via Transitica dispatch"
  delay3Factor: varchar("delay3_factor", { length: 255 }), // e.g. "Immediate ICU bed admission without waiting"
  
  wasPreventableDelayIdentified: boolean("was_preventable_delay_identified").default(false).notNull(),
  clinicalOutcome: varchar("clinical_outcome", { length: 50 }).default("SAVED_STABLE").notNull(), // SAVED_STABLE, COMPLICATION_RESOLVED, MATERNAL_NEAR_MISS, PERINATAL_SURVIVED
  
  executiveAuditSummary: text("executive_audit_summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
