# SEQOY: Institutional Donor & Strategic Partner Outreach Package
**Addressing WHO Delay 1 (Danger Sign Identification) & Delay 3 (Real-Time Facility Readiness)**

> **Confidential Internal Staging Directory**: These drafts are prepared for review. In accordance with safety protocol, no messages are automatically dispatched.

---

## 1. Executive Summary & Value Proposition

In sub-Saharan Africa, maternal mortality remains unacceptably high (~530 deaths per 100,000 live births). The WHO "Three Delays" framework identifies the failure points:
1. **Delay 1**: Recognizing danger signs and deciding to seek care.
2. **Delay 2**: Reaching the health facility (transport/geography).
3. **Delay 3**: Receiving adequate and timely care upon arrival at the facility.

**SEQOY** is an integrated digital triage and live facility readiness platform that closes **Delay 1** and **Delay 3** simultaneously:
- **For Mothers (Delay 1)**: Automated bi-weekly voice check-in calls in local languages (Swahili/English) and weekly two-way WhatsApp/SMS symptom prompts, powered by deterministic clinical triage algorithms (identifying pre-eclampsia, eclampsia, hemorrhage, and sepsis).
- **For Referral Hospitals (Delay 3)**: A real-time, low-friction readiness dashboard tracking available ICU/HDU beds, functioning operating theatres, and blood bank units (e.g. O-negative availability), ensuring mothers are never referred to an overwhelmed or unequipped facility.

---

## 2. Institutional Pitch Drafts

### Draft 1: Bill & Melinda Gates Foundation
**Target**: Program Officer, Maternal, Newborn & Child Health Discovery & Tools  
**Subject**: Closing WHO Delay 1 & 3: Deterministic Voice Triage and Live Facility Readiness for SSA Mothers  

```text
Dear Dr. [Program Officer Name],

Across sub-Saharan Africa, over 60% of preventable maternal deaths occur not from lack of medical knowledge, but from structural information latency: mothers recognize danger signs too late (Delay 1), or arrive at referral hospitals only to find zero ICU beds, an offline theatre, or no blood products (Delay 3).

We have developed SEQOY (https://seqoy.org), an open, lightweight clinical triage and facility readiness platform specifically engineered to eliminate this double-ended latency.

What SEQOY delivers in production:
1. Low-Tech, High-Fidelity Triage (Delay 1): Bi-weekly automated interactive voice calls and two-way WhatsApp/SMS prompts in local dialects. Using deterministic WHO danger-sign scoring, it screens for pre-eclampsia indicators (headaches, scotoma, epigastric pain) and triggers immediate clinical nurse escalation.
2. Live Facility Readiness Telemetry (Delay 3): A 10-second manual/webhook sync enabling peripheral primary health clinics to view real-time theater availability, blood bank status, and obstetrics bed capacity across secondary and tertiary referral facilities before initiating transit.

Unlike black-box AI chatbots, SEQOY employs rule-based, clinician-auditable triage workflows that run with zero local GPU overhead and function seamlessly on 2G feature phones via USSD/voice.

We are seeking catalytic grant funding ($150,000) to validate a 12-month pilot across 20 primary health clinics and 3 county referral hospitals in Kenya, covering an estimated 15,000 expectant mothers.

Could we schedule a brief 15-minute briefing next week to share our clinical protocol and live dashboard architecture?

Warm regards,

Dalton Omondi
Lead Architect, SEQOY
Nairobi, Kenya | daltongabrielomondi588@gmail.com
```

---

### Draft 2: USAID MOMENTUM (Country and Global Leadership)
**Target**: Maternal Health Technical Director  
**Subject**: Partnership Proposal: Digitalizing Obstetric Referral Readiness & Early Warning in Kenya  

```text
Dear [Director Name],

USAID MOMENTUM’s focus on overcoming systemic bottlenecks in maternal and newborn health directly mirrors the challenge we are addressing on the ground in Kenya.

Every week, expectant mothers suffering acute complications like severe pre-eclampsia spend critical hours in transit, only to bounce between facilities that lack emergency obstetric and newborn care (CEmONC) capacity at that exact moment.

SEQOY resolves this by pairing community-level proactive surveillance with dynamic referral capacity routing:
- Early Danger Sign Capture: Proactive automated voice outreach detects danger signs before catastrophic seizure or hemorrhage occurs.
- Dynamic Facility Matching: Peripheral midwives can verify in real-time whether the receiving hospital currently has an open operating room and blood supply, cutting Delay 3 to zero.

The system is built on standard open web protocols (Next.js, Drizzle ORM, PostgreSQL) with modular SMS/Voice connectors (Africa's Talking / Twilio), designed for frictionless handover to County Departments of Health.

We would welcome the opportunity to discuss integrating SEQOY into ongoing MOMENTUM health systems strengthening programs in Western or Coastal Kenya.

Are you available for a brief virtual discussion on Thursday at 2:00 PM EAT?

Sincerely,

Dalton Omondi
SEQOY Maternal Health Initiative
daltongabrielomondi588@gmail.com
```

