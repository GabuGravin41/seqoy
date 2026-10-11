# Verified Health Leadership & Institutional Donor Outreach Dossiers
## Project SEQOY: Autonomous Early Warning & Hospital Readiness Network for Maternal Care

**Document Version**: 2.0.0 (Field-Targeted Institutional Outreach)  
**Jurisdiction**: Republic of Kenya  
**Compliance Standard**: Zero External Messaging Guard Active (All drafts saved locally for executive review).

---

### Dossier 1: County Executive Committee Member (CEC) for Health — Garissa County
* **Target Official**: County Executive Committee Member for Health, Department of Health Services, County Government of Garissa.
* **Physical Office**: Garissa County Headquarters, Kismayu Road, Garissa.
* **Key Facilities**: Garissa County Referral Hospital (Level 5), Modogashe Sub-County Hospital, Masalani Sub-County Hospital, Dadaab Sub-County Hospital.
* **Clinical Problem & Stat**: Garissa County suffers from one of Kenya's highest Maternal Mortality Ratios (MMR $\approx 646$ per 100,000 live births according to KNBS/KDHS). Geographic dispersal means mothers travel up to 150 km to reach Garissa Referral Hospital, frequently arriving in eclamptic convulsions or hemorrhagic shock because dispensaries refer blind without knowing if the Level 5 theatre or blood bank has capacity.
* **Value Proposition**: SEQOY introduces automated Somali-language voice calls and two-way SMS check-ins directly to nomadic and rural mothers every 2 weeks, flagging severe headaches and visual changes before seizures strike. It connects Modogashe and Masalani dispensaries to Garissa Referral Hospital's live ICU bed and blood stock board via KenyaEMR HL7 FHIR interoperability.
* **Proposed Partnership**: 6-month county pilot across 15 peripheral health centres and Garissa County Referral Hospital, funded via Garissa County Health Services budget and Equalization Fund allocations.

```markdown
Subject: Pilot Proposal: Closing Delay 1 and Delay 3 Maternal Deaths in Garissa County via KenyaEMR-Integrated Automated Triage

Dear CEC Member for Health, Garissa County,

With Garissa County managing a maternal mortality burden exceeding 600 deaths per 100,000 live births, the vast majority of maternal fatalities are driven by two preventable bottlenecks: rural mothers recognizing eclampsia danger signs too late (Delay 1), and primary health centres in Modogashe or Masalani referring critically ill mothers to Garissa County Referral Hospital without real-time visibility into theatre, ICU bed, or O-negative blood readiness (Delay 3).

SEQOY (seqoy.health) is an automated maternal early-warning and facility-readiness network engineered specifically for Kenya's county healthcare ecosystem:
1. Reaching Rural Mothers in Their Language: Scheduled, automated voice calls and two-way SMS check-ins conducted in Somali and Swahili every 14 days, monitoring danger signs (puffy face, severe headache, epigastric pain, reduced fetal movement) and flagging high-risk mothers directly to the nearest sub-county midwife.
2. Zero-Friction KenyaEMR Integration: Connects directly into Garissa County Referral Hospital’s existing KenyaEMR deployment via HL7 FHIR R4 bundles, generating pre-populated triage encounters without requiring clinical staff to learn a new software system.
3. Live Facility Readiness: Level 2 and Level 3 dispensaries verify live ICU bed, operating theatre, and blood bank availability before initiating an emergency referral, preventing fatal inter-facility transit delays.

We propose a fully supported 6-month pilot covering Garissa County Referral Hospital and 10 linked primary health centres, providing county-wide MPDSR surveillance and automated MOH 711 reporting.

May we schedule a 20-minute briefing with your County Health Management Team (CHMT) and County Reproductive Health Coordinator this coming week?

Sincerely,
Dalton Gabriel Omondi  
Lead, SEQOY Maternal Emergency Network  
Nairobi, Kenya | dalton@seqoy.health
```

---

