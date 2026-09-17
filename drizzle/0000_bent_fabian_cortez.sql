CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_user_id" varchar(191),
	"actor_role" varchar(30),
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" varchar(50),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"tier" varchar(50) NOT NULL,
	"county" varchar(100) NOT NULL,
	"sub_county" varchar(100) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"emergency_phone" varchar(50) NOT NULL,
	"is_referral_center" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facility_referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referral_code" varchar(50) NOT NULL,
	"patient_id" integer NOT NULL,
	"referring_facility_id" integer NOT NULL,
	"receiving_facility_id" integer NOT NULL,
	"clinical_indication" varchar(100) NOT NULL,
	"urgency_level" varchar(20) DEFAULT 'EMERGENCY' NOT NULL,
	"icu_bed_reserved" boolean DEFAULT false NOT NULL,
	"theatre_reserved" boolean DEFAULT false NOT NULL,
	"blood_units_reserved" integer DEFAULT 0 NOT NULL,
	"blood_type_reserved" varchar(10),
	"status" varchar(40) DEFAULT 'REQUESTED' NOT NULL,
	"pre_arrival_handover_note" text,
	"initiated_at" timestamp DEFAULT now() NOT NULL,
	"acknowledged_at" timestamp,
	"admitted_at" timestamp,
	"completed_at" timestamp,
	CONSTRAINT "facility_referrals_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "health_checkins" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer,
	"reported_phone_number" varchar(50),
	"requires_patient_match" boolean DEFAULT false NOT NULL,
	"channel" varchar(30) NOT NULL,
	"language_used" varchar(20) DEFAULT 'SWAHILI' NOT NULL,
	"has_severe_headache" boolean DEFAULT false,
	"has_blurred_vision" boolean DEFAULT false,
	"has_severe_swelling" boolean DEFAULT false,
	"has_vaginal_bleeding" boolean DEFAULT false,
	"has_high_fever" boolean DEFAULT false,
	"has_reduced_fetal_movement" boolean DEFAULT false,
	"has_severe_abdominal_pain" boolean DEFAULT false,
	"systolic_bp" integer,
	"diastolic_bp" integer,
	"transcript" text,
	"ai_clinical_summary" text,
	"risk_score" integer NOT NULL,
	"risk_level" varchar(30) NOT NULL,
	"suspected_condition" varchar(100),
	"flagged_for_immediate_referral" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hospital_capacities" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"icu_beds_total" integer DEFAULT 0 NOT NULL,
	"icu_beds_available" integer DEFAULT 0 NOT NULL,
	"hdu_beds_total" integer DEFAULT 0 NOT NULL,
	"hdu_beds_available" integer DEFAULT 0 NOT NULL,
	"maternity_beds_available" integer DEFAULT 0 NOT NULL,
	"operating_theatres_total" integer DEFAULT 1 NOT NULL,
	"operating_theatres_available" integer DEFAULT 1 NOT NULL,
	"theatre_readiness_status" varchar(50) DEFAULT 'READY' NOT NULL,
	"blood_stock_a_pos" integer DEFAULT 0 NOT NULL,
	"blood_stock_a_neg" integer DEFAULT 0 NOT NULL,
	"blood_stock_b_pos" integer DEFAULT 0 NOT NULL,
	"blood_stock_b_neg" integer DEFAULT 0 NOT NULL,
	"blood_stock_ab_pos" integer DEFAULT 0 NOT NULL,
	"blood_stock_ab_neg" integer DEFAULT 0 NOT NULL,
	"blood_stock_o_pos" integer DEFAULT 0 NOT NULL,
	"blood_stock_o_neg" integer DEFAULT 0 NOT NULL,
	"obstetrician_on_duty" boolean DEFAULT true NOT NULL,
	"anesthesiologist_on_duty" boolean DEFAULT true NOT NULL,
	"neonatologist_on_duty" boolean DEFAULT false NOT NULL,
	"sync_mode" varchar(20) DEFAULT 'MANUAL' NOT NULL,
	"last_webhook_sync_at" timestamp,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hospital_capacities_facility_id_unique" UNIQUE("facility_id")
);
--> statement-breakpoint
CREATE TABLE "mpdsr_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"referral_id" integer,
	"patient_id" integer NOT NULL,
	"county" varchar(100) NOT NULL,
	"delay1_duration_minutes" integer,
	"delay3_duration_minutes" integer,
	"delay1_factor" varchar(255),
	"delay2_note" varchar(255),
	"delay3_factor" varchar(255),
	"was_preventable_delay_identified" boolean DEFAULT false NOT NULL,
	"clinical_outcome" varchar(50) DEFAULT 'SAVED_STABLE' NOT NULL,
	"executive_audit_summary" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"national_id" varchar(50),
	"full_name" varchar(255) NOT NULL,
	"phone_number" varchar(50) NOT NULL,
	"age" integer NOT NULL,
	"gravida" integer DEFAULT 1 NOT NULL,
	"parity" integer DEFAULT 0 NOT NULL,
	"gestational_weeks" integer NOT NULL,
	"estimated_delivery_date" varchar(50),
	"blood_type" varchar(10) NOT NULL,
	"preferred_language" varchar(20) DEFAULT 'SWAHILI' NOT NULL,
	"primary_facility_id" integer,
	"current_risk_level" varchar(30) DEFAULT 'NORMAL' NOT NULL,
	"last_checkin_at" timestamp,
	"checkin_frequency_days" integer DEFAULT 14 NOT NULL,
	"preferred_checkin_day_of_week" integer DEFAULT 6 NOT NULL,
	"preferred_checkin_hour" integer DEFAULT 14 NOT NULL,
	"contact_channel" varchar(20) DEFAULT 'SMS' NOT NULL,
	"whatsapp_number" varchar(50),
	"next_call_at" timestamp,
	"next_weekly_message_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"role" varchar(30) DEFAULT 'CLINIC_NURSE' NOT NULL,
	"facility_id" integer,
	"facility_name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "facility_referrals" ADD CONSTRAINT "facility_referrals_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_referrals" ADD CONSTRAINT "facility_referrals_referring_facility_id_facilities_id_fk" FOREIGN KEY ("referring_facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_referrals" ADD CONSTRAINT "facility_referrals_receiving_facility_id_facilities_id_fk" FOREIGN KEY ("receiving_facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_checkins" ADD CONSTRAINT "health_checkins_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_capacities" ADD CONSTRAINT "hospital_capacities_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpdsr_audit_logs" ADD CONSTRAINT "mpdsr_audit_logs_referral_id_facility_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."facility_referrals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mpdsr_audit_logs" ADD CONSTRAINT "mpdsr_audit_logs_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_primary_facility_id_facilities_id_fk" FOREIGN KEY ("primary_facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;