---

### Draft 3: AMREF Health Africa
**Target**: Group Chief Executive Officer / Director of Digital Health  
**Subject**: Integrating Real-Time Obstetric Bed & Theater Telemetry with AMREF Community Health Networks  

```text
Dear Dr. [Name],

AMREF’s community health worker (CHW) network is the gold standard for grassroots maternal care across Africa. However, when a CHW identifies a mother with severe complications, the critical blindspot remains: "Which referral facility actually has an open theater and blood units right now?"

SEQOY provides the missing link between community detection and institutional readiness:
1. Seamless CHW / Mother Voice Prompts: Automates bi-weekly maternal symptom capture, flagging Red-tier emergencies to the nearest designated AMREF CHW supervisor.
2. Live Facility Telemetry: Equips frontline health teams with an honest, real-time snapshot of referral hospital capacity (ICU, maternity beds, functioning surgical suites).

By layering SEQOY’s open software engine over AMREF's existing mobile health training infrastructure (such as Leap), we can immediately reduce avoidable secondary delays in referral routing.

We would love to demonstrate a live instance of SEQOY to your digital health technical team and explore a joint proof-of-concept deployment.

Thank you for your tireless leadership in African health.

Best regards,

Dalton Omondi
Founder, SEQOY
Nairobi, Kenya | daltongabrielomondi588@gmail.com
```

---

### Draft 4: Jacaranda Health
**Target**: Chief Executive Officer / Head of Technology (PROMPTS)  
**Subject**: Complementing PROMPTS: Real-Time Hospital Theater & Blood Bank Capacity Feeds  

```text
Dear [Name],

We have closely followed Jacaranda Health’s tremendous success with PROMPTS, scaling two-way SMS digital triage to hundreds of thousands of mothers across Kenyan public hospitals.

Where PROMPTS excels in behavioral nudges and early symptom screening, an acute systemic barrier often arises downstream: when a mother is told to visit a referral hospital, the facility itself is frequently overwhelmed, lacking surgical staff, blood, or open beds at that precise hour (WHO Delay 3).

SEQOY has built the real-time operational counterpart:
- A minimalist, high-trust hospital readiness dashboard tracking theater status, obstetrics beds, and blood units.
- Standardized API endpoints allowing triage platforms like PROMPTS to query live facility capacity and dynamically suggest the optimal receiving hospital.

We would love to explore an API collaboration or data-sharing integration that empowers mothers with both symptom awareness and guaranteed facility readiness.

Could we connect for 20 minutes this week to explore technical synergy?

Warm regards,

Dalton Omondi
Lead Developer, SEQOY
daltongabrielomondi588@gmail.com
```

---

### Draft 5: UNFPA Kenya (United Nations Population Fund)
**Target**: Country Representative, Maternal Health & Emergency Obstetric Care  
**Subject**: Ending Preventable Maternal Mortality: Mitigating WHO Delay 1 & Delay 3 via SEQOY  

```text
Dear [Representative Name],

UNFPA's mission to achieve zero preventable maternal deaths requires tackling the breakdown of the referral chain. In Kenya, maternal mortality remains stubbornly high at 342 per 100,000 live births, with Delay 1 (delayed recognition) and Delay 3 (delayed institutional care) accounting for over 75% of maternal audits.

SEQOY is an open-access digital solution designed to support County Health Management Teams (CHMTs):
1. Proactive Voice Surveillance: Automated voice check-ins bypass illiteracy barriers, screening mothers directly in local dialects for hypertensive crisis and obstetric hemorrhage warning signs.
2. Transparent Referral Capacity: Prevents the tragic "referral merry-go-round" where ambulances transport critical mothers to facilities without open theaters or blood supplies.

The platform requires no proprietary hardware and runs on basic cloud/on-premise infrastructure with full data residency compliance.

We would be honored to present SEQOY to your maternal health advisory committee.

Respectfully yours,

Dalton Omondi
SEQOY Initiative
daltongabrielomondi588@gmail.com
```

---

### Draft 6: World Health Organization (WHO) AFRO
**Target**: Regional Advisor, Reproductive, Maternal and Newborn Health  
**Subject**: Operationalizing the Three Delays Framework via Open Digital Health Architecture  

