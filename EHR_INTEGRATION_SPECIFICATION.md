# SEQOY Maternal Emergency Network: Hospital EHR & National Health Informatics Integration Specification

**Document Version**: 2.0.0 (Field & Procurement Ready)  
**Target Audience**: County Directors of Health, Hospital Medical Superintendents, Health Records and Information Officers (HRIOs), Lead Software Engineers at Palladium / KenyaEMR, AfyaKE, and Ministry of Health Digital Health Agency (DHA).  
**Jurisdiction**: Republic of Kenya (Ministry of Health Guidelines, Data Protection Act 2019, Kenya Standards and Guidelines for mHealth Systems).  

---

## 1. Executive Summary & Clinical Context
In Kenya, maternal mortality remains concentrated in the first and third phases of the WHO Three Delays framework:
- **Delay 1 (Decision to Seek Care)**: Pregnant mothers dismiss early warning symptoms (scotoma, severe epigastric pain, frontal headache, reduced fetal kick counts) until eclamptic seizures or hemorrhagic shock occurs.
- **Delay 3 (Receiving Prompt & Capable Care)**: Referring dispensaries (Level 2/3) dispatch critically ill mothers to Level 4/5 hospitals without knowing whether the receiving facility has an available ICU/HDU bed, an open operating theatre with an anesthetist, or matched blood units (O-negative, cross-matched whole blood).

**SEQOY** provides an automated early-warning telemetry system (Delay 1 via automated Swahili/English IVR calls and two-way WhatsApp/SMS) coupled to a live hospital capacity and emergency handover network (Delay 3). 

A critical deployment hurdle in public and faith-based hospitals is **avoiding "system fatigue"**: nurses and doctors will not re-type patient records into a disconnected silo. This document defines the exact architecture whereby SEQOY integrates directly into existing Electronic Health Record (EHR) systems—specifically **KenyaEMR (OpenMRS)**, **Funsoft / Smart Triage**, and the **Kenya Health Information System (KHIS / DHIS2)**.

---

## 2. Architecture & Interoperability Overview

```
+-----------------------------------------------------------------------------------------+
|                                    SEQOY INTEROPERABILITY ARCHITECTURE                   |
|                                                                                         |
|  [Pregnant Mother in Community]                                                         |
|         |                                                                               |
|         v (Automated Bi-weekly Voice Call / Weekly WhatsApp & SMS)                      |
|  +-----------------------------------------------------------------------------------+  |
|  |                             SEQOY CLINICAL ENGINE                                 |  |
|  | - Danger Sign NLP / Rule Scoring (Pre-eclampsia, Hemorrhage, Sepsis)              |  |
|  | - WHO Deterministic Triage (NORMAL / ELEVATED / CRITICAL_STAT)                    |  |
|  +-----------------------------------------------------------------------------------+  |
|         |                                                           |                   |
|         | REST / HL7 FHIR R4 Bundle                                 | Webhook Listener  |
|         v                                                           v                   |
|  +-----------------------------------------------+   +-------------------------------+  |
|  | KenyaEMR / OpenMRS REST Adapter               |   | Hospital HIMS / Webhook Ingest|  |
|  | - Patient Search by National ID / MOH Number  |   | - Live ICU/HDU Bed Decrements |  |
|  | - Automated Encounter & Obs Insertion         |   | - Theatre Status Broadcast    |  |
|  | - CIEL Concept Mapping (113054, 118744, 5622) |   | - O-Negative Blood Units      |  |
|  +-----------------------------------------------+   +-------------------------------+  |
|         |                                                           ^                   |
|         v                                                           |                   |
|  +-----------------------------------------------------------------------------------+  |
|  |                           HOSPITAL EHR LAYER (Existing Systems)                   |  |
|  | - KenyaEMR (Level 4/5 County Referral Hospitals: Pumwani, Nakuru PGH, Coast Gen)  |  |
|  | - Funsoft / CarePay M-TIBA (Faith-Based & Mission Hospitals: St. Francis, Mater)  |  |
|  +-----------------------------------------------------------------------------------+  |
|                                     |                                                   |
|                                     v (Monthly Surveillance Aggregation)                |
|  +-----------------------------------------------------------------------------------+  |
|  |            MINISTRY OF HEALTH KHIS / DHIS2 SURVEILLANCE EXPORTER (MOH 711)         |  |
|  +-----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
```

