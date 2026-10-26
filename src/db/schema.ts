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

  // Delay 1: configurable check-in schedule. Every mother gets a default
  // biweekly Saturday 2PM voice call and a weekly WhatsApp/SMS message; both
  // are individually adjustable per mother so onboarding doesn't require
  // touching a schedule to get a sane default.
  checkinFrequencyDays: integer("checkin_frequency_days").default(14).notNull(),
  preferredCheckinDayOfWeek: integer("preferred_checkin_day_of_week").default(6).notNull(), // 0=Sun ... 6=Sat
  preferredCheckinHour: integer("preferred_checkin_hour").default(14).notNull(), // 24h, facility-local time
  contactChannel: varchar("contact_channel", { length: 20 }).default("SMS").notNull(), // WHATSAPP or SMS
  whatsappNumber: varchar("whatsapp_number", { length: 50 }),
  nextCallAt: timestamp("next_call_at"),
  nextWeeklyMessageAt: timestamp("next_weekly_message_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Remote Health Check-in Logs (Voice AI, USSD, SMS, WhatsApp)
export const healthCheckins = pgTable("health_checkins", {
  id: serial("id").primaryKey(),
  // Nullable: an inbound USSD/voice/SMS/WhatsApp check-in whose phone number
  // doesn't match any enrolled patient is still recorded (never silently
  // attributed to the wrong mother) with requiresPatientMatch=true for a
  // clinician to reconcile manually.
  patientId: integer("patient_id").references(() => patients.id),
  reportedPhoneNumber: varchar("reported_phone_number", { length: 50 }),
  requiresPatientMatch: boolean("requires_patient_match").default(false).notNull(),
  channel: varchar("channel", { length: 30 }).notNull(), // VOICE_AI, USSD, SMS, WHATSAPP, IN_PERSON
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

  // Voice AI / WhatsApp specifics
  transcript: text("transcript"),
  aiClinicalSummary: text("ai_clinical_summary"),

  // Computed Risk
  riskScore: integer("risk_score").notNull(), // 0 - 100
  riskLevel: varchar("risk_level", { length: 30 }).notNull(), // NORMAL, ELEVATED_RISK, CRITICAL_EMERGENCY
  suspectedCondition: varchar("suspected_condition", { length: 100 }), // PREECLAMPSIA, PPH, SEPSIS, NONE

  flaggedForImmediateReferral: boolean("flagged_for_immediate_referral").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Real-Time Hospital Capacity State (Delay 3: facility readiness visibility)
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

  // CRITICAL KENYAN REALITY: Uncrossmatched units strictly locked for acute PPH/APH hemorrhage
  unreservedEmergencyONeg: integer("unreserved_emergency_o_neg").default(0).notNull(),

  // Emergency Specialist Staffing & Tertiary Capabilities
  obstetricianOnDuty: boolean("obstetrician_on_duty").default(true).notNull(),
  anesthesiologistOnDuty: boolean("anesthesiologist_on_duty").default(true).notNull(),
  neonatologistOnDuty: boolean("neonatologist_on_duty").default(false).notNull(),
  isApexReferralCenter: boolean("is_apex_referral_center").default(false).notNull(), // true for Level 6 apex facilities (KNH, MTRH)
  hemodialysisAvailable: boolean("hemodialysis_available").default(false).notNull(), // for HELLP renal shutdown
  bloodIrradiationAvailable: boolean("blood_irradiation_available").default(false).notNull(),
  neonatalVentilatorsAvailable: integer("neonatal_ventilators_available").default(0).notNull(),

  // Zero-login duty station communication
  dutyStationWhatsappPhone: varchar("duty_station_whatsapp_phone", { length: 30 }),

  // How this facility's numbers get updated: an automated EHR/HIMS webhook
  // push, or a staff member typing it into the manual update screen. Shown
  // honestly to referring clinics instead of a blanket "connected" claim.
  syncMode: varchar("sync_mode", { length: 20 }).default("MANUAL").notNull(), // EHR_WEBHOOK or MANUAL
  lastWebhookSyncAt: timestamp("last_webhook_sync_at"),

  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Facility Referrals (Delay 3: sending a mother to a facility with verified
// capacity). No transport/ambulance tracking — that's explicitly out of scope.
export const facilityReferrals = pgTable("facility_referrals", {
  id: serial("id").primaryKey(),
  referralCode: varchar("referral_code", { length: 50 }).notNull().unique(), // e.g. SEQ-REF-2026-001
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  referringFacilityId: integer("referring_facility_id").references(() => facilities.id).notNull(),
  receivingFacilityId: integer("receiving_facility_id").references(() => facilities.id).notNull(),

  clinicalIndication: varchar("clinical_indication", { length: 100 }).notNull(), // SEVERE_PREECLAMPSIA, PPH, ECLAMPSIA, OBSTRUCTED_LABOR
  urgencyLevel: varchar("urgency_level", { length: 20 }).default("EMERGENCY").notNull(), // URGENT, EMERGENCY, CRITICAL_STAT

  // Acuity Override Protocol (for catastrophic tertiary emergencies at Level 6 Apex)
  acuityTier: varchar("acuity_tier", { length: 30 }).default("ROUTINE").notNull(), // ROUTINE, EMERGENCY, TERTIARY_MANDATORY
  isAcuityOverride: boolean("is_acuity_override").default(false).notNull(),
  acuityOverrideReason: text("acuity_override_reason"),

  // Resource Reservations (checked against the receiving facility's live capacity)
  icuBedReserved: boolean("icu_bed_reserved").default(false).notNull(),
  theatreReserved: boolean("theatre_reserved").default(false).notNull(),
  bloodUnitsReserved: integer("blood_units_reserved").default(0).notNull(),
  bloodTypeReserved: varchar("blood_type_reserved", { length: 10 }),
  unreservedBloodReserved: integer("unreserved_blood_reserved").default(0).notNull(),

  // Zero-login WhatsApp Dispatch Telemetry
  whatsappDispatchStatus: varchar("whatsapp_dispatch_status", { length: 30 }).default("NOT_DISPATCHED").notNull(), // NOT_DISPATCHED, DISPATCHED, ACKNOWLEDGED
  whatsappDispatchedAt: timestamp("whatsapp_dispatched_at"),

  // Lifecycle Status
  status: varchar("status", { length: 40 }).default("REQUESTED").notNull(),
  // REQUESTED, ACKNOWLEDGED, ACCEPTED, ADMITTED, COMPLETED, DECLINED

  preArrivalHandoverNote: text("pre_arrival_handover_note"),

  initiatedAt: timestamp("initiated_at").defaultNow().notNull(),
  acknowledgedAt: timestamp("acknowledged_at"),
  admittedAt: timestamp("admitted_at"),
  completedAt: timestamp("completed_at"),
});

// MPDSR (Maternal & Perinatal Death Surveillance & Response) Audit Logs.
// Delay 1 and Delay 3 durations are populated from real check-in/referral
// timestamps; Delay 2 (transport) is out of product scope and kept only as
// an optional free-text note a nurse can add manually for MoH reporting
// completeness, never computed or fabricated.
export const mpdsrAuditLogs = pgTable("mpdsr_audit_logs", {
  id: serial("id").primaryKey(),
  referralId: integer("referral_id").references(() => facilityReferrals.id),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  county: varchar("county", { length: 100 }).notNull(),

  delay1DurationMinutes: integer("delay1_duration_minutes"), // Delay 1: decision to seek care
  delay3DurationMinutes: integer("delay3_duration_minutes"), // Delay 3: receiving adequate care upon arrival

  delay1Factor: varchar("delay1_factor", { length: 255 }),
  delay2Note: varchar("delay2_note", { length: 255 }), // optional manual note only; not a product feature
  delay3Factor: varchar("delay3_factor", { length: 255 }),

  wasPreventableDelayIdentified: boolean("was_preventable_delay_identified").default(false).notNull(),
  clinicalOutcome: varchar("clinical_outcome", { length: 50 }).default("SAVED_STABLE").notNull(), // SAVED_STABLE, COMPLICATION_RESOLVED, MATERNAL_NEAR_MISS, PERINATAL_SURVIVED

  executiveAuditSummary: text("executive_audit_summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Application-level identity: Clerk owns authentication (password, sessions, MFA);
// this table maps a Clerk user id to the SEQOY-specific role/facility used for RBAC.
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id", { length: 191 }).primaryKey(), // Clerk user id (e.g. "user_...")
  email: varchar("email", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: varchar("role", { length: 30 }).default("CLINIC_NURSE").notNull(),
  // CLINIC_NURSE, BED_MANAGER, BLOOD_BANK_OFFICER, COUNTY_DIRECTOR, COMMUNITY_PROMOTER, SYSTEM_ADMIN
  facilityId: integer("facility_id").references(() => facilities.id),
  facilityName: varchar("facility_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Access/audit trail for patient data and privileged clinical operations.
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actorUserId: varchar("actor_user_id", { length: 191 }),
  actorRole: varchar("actor_role", { length: 30 }),
  action: varchar("action", { length: 100 }).notNull(), // e.g. PATIENT_VIEW, REFERRAL_CREATE
  entityType: varchar("entity_type", { length: 50 }),
  entityId: varchar("entity_id", { length: 50 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