```text
Dear Dr. [Advisor Name],

The WHO Three Delays model has defined maternal health policy for three decades. While clinical protocols are well-established, operational implementation in low-resource settings suffers from acute communication friction.

SEQOY directly translates the Three Delays framework into software architecture:
- Algorithmic triage mapping maternal symptoms directly to WHO emergency obstetric guidelines.
- Elimination of Delay 3 via live operational telemetry of emergency obstetric and newborn care (EmONC) facility readiness.

We have compiled our architecture and initial Kenyan health clinic validation data and would value the opportunity to align our indicators with WHO AFRO digital health guidelines.

May we share our technical white paper with your technical working group?

Sincerely,

Dalton Omondi
SEQOY Initiative | Nairobi, Kenya
daltongabrielomondi588@gmail.com
```

---

### Draft 7: Global Financing Facility (GFF) / World Bank
**Target**: Investment Specialist, Primary Health Care & Maternal Resilience  
**Subject**: Scalable Primary Health Referral Telemetry: Reducing Obstetric Latency in Kenya  

```text
Dear [Investment Specialist Name],

As the Global Financing Facility scales investments in primary healthcare resilience across sub-Saharan Africa, capital efficiency hinges on optimizing existing facility utilization rather than building redundant infrastructure.

SEQOY addresses health system efficiency by dynamically balancing patient flow:
- Preventing overcrowding at national referral hubs (e.g. Kenyatta National Hospital) by directing expectant mothers to equipped sub-county level-4 hospitals with verified open theater capacity.
- Enhancing primary clinic throughput via automated maternal triage calls.

We are packaging SEQOY as an open-source digital public good for county health systems in Kenya and invite GFF to review our impact metrics and economic model.

We would be delighted to schedule an introductory call at your convenience.

Best regards,

Dalton Omondi
Founder, SEQOY
daltongabrielomondi588@gmail.com
```

---

### Draft 8: Wellcome Trust
**Target**: Discovery Research / Health Systems Innovations Lead  
**Subject**: Digital Telemetry & Deterministic Triage to Eliminate Maternal Care Delays in East Africa  

```text
Dear [Program Lead Name],

Health systems research in low-income settings frequently reveals that high maternal mortality is an information-routing failure rather than an intrinsic shortage of clinicians. 

SEQOY is an engineering research and software deployment project exploring how low-bandwidth voice telemetry and deterministic clinical triage can eliminate systemic referral delays.

Our research objectives:
1. Measuring the reduction in emergency transit time when receiving facility capacity is verified prior to dispatch.
2. Evaluating the sensitivity of voice-based symptom extraction in diverse linguistic cohorts in rural Kenya.

We are preparing an application for Wellcome Trust's translational research scheme and would appreciate any initial alignment guidance from your portfolio team.

Kind regards,

Dalton Omondi
SEQOY Initiative | daltongabrielomondi588@gmail.com
```

---

### Draft 9: Safaricom Foundation
**Target**: Head of Sustainable Development Goals & Maternal Health  
**Subject**: Leveraging M-Pesa & Safaricom Voice Infrastructure for Maternal Emergency Triage (SEQOY)  

```text
Dear [Name],

Safaricom Foundation’s impactful maternal health programs—such as Uzazi Salama—demonstrate the transformative power of mobile technology in saving mothers' lives.

SEQOY leverages Safaricom’s ubiquitous voice and USSD networks to ensure no mother is left behind:
- Dialing mothers bi-weekly for free, automated maternal wellness checks in Swahili.
- Connecting emergency referrals directly to hospital facilities with verified theater and blood availability.

We would love to explore how SEQOY can be integrated with Safaricom’s mobile infrastructure and foundation initiatives to scale across all 47 counties in Kenya.

Could we meet briefly at your headquarters in Westlands or via Microsoft Teams next week?

Warm regards,

Dalton Omondi
Lead Developer, SEQOY | Nairobi
daltongabrielomondi588@gmail.com
```

---

### Draft 10: Kenya Ministry of Health (MoH) - Division of Reproductive and Maternal Health
**Target**: Head of Division, Reproductive and Maternal Health  
**Subject**: Technical Demonstration: SEQOY Early Warning & Live Obstetric Capacity Matching  

```text
Dear Dr. [Director Name],

In support of the Ministry of Health’s mandate to accelerate the reduction of maternal and neonatal mortality in line with the Kenya Vision 2030, we have developed SEQOY—an open-source maternal early warning and referral capacity tracking system.

Key Capabilities for County Health Departments:
1. Automated Community Triage: Early warning scoring for pre-eclampsia, antepartum hemorrhage, and obstructed labor.
2. Real-Time Referral Coordination: Dashboards for Level 4 and Level 5 hospitals displaying live maternity bed occupancy and theatre readiness, preventing blind referrals.
3. Full KHIS / DHIS2 Compatibility: Exportable data schemas designed to integrate with Kenya Health Information System indicators.

We respectfully request a 20-minute technical demonstration for your department to show how SEQOY can support county emergency obstetric referral networks.

Respectfully yours,

Dalton Omondi
Lead Architect, SEQOY
daltongabrielomondi588@gmail.com
```