---

## 3. HL7 FHIR R4 Integration Standard

SEQOY exposes native HL7 FHIR R4 resources for hospital EHR consumption. When an emergency referral is initiated, SEQOY generates a standardized `Bundle` of type `transaction`.

### 3.1 FHIR Endpoint
- **URL**: `GET /api/interoperability/fhir?referralId={id}`
- **Content-Type**: `application/fhir+json; charset=utf-8`

### 3.2 FHIR Bundle Structure
```json
{
  "resourceType": "Bundle",
  "type": "transaction",
  "timestamp": "2026-09-26T11:40:00Z",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "seqoy-patient-42",
        "identifier": [
          { "system": "http://health.go.ke/identifiers/national-id", "value": "34918204" },
          { "system": "http://seqoy.health/identifiers/mothers", "value": "42" }
        ],
        "active": true,
        "name": [{ "text": "Halima Abdi Hassan" }],
        "telecom": [{ "system": "phone", "value": "+254722123456", "use": "mobile" }],
        "gender": "female",
        "extension": [
          { "url": "http://seqoy.health/fhir/StructureDefinition/gestational-weeks", "valueInteger": 34 }
        ]
      },
      "request": { "method": "PUT", "url": "Patient/seqoy-patient-42" }
    },
    {
      "resource": {
        "resourceType": "Observation",
        "status": "final",
        "code": {
          "coding": [
            { "system": "http://snomed.info/sct", "code": "198992004", "display": "Pre-eclampsia danger signs" }
          ]
        },
        "subject": { "reference": "Patient/seqoy-patient-42" },
        "valueQuantity": { "value": 8.5, "unit": "{score}", "system": "http://unitsofmeasure.org", "code": "{score}" },
        "valueString": "Severe epigastric pain, frontal headache, bilateral ankle edema",
        "interpretation": [
          {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                "code": "CRITICAL",
                "display": "CRITICAL_EMERGENCY"
              }
            ]
          }
        ]
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "resource": {
        "resourceType": "ServiceRequest",
        "id": "req-transfer-108",
        "identifier": [
          { "system": "http://seqoy.health/identifiers/referrals", "value": "SEQ-REF-2026-108" }
        ],
        "status": "active",
        "intent": "order",
        "priority": "stat",
        "code": {
          "coding": [
            { "system": "http://snomed.info/sct", "code": "3457005", "display": "Emergency obstetric transfer" }
          ]
        },
        "subject": { "reference": "Patient/seqoy-patient-42", "display": "Halima Abdi Hassan" },
        "requester": { "display": "Modogashe Sub-County Hospital" },
        "performer": [{ "display": "Garissa County Referral Hospital" }],
        "reasonCode": [{ "text": "Imminent Eclampsia / Severe Pre-eclampsia" }],
        "authoredOn": "2026-09-26T11:40:00Z"
      },
      "request": { "method": "POST", "url": "ServiceRequest" }
    }
  ]
}
```

---

## 4. KenyaEMR (OpenMRS) Bi-Directional Adapter

KenyaEMR uses OpenMRS 2.x as its core clinical engine. SEQOY provides an automated connector (`src/lib/interoperability/kenyaemr_connector.ts`) that communicates directly with the OpenMRS REST Web Services API (`/openmrs/ws/rest/v1/`).