### Dossier 2: County Executive Committee Member (CEC) for Health — Kilifi County
* **Target Official**: CEC Member for Health Services, County Government of Kilifi.
* **Physical Office**: Kilifi County Health Department, Hospital Road, Kilifi.
* **Key Facilities**: Kilifi County Referral Hospital, Malindi Sub-County Hospital, Mariakani Sub-County Hospital, Bamba Sub-County Hospital.
* **Clinical Problem & Stat**: High incidence of teenage pregnancy, home deliveries, and delayed referral transit from hinterland areas (Bamba, Ganze, Magarini) to Kilifi Referral Hospital, resulting in preventable postpartum hemorrhage and sepsis deaths.
* **Value Proposition**: Two-way Swahili SMS and automated IVR voice triage that empowers Community Health Promoters (CHPs) and dispensary nurses to track high-risk pregnancies, combined with live blood-bank and theatre readiness tracking across Kilifi and Malindi referral centres.
* **Procurement Vehicle**: Kilifi County Health Sector Strategic Plan (KHSSP) / World Bank Financing Locally-Led Climate Action (FLLoCA) resilience healthcare allocations.

```markdown
Subject: Eliminating Blind Referrals & Early Eclampsia Deaths: Automated Maternal Readiness for Kilifi County Health Facilities

Dear CEC Member for Health, Kilifi County,

In Kilifi County, maternal deaths often occur not because clinical protocols are lacking, but because expectant mothers in Ganze, Bamba, and Magarini experience early danger signs in isolation, and rural dispensaries refer mothers to Kilifi County Referral Hospital or Malindi Sub-County Hospital without knowing if the theatre is occupied or if blood units are available.

SEQOY addresses this dual bottleneck without imposing new hardware or complex data entry on already strained nursing cadres:
- Automated Community Telemetry: Automated bi-weekly check-in calls in Swahili, systematically screening for severe pre-eclampsia, bleeding, and infection, escalating alerts to the local Community Health Unit (CHU).
- Live Referral Handshake: Before a patient is transferred from Mariakani or Bamba, the midwife views Kilifi Referral Hospital's live HDU/maternity bed and operating theatre status, securing bed and blood reservations digitally.
- Seamless OpenMRS / KenyaEMR Sync: Transmits clinical handover notes directly into the hospital's electronic records via open HL7 FHIR R4 interfaces.

We would welcome the opportunity to present a deployment roadmap to your County Reproductive Health Coordinator and County Health Records Officer to assess a pilot across Kilifi and Malindi health corridors.

Sincerely,
Dalton Gabriel Omondi  
Lead, SEQOY Maternal Emergency Network
```

---

### Dossier 3: Head of Division of Reproductive & Maternal Health (DRMH), Ministry of Health
* **Target Official**: Head, Division of Reproductive and Maternal Health (DRMH), Afya House, Cathedral Road, Nairobi.
* **Statutory Role**: Sets national maternal, newborn, and reproductive clinical guidelines, oversees National Maternal and Perinatal Death Surveillance and Response (MPDSR), and governs national health data reporting (MOH 711).
* **Policy Focus**: Ending preventable maternal mortality (EPMM), accelerating SDG 3.1 ($<70\text{ per 100,000 live births}$), scaling up digital health under the Kenya Digital Health Act 2023.
* **Value Proposition**: Standardized digital Delay 1 and Delay 3 tracking, eliminating manual paperwork in MPDSR maternal death audits, and feeding real-time digital surveillance data into the national Health Information Exchange (HIE) and KHIS/DHIS2.

```markdown
Subject: National Scale: Automated Delay-1 Danger Sign Screening & Delay-3 Facility Readiness Handshake for National MPDSR

Dear Head of Division, Reproductive and Maternal Health (DRMH),

Under the Kenya Digital Health Act 2023 and the National MPDSR Guidelines, the Ministry has prioritized ending preventable maternal mortality through timely data and strengthened primary care networks (PCNs).

While primary health facilities capture maternal check-ups during routine Antenatal Care (ANC), the critical period between visits—where severe pre-eclampsia and antepartum hemorrhage develop—remains an unmonitored blind spot. Furthermore, when complications emerge, referral pathways suffer from severe information asymmetry regarding tertiary hospital readiness.

SEQOY (seqoy.health) has been engineered as an open, national-scale digital bridge:
1. Community Early Warning: Deterministic, WHO-aligned algorithmic symptom screening over two-way automated voice calls, SMS, and WhatsApp in Swahili, Somali, and English, flagging imminent eclampsia and hemorrhage.
2. HIE & FHIR Compliance: Implements full HL7 FHIR R4 ServiceRequest and Observation standards, enabling zero-friction interoperability with the Ministry's emerging National Health Information Exchange (HIE) and KenyaEMR installations.
3. Automated MPDSR Audits: Automatically collates Delay 1 and Delay 3 metrics, feeding structured data into DHIS2 / KHIS MOH 711 aggregate reporting.

We request an introductory consultation with your technical team at Afya House to demonstrate the platform and discuss technical alignment with the Digital Health Agency (DHA) enterprise architecture.

Respectfully yours,
Dalton Gabriel Omondi  
Lead, SEQOY Maternal Emergency Network  
Afya House Liaison Office, Nairobi
```

