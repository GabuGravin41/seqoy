# SEQOY: Manual Outreach & Strike-Resilient Deployment Guide 🏥🇰🇪

## Zero-Toll, Healthcare-Worker-Friendly Implementation Protocol

This guide establishes the operational protocol for deploying SEQOY in resource-constrained primary healthcare clinics, dispensaries, and sub-county hospitals across Kenya. It specifically eliminates external telecom billing dependencies (Twilio, paid toll-free shortcodes) in favor of **rapid manual outreach** that protects overwhelmed nurses and clinical officers from screen fatigue and administrative burnout.

---

## 1. Why Manual Calling First?

1. **Zero Financial Friction**: Twilio voice calls and toll-free virtual lines require ongoing USD billing, credit cards, and complex telco regulatory approvals. Manual calls use standard local SIM airtime, post-paid clinic minutes, or reverse-billed SMS/USSD via Africa's Talking.
2. **High Maternal Trust**: Expectant mothers frequently ignore robocalls or unknown automated numbers. A direct phone call from their local clinic nurse or Community Health Promoter (CHP) achieves >85% pickup and disclosure rates.
3. **No Screen Fatigue**: Rather than forcing nurses to learn complex software, SEQOY provides a **30-second rapid checklist** and a **1-click printable MOH 268 paper slip**.

---

## 2. Frontline Health Worker Calling SOP (30-Second Workflow)

Frontline Community Health Promoters (CHPs) and dispensary midwives perform check-ins every 14 days following this rapid script:

### Step 1: Open Patient Roster
1. Navigate to **Expectant Mothers** (`/mothers`).
2. Identify mothers due for their bi-weekly outreach (filtered by risk level or schedule).
3. Click **Call / Triage** on the mother's row.

### Step 2: Dial Directly (Native SIM)
* Click **"Dial on Phone"** or dial her number directly from your handset. No computer headset or VOIP setup is required.

### Step 3: Recite Standardized 3-Question Triage Script
Select the mother's preferred language:

* **Kiswahili**:
  > *"Hujambo [Jina], ni muuguzi kutoka kliniki. Unajisikiaje leo? Je, una maumivu makali ya kichwa, ukungu machoni, kuvuja damu, uvimbe wa uso au mikono, au mtoto kuacha kucheza?"*

* **English**:
  > *"Hello [Name], this is your clinic nurse. How are you feeling today? Are you experiencing any severe headaches, blurry vision, bleeding, sudden face/hand swelling, or reduced baby movement?"*

* **Somali**:
  > *"Asc [Name], waa kalkaalisada caafimaadka. Sidee tahay maanta? Ma leedahay madax-xanuun daran, aragga oo xumaaday, dhiig-bax, barar wejiga ah, mise ilmuhu waa joojiyay dhaqdhaqaaqa?"*

### Step 4: Rapid Danger Sign Toggles (5 Seconds)
Tap any checkboxes matching reported symptoms:
- [ ] **Severe Headache / Blurred Vision** *(Maumivu makali ya kichwa / Ukungu machoni — Pre-eclampsia)*
- [ ] **Vaginal Bleeding / Fluid Leakage** *(Kuvuja damu / Maji kutoka ukeni — Antepartum Hemorrhage / PROM)*
- [ ] **Sudden Face or Hand Swelling** *(Uvimbe wa uso au mikono — Eclampsia Risk)*
- [ ] **Reduced or Absent Fetal Movement** *(Mtoto hachezi vizuri au ametulia — Fetal Distress)*
- [ ] **Severe Upper Abdominal Pain** *(Maumivu makali ya mbavu au tumbo la juu — HELLP Syndrome)*
- [ ] **High Fever / Chills / Foul Odor** *(Homa kali au baridi — Sepsis)*

### Step 5: Save & Log Outreach (1 Click)
* **If Safe**: Click **"Save & Log Outreach"** with status *Safe & Well*. Risk level remains `NORMAL`. Routine check-in logged to database.
* **If Danger Signs**: System automatically flags `CRITICAL_EMERGENCY`. Click **"Match & Dispatch Referral Now"** to view real-time hospital bed/theatre availability.

---

## 3. Hospital Integration Under Public Health Crises & Strikes

In Kenya, healthcare delivery is frequently disrupted by nationwide or county-level doctor and clinical officer strikes (KMPDU / KUCO industrial actions), leaving public referral hospitals (Level 4/5) operating with minimal staff or closed theatres.

SEQOY maintains maternal safety during strikes through three architectural safeguards:

### 1. Dynamic Routing to Faith-Based / Mission Facilities (CHAK & KCCB)
When public referral hospitals face strike-induced closures, SEQOY's smart matching engine routes emergency cases to:
* **Tenwek Hospital** (Bomet / South Rift)
* **AIC Kijabe Hospital** (Kiambu / Rift Valley)
* **St. Luke's Hospital** (Kaloleni / Coast)
* **PCEA Chogoria Hospital** (Tharaka Nithi / Mt. Kenya)
* **Friends Hospital Kaimosi** (Vihiga / Western)

These facilities operate 24/7 during public strikes and accept referrals covered under **Social Health Authority (SHA) emergency fund provisions**.

### 2. Native KenyaEMR (OpenMRS) REST & FHIR Background Sync
Clinicians who are on duty are severely overworked. SEQOY does not ask them to adopt a separate application:
* Referral encounters are automatically dispatched to KenyaEMR via `/ws/rest/v1/encounter`.
* Mapped directly to standard **CIEL medical concepts**:
  - `113054`: Pre-eclampsia
  - `118744`: Eclampsia
  - `230`: Postpartum Hemorrhage (PPH)
  - `160085`: Gestational Age in Weeks
* Standard **HL7 FHIR R4 Bundles** (`/api/interoperability/fhir?referralId={id}`) feed into the Ministry of Health National Health Information Exchange (HIE).

### 3. Physical Paper Fallback: Standard MOH 268 Maternal Referral Slip
When power fails, hospital servers are down, or clinicians refuse to interact with software during strike tensions:
* Click **"Print MOH 268 Slip"** from the referral list or patient card.
* Generates a clean, 1-page standardized Ministry of Health paper slip that accompanies the mother in the ambulance.
* Receiving obstetricians recognize the format instantly without opening any software.

---

## 4. Rollout Timeline (Pilot to Scale)

| Phase | Duration | Scope | Key Milestone |
|---|---|---|---|
| **Phase 1: Zero-Cost Sandbox** | Weeks 1–4 | 1 Level 4 Hospital + 5 Dispensaries | Manual calling SOP validated; 0 airtime friction; 100% of referrals tracked via MOH 268 print slips. |
| **Phase 2: Faith-Based & County Pilot** | Weeks 5–12 | 1 County (e.g. Kilifi or Garissa) + CHAK network | KenyaEMR connector verified in production; live bed/theatre status verified across 15 facilities. |
| **Phase 3: National Institutionalization** | Months 4–8 | MoH DRMH & Digital Health Agency (DHA) | Integration with national eCHIS and HIE; SHA reimbursement validation for emergency maternal handovers. |
