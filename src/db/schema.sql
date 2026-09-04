-- SEQOY Maternal Health & Hospital Capacity Network
-- PostgreSQL / Neon DB Production Schema Definition

-- 1. Healthcare Facilities (Dispensaries, Health Centres, Level 5/6 Referral Hospitals)
CREATE TABLE IF NOT EXISTS facilities (
    id SERIAL PRIMARY KEY,
    mfl_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL CHECK (tier IN ('LEVEL_2_DISPENSARY', 'LEVEL_3_CLINIC', 'LEVEL_4_SUBCOUNTY', 'LEVEL_5_COUNTY', 'LEVEL_6_NATIONAL')),
    county VARCHAR(100) NOT NULL,
    sub_county VARCHAR(100) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    emergency_phone VARCHAR(50) NOT NULL,
    is_referral_center BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Authenticated Clinicians & Staff Accounts
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    council_registration_number VARCHAR(100),
    role VARCHAR(50) NOT NULL CHECK (role IN ('PRIMARY_MIDWIFE', 'HOSPITAL_BED_MANAGER', 'EMS_PARAMEDIC', 'MPDSR_AUDITOR', 'SYSTEM_ADMIN')),
    facility_id INTEGER REFERENCES facilities(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Expectant Mothers (Enrolled at ANC 1 or Community)
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    national_id VARCHAR(50),
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    alternative_phone VARCHAR(50),
    age INTEGER NOT NULL,
    gravida INTEGER DEFAULT 1,
    parity INTEGER DEFAULT 0,
    gestational_weeks INTEGER NOT NULL,
    estimated_delivery_date DATE NOT NULL,
    blood_type VARCHAR(10) NOT NULL,
    preferred_language VARCHAR(50) DEFAULT 'SWAHILI' CHECK (preferred_language IN ('SWAHILI', 'ENGLISH', 'KIKUYU', 'LUO')),
    primary_facility_id INTEGER REFERENCES facilities(id),
    current_risk_level VARCHAR(50) DEFAULT 'NORMAL' CHECK (current_risk_level IN ('NORMAL', 'ELEVATED_RISK', 'CRITICAL_EMERGENCY')),
    last_checkin_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Health Check-in Logs (Voice AI, USSD *384#, WhatsApp, In-Person)
CREATE TABLE IF NOT EXISTS health_checkins (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('VOICE_AI', 'USSD', 'WHATSAPP', 'IN_PERSON')),
    language_used VARCHAR(50) DEFAULT 'SWAHILI',
    
    -- Obstetric Danger Triad Booleans
    has_severe_headache BOOLEAN DEFAULT FALSE,
    has_blurred_vision BOOLEAN DEFAULT FALSE,
    has_severe_swelling BOOLEAN DEFAULT FALSE,
    has_vaginal_bleeding BOOLEAN DEFAULT FALSE,
    has_high_fever BOOLEAN DEFAULT FALSE,
    has_reduced_fetal_movement BOOLEAN DEFAULT FALSE,
    has_severe_abdominal_pain BOOLEAN DEFAULT FALSE,
    
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    transcript TEXT,
    ai_clinical_summary TEXT,
    risk_score DECIMAL(5, 2) DEFAULT 0.0,
    risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('NORMAL', 'ELEVATED_RISK', 'CRITICAL_EMERGENCY')),
    suspected_condition VARCHAR(100),
    flagged_for_immediate_referral BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Hospital Live Capacity & Resource Tracking (Per Shift)
CREATE TABLE IF NOT EXISTS hospital_capacities (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES facilities(id) ON DELETE CASCADE,
    icu_beds_total INTEGER NOT NULL DEFAULT 0,
    icu_beds_available INTEGER NOT NULL DEFAULT 0,
    hdu_beds_total INTEGER NOT NULL DEFAULT 0,
    hdu_beds_available INTEGER NOT NULL DEFAULT 0,
    maternity_beds_available INTEGER NOT NULL DEFAULT 0,
    operating_theatres_total INTEGER NOT NULL DEFAULT 0,
    operating_theatres_available INTEGER NOT NULL DEFAULT 0,
    theatre_readiness_status VARCHAR(50) DEFAULT 'READY' CHECK (theatre_readiness_status IN ('READY', 'SURGERY_IN_PROGRESS', 'STERILIZING', 'OFFLINE')),
    
    -- Blood Units Stock
    blood_stock_o_neg INTEGER DEFAULT 0,
    blood_stock_o_pos INTEGER DEFAULT 0,
    blood_stock_a_pos INTEGER DEFAULT 0,
    blood_stock_b_pos INTEGER DEFAULT 0,
    blood_stock_ab_pos INTEGER DEFAULT 0,
    
    obstetrician_on_duty BOOLEAN DEFAULT TRUE,
    anesthesiologist_on_duty BOOLEAN DEFAULT TRUE,
    last_updated_by INTEGER REFERENCES users(id),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Emergency Referrals & In-Transit Radar
CREATE TABLE IF NOT EXISTS emergency_referrals (
    id SERIAL PRIMARY KEY,
    referral_code VARCHAR(100) UNIQUE NOT NULL,
    patient_id INTEGER REFERENCES patients(id),
    referring_facility_id INTEGER REFERENCES facilities(id),
    receiving_facility_id INTEGER REFERENCES facilities(id),
    clinical_indication VARCHAR(255) NOT NULL,
    urgency_level VARCHAR(50) NOT NULL CHECK (urgency_level IN ('URGENT', 'EMERGENCY', 'CRITICAL_STAT')),
    
    icu_bed_reserved BOOLEAN DEFAULT FALSE,
    theatre_reserved BOOLEAN DEFAULT FALSE,
    blood_units_reserved INTEGER DEFAULT 0,
    blood_type_reserved VARCHAR(10),
    
    transport_dispatch_id VARCHAR(100),
    ambulance_call_sign VARCHAR(100),
    estimated_transit_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'MATCHED', 'AMBULANCE_DISPATCHED', 'IN_TRANSIT', 'ARRIVED_AT_RECEIVING', 'ADMITTED', 'COMPLETED')),
    pre_arrival_handover_note TEXT,
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ambulance_dispatched_at TIMESTAMP WITH TIME ZONE,
    patient_admitted_at TIMESTAMP WITH TIME ZONE
);

-- 7. MPDSR 3-Delays Audit Logs
CREATE TABLE IF NOT EXISTS mpdsr_audit_logs (
    id SERIAL PRIMARY KEY,
    referral_id INTEGER REFERENCES emergency_referrals(id),
    patient_id INTEGER REFERENCES patients(id),
    patient_name VARCHAR(255) NOT NULL,
    county VARCHAR(100) NOT NULL,
    delay_1_duration_minutes INTEGER DEFAULT 0,
    delay_2_duration_minutes INTEGER DEFAULT 0,
    delay_3_duration_minutes INTEGER DEFAULT 0,
    delay_1_factor TEXT,
    delay_2_factor TEXT,
    delay_3_factor TEXT,
    was_preventable_delay_identified BOOLEAN DEFAULT FALSE,
    clinical_outcome VARCHAR(100) NOT NULL,
    executive_audit_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
