# SEQOY: Architecture, Interoperability & Kenya Compliance Guide 🇰🇪

This document specifies SEQOY's regulatory compliance posture under Kenya's **Data Protection Act (2019)** and **Digital Health Act (2023)**, its data-residency architecture, and how it complements Kenya's existing national digital health stack (**eCHIS**, **KenyaEMR**, and **PROMPTS**).

---

## 1. Kenya Data Protection Act (2019) / ODPC Compliance

Maternal health records are classified as **Sensitive Personal Data** under Section 2 and Section 46 of the Data Protection Act (2019).

### Implemented Technical Safeguards
1. **Explicit, Auditable Consent (`patients.consent_status`)**:
   - Every patient record tracks `consentStatus` (`GRANTED`, `PENDING`, `REVOKED`), `consentRecordedAt`, `consentChannel` (`VERBAL_CLINIC`, `WRITTEN_ANC`, `USSD_OPT_IN`, `SMS_OPT_IN`, `REVOKED_BY_PATIENT`), and `consentVersion`.
   - The automated check-in scheduler (`/api/cron/checkins`) enforces `hasActiveOutreachConsent()` and skips any mother whose consent is `PENDING` or `REVOKED`.
2. **Data Minimization Over Third-Party Channels (`src/lib/security/privacy.ts`)**:
   - Pre-arrival WhatsApp duty-station alerts (`/api/referrals/dispatch`) transmit **patient initials** (e.g., `W. M.`) + age + gravida/parity + blood type + clinical indication + **MOH 268 Referral Code**, avoiding full names or National IDs over third-party messaging.
   - Prompts sent to external LLM providers (`/api/ai/chat-completion`) are scrubbed with `redactPiiForExternalLlm()` to strip Kenyan phone numbers, National IDs, and email addresses.
3. **Access Control & Immutable Audit Trail**:
   - All clinical routes enforce server-side RBAC (`src/lib/rbac/server.ts`), including HL7 FHIR bundle exports (`/api/interoperability/fhir`), which require either an authorized clinician role or a verified `HIMS_WEBHOOK_SECRET` and log every export to `audit_logs` (`FHIR_BUNDLE_EXPORT`).
   - All webhook and cron endpoints (`/api/cron/checkins`, `/api/telephony/twilio/voice`, `/api/telephony/sms/inbound`, `/api/interoperability/webhooks`) use constant-time secret verification or provider signature verification and **fail closed in production**.
4. **No Default EHR Credentials**:
   - `KenyaEMRConnector` (`src/lib/interoperability/kenyaemr_connector.ts`) refuses to fall back to hardcoded demo credentials (`admin`/`Admin123`) and enforces request timeouts so a slow hospital server never stalls emergency care.

### Pre-Pilot Operational Checklist (Required Before Live Patient Data)
- [ ] **ODPC Registration**: Register the operating entity as a Data Processor (and county/hospital partner as Data Controller) with the Office of the Data Protection Commissioner.
- [ ] **Data Residency (Section 48/49)**: Deploy PostgreSQL in a Kenya-local or Africa/EU-adequate region (e.g. Safaricom Cloud, AWS `af-south-1` Cape Town, or Neon EU `eu-central-1` with signed DPA/SCCs). Avoid US-only storage for live Kenyan PHI without documented Section 48 safeguards.
- [ ] **Data Processing Agreements (DPAs)**: Execute DPAs with Clerk (identity), Africa's Talking (local Kenyan SMS/USSD), Twilio (if automated voice/WhatsApp is enabled), and hosting provider.
- [ ] **Breach Response**: Maintain a 72-hour ODPC breach notification SOP backed by `audit_logs`.

---

## 2. Digital Health Act (2023) & Ecosystem Positioning

SEQOY is architected to **complement, not duplicate**, Kenya's national digital health infrastructure:

| National / Existing System | Primary Scope | How SEQOY Complements It |
|---|---|---|
| **eCHIS** (MoH) | Community Health Promoter (CHP) household workflows & ANC visits | SEQOY does not replace eCHIS; CHPs use SEQOY's 30-second triage escalation only when danger signs require hospital referral readiness. |
| **Jacaranda Health PROMPTS** | Mass two-way maternal SMS/WhatsApp education & AI triage (Delay 1) | SEQOY's primary wedge is **Delay 3 (Hospital Readiness & Referral Handover)** — verifying live ICU beds, theatre status, and unreserved O-negative blood before transfer. |
| **KenyaEMR (OpenMRS)** | Facility outpatient/HIV/ANC EMR (rarely tracks live ICU beds or blood fridge stock) | SEQOY syncs referral encounters via REST/FHIR R4 (`KenyaEMRConnector`) while keeping live bed/theatre/blood visibility updated via low-friction shift SMS/webhooks. |
| **Digital Health Agency (DHA) / HIE** | National Health Information Exchange & SHA emergency reimbursement | SEQOY emits HL7 FHIR R4 Bundles (`/api/interoperability/fhir`), tracks KMFL facility codes, and prints physical **MOH 268** slips for zero-downtime fallback. |

---

## 3. Solving the "Stale Capacity" Problem (Delay 3 Architecture)

Hospital capacity dashboards fail when bed counts go stale. SEQOY enforces two architectural safeguards:

1. **Freshness Tracking & Routing Penalties (`src/lib/routing/capacity-matcher.ts`)**:
   - `FRESH` (≤ 12 hours): Full confidence.
   - `AGING` (12–24 hours): Soft warning + `-10` routing score penalty.
   - `STALE` (> 24 hours): Explicit bottleneck warning (*"confirm by phone before transfer"*) + `-30` routing score penalty.
   - Any non-`READY` theatre status (`SURGERY_IN_PROGRESS`, `STERILIZING`, `SHORT_STAFFED` during KMPDU/KUCO strikes) blocks routine surgical routing and shifts referrals to capable county or CHAK/KCCB mission hospitals.

2. **Zero-Login SMS Shift Updates (`src/lib/routing/shift-capacity-parser.ts`)**:
   - Registered hospital duty-station phones can update live capacity in 5 seconds via SMS to `/api/telephony/sms/inbound` without opening a web browser:
     - Standard shift update: `CAP ICU=2 HDU=3 MAT=12 THEATRE=READY ONEG=4 OB=Y`
     - Strike / theatre closure: `CAP STRIKE`
   - Sender phone numbers are verified against the facility's registered `dutyStationWhatsappPhone` or `emergencyPhone`, and every update is recorded in `audit_logs` (`CAPACITY_SHIFT_SMS_UPDATE`).