---

### Dossier 4: Executive Leadership & Clinical Team — Jacaranda Health
* **Target Organization**: Jacaranda Health (Kenyan non-profit operating the PROMPTS AI maternal messaging service across 20+ counties).
* **Headquarters**: Sanlam Tower, Waiyaki Way, Westlands, Nairobi.
* **Strategic Synergy**: Jacaranda Health has successfully enrolled over 3 million mothers on PROMPTS for SMS-based maternal nudges. However, PROMPTS primarily operates on SMS text. SEQOY provides two critical complementary capabilities:
  1. Automated Interactive Voice Response (IVR) voice calls in local languages for illiterate and semi-literate mothers who cannot read SMS messages.
  2. The facility-side Delay 3 readiness network (real-time bed, theatre, and blood tracking + FHIR KenyaEMR integration), completing the loop from home triage to hospital admission.

```markdown
Subject: Complementing PROMPTS: Integrating IVR Voice Screening and Live Delay-3 Hospital Readiness Handshakes

Dear Jacaranda Health Leadership Team,

Jacaranda’s PROMPTS platform has set the gold standard in Kenya for scaling mobile maternal health nudges across public health facilities. As you expand to full national coverage, two critical structural frontiers remain:
1. Illiterate & Low-Literacy Reach: Mothers in marginalized counties (Garissa, Mandera, Turkana) who cannot read SMS prompts require spoken voice (IVR) interaction in Somali, Turkana, and Swahili.
2. Closing Delay 3: When a mother reports danger signs on mobile, referring clinics still face the blind referral barrier—lacking live confirmation of whether Pumwani, Nakuru PGH, or Coast General has an available ICU bed, functioning theatre, or blood units.

SEQOY (seqoy.health) was engineered specifically to solve these two challenges:
- Automated Voice Telemetry: Two-way scheduled voice check-ins conducting structured clinical screening.
- Live Facility Readiness Board: Connecting Level 2/3 dispensaries to Level 4/5 hospital capacity in real time via KenyaEMR HL7 FHIR webhooks.

We would value an exploratory discussion on how SEQOY’s voice engine and hospital readiness infrastructure can integrate alongside PROMPTS to provide public health partners with an end-to-end maternal safety net.

Warm regards,
Dalton Gabriel Omondi  
Lead, SEQOY Maternal Emergency Network  
Nairobi, Kenya
```

---

### Dossier 5: Program Officer, Maternal & Child Health — Bill & Melinda Gates Foundation (East Africa)
* **Target Official**: Program Officer, Maternal, Newborn & Child Health (MNCH), Bill & Melinda Gates Foundation.
* **Office**: East Africa Regional Office, The Mirage, Chiromo Road, Nairobi.
* **Funding Envelope**: Grand Challenges / MNCH Digital Health Innovation Grants ($500,000 to $1,500,000 multi-year program grants).
* **Alignment**: The Gates Foundation MNCH strategy prioritizes reducing intrapartum maternal mortality, preventing eclampsia through early detection, and scaling digital interoperability (OpenMRS / FHIR) in sub-Saharan Africa.