### 4.1 Concept Mappings (Columbia International eHealth Laboratory - CIEL)
To ensure seamless clinical comprehension in KenyaEMR without concept dictionary conflicts:
| Clinical Parameter | CIEL Concept ID | OpenMRS Datatype | Description |
| :--- | :--- | :--- | :--- |
| **Gestational Age** | `160085` | Numeric | Gestational age in completed weeks |
| **Pre-eclampsia** | `113054` | Coded | Blood pressure $\ge 140/90$ with proteinuria / end-organ signs |
| **Eclampsia** | `118744` | Coded | Tonic-clonic seizures in pregnancy/postpartum |
| **Antepartum Hemorrhage** | `111580` | Coded | Vaginal bleeding prior to delivery |
| **Postpartum Hemorrhage** | `230` | Coded | Blood loss $>500\text{ mL}$ vaginal or $>1000\text{ mL}$ C-section |
| **Triage Alert Note** | `5622` | Text | Clinical indications, emergency referral notes |
| **Systolic Blood Pressure** | `5088` | Numeric | Systolic mmHg |
| **Diastolic Blood Pressure**| `5087` | Numeric | Diastolic mmHg |

### 4.2 Automated Encounter Workflow:
1. **Patient Search**: When a mother arrives at the hospital, KenyaEMR searches SEQOY records by National ID or Phone Number via `GET /ws/rest/v1/patient?q={query}`.
2. **Referral Acknowledgment**: When the triage nurse confirms admission, SEQOY pushes a standardized `Triage Encounter` (UUID: `d7151f82-c1f3-4215-9234-7ad01633534d`) containing pre-populated vital signs and danger signs.
3. **Zero Duplicate Entry**: The admitting doctor reviews the pre-populated clinical handover rather than manually typing community danger-sign histories.

---

## 5. Delay-3 Facility Readiness Webhook Ingest

To maintain real-time bed, theatre, and blood bank accuracy without human re-typing:

### 5.1 Webhook Endpoint
- **URL**: `POST /api/interoperability/webhooks`
- **Authentication**: `Authorization: Bearer <HIMS_WEBHOOK_SECRET>`

### 5.2 Payload Schema
```json
{
  "facilityId": 2,
  "eventType": "PATIENT_ADMITTED",
  "wardType": "ICU"
}
```
* `eventType`: `"PATIENT_ADMITTED"` (decrements available beds by 1) or `"PATIENT_DISCHARGED"` (increments available beds by 1).
* `wardType`: `"ICU"`, `"HDU"`, or `"MATERNITY"`.

If a hospital does not have an automated EHR webhook integration, the bed manager utilizes the **10-second manual update screen** at `/capacity`, which immediately broadcasts updated readiness to all network clinics.

---

## 6. National DHIS2 / KHIS MOH 711 Surveillance Exporter

For County Directors of Health and the Ministry of Health Division of Reproductive & Maternal Health (DRMH), SEQOY automatically aggregates clinical events into standard MOH 711 surveillance datasets:

```json
{
  "dataSet": "MOH_711_RH_SURVEILLANCE",
  "completeDate": "2026-09-26",
  "orgUnit": "KMFL_13023",
  "period": "202608",
  "dataValues": [
    { "dataElement": "MOH711_MPDSR_TOTAL_AUDITED", "value": "14" },
    { "dataElement": "MOH711_MPDSR_DELAY1_DECISION", "value": "9" },
    { "dataElement": "MOH711_MPDSR_DELAY3_QUALITY_CARE", "value": "3" }
  ]
}
```

---

## 7. Kenya Data Protection Act (2019) Compliance
- **Data Residency**: Deployed on local Kenya sovereign cloud infrastructure (e.g. Safaricom Cloud, Dimension Data Kenya, or local hospital on-premise servers).
- **Encryption**: TLS 1.3 in transit; AES-256 for all at-rest clinical data.
- **Access Control**: Role-based access control (RBAC) enforced server-side. Midwives only access community cohorts; County Directors view de-identified aggregate surveillance metrics.