```markdown
Subject: Grant Concept: Zero-Friction Community IVR Telemetry & KenyaEMR FHIR Emergency Handshakes for Reducing Maternal Mortality

Dear MNCH Program Officer, Bill & Melinda Gates Foundation,

In sub-Saharan Africa, maternal mortality remains stagnant around 380 deaths per 100,000 live births, heavily driven by delayed detection of severe pre-eclampsia and uncoordinated emergency referrals to facilities with acute resource stock-outs.

We present SEQOY (seqoy.health), an open, digital public good designed to eliminate Delay 1 and Delay 3 maternal deaths in Kenya:
- High-Adherence Voice & Message Telemetry: Overcomes maternal illiteracy by providing scheduled, automated voice calls and two-way messaging, algorithmically screening danger signs between routine ANC visits.
- Native EHR Interoperability: Adheres to HL7 FHIR R4 and OpenMRS REST protocols, automatically transferring clinical handover records directly into KenyaEMR at Level 4/5 hospitals.
- Empirical Facility Readiness: Eliminates blind emergency referrals through real-time ICU, theatre, and blood bank status synchronization.

We are preparing a formal concept submission for Gates Foundation MNCH innovation mechanisms and would welcome 15 minutes to share our pilot architecture, KenyaEMR technical benchmarks, and county deployment roadmap.

Respectfully yours,
Dalton Gabriel Omondi  
Lead, SEQOY Maternal Emergency Network  
Nairobi, Kenya
```

---

### Dossier 6: Project Director — USAID MOMENTUM Country and Global Leadership (Kenya)
* **Target Official**: Project Director, USAID MOMENTUM Country and Global Leadership, Nairobi.
* **Institutional Mandate**: USAID’s flagship project for ending preventable maternal and child deaths by strengthening county health systems, reproductive health services, and quality of care.
* **Value Proposition**: Direct technical alignment with USAID’s Priority County investments (Western and Coastal Kenya), providing measurable reductions in delay-related maternal mortalities and automated MPDSR surveillance reporting.

---

### Dossier 7: Country Director — AMREF Health Africa in Kenya
* **Target Official**: Country Director, AMREF Health Africa in Kenya, Lang'ata Road, Nairobi.
* **Institutional Synergy**: AMREF trains and coordinates hundreds of thousands of Community Health Promoters (CHPs) via the Leap mobile learning platform. SEQOY provides CHPs with an automated clinical co-pilot: when an enrolled mother misses a call or reports danger signs, the CHP's phone is automatically alerted with her exact gestational age, danger signs, and mapped facility options.

---

### Dossier 8: Medical Superintendent / Clinical Director — Pumwani Maternity Hospital
* **Target Official**: Medical Superintendent & Head of Clinical Services, Pumwani Maternity Hospital, Pumwani Road, Nairobi.
* **Institutional Profile**: The largest dedicated tertiary maternity hospital in East and Central Africa (averaging 80 to 100 deliveries per 24 hours, handling high volumes of complicated obstetric emergencies referred from Nairobi and surrounding counties).
* **Clinical Pain Point**: Blind transfer arrivals. Mothers arrive at Pumwani by taxi or ambulance with no prior clinical handover, unannounced, while theatres are occupied with emergency C-sections or blood reserves are exhausted.
* **Value Proposition**: Digital Pre-Arrival Notification and KenyaEMR FHIR sync: Pumwani triage receives structured pre-arrival alerts before the ambulance arrives, locking in blood and theatre preparation.

---

### Dossier 9: Health Specialist — Global Financing Facility (GFF) / World Bank Kenya Office
* **Target Official**: Senior Health Specialist, Global Financing Facility for Women, Children and Adolescents, World Bank Group, Delta Center, Menengai Road, Upper Hill, Nairobi.
* **Institutional Mandate**: Multi-stakeholder partnership supporting country-led investments in reproductive, maternal, newborn, child, and adolescent health (RMNCAH).
* **Funding Mechanism**: Results-based financing and county health system grants linked directly to reductions in maternal mortality.

---

### Dossier 10: Chief Executive Officer — Kenya Healthcare Federation (KHF)
* **Target Official**: Chief Executive Officer, Kenya Healthcare Federation (KHF), Nairobi.
* **Institutional Mandate**: The apex body representing the private health sector in Kenya, including private maternity hospitals, faith-based health networks (CHAK, KCCB), and medical insurance providers under the Social Health Authority (SHA / SHIF).
* **Commercial Value**: Enabling private and faith-based hospitals to monetize available ICU and theatre capacity by participating in county emergency referral networks with guaranteed SHA reimbursement claims backed by digital FHIR audit trails.
