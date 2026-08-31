/**
 * SEQOY HIMS & National Health Stack Integration Adapters
 * Non-disruptive middleware connectors for existing hospital software in Kenya
 */

export interface ConnectedSystem {
  id: string;
  name: string;
  category: 'HIMS_EHR' | 'SMART_TRIAGE' | 'NATIONAL_SURVEILLANCE' | 'BLOOD_BANK';
  vendor: string;
  protocol: 'HL7_FHIR_R4' | 'OPENMRS_REST' | 'DHIS2_REST' | 'WEBHOOK_JSON';
  status: 'CONNECTED' | 'SYNCING' | 'CONFIGURED';
  lastSync: string;
  activeFacilitiesCount: number;
  description: string;
}

export const CONNECTED_SYSTEMS: ConnectedSystem[] = [
  {
    id: 'kenya-emr',
    name: 'KenyaEMR (OpenMRS)',
    category: 'HIMS_EHR',
    vendor: 'Palladium / MOH Kenya',
    protocol: 'OPENMRS_REST',
    status: 'CONNECTED',
    lastSync: '2 mins ago',
    activeFacilitiesCount: 14,
    description: 'Bi-directional sync: auto-imports registered ANC mothers and pushes completed emergency referral handover summaries into openmrs_encounter tables.',
  },
  {
    id: 'funsoft-hims',
    name: 'Funsoft / AfyaKE HIMS',
    category: 'HIMS_EHR',
    vendor: 'Funsoft Systems Kenya',
    protocol: 'WEBHOOK_JSON',
    status: 'CONNECTED',
    lastSync: 'Real-time (Active)',
    activeFacilitiesCount: 8,
    description: 'Zero-touch Bed Management: when hospital admission desk assigns an ICU/maternity bed in Funsoft, SEQOY auto-decrements available capacity via webhook.',
  },
  {
    id: 'smart-triage',
    name: 'Smart Triage & SATS (Emergency Dept)',
    category: 'SMART_TRIAGE',
    vendor: 'Global Health Triage / SATS',
    protocol: 'HL7_FHIR_R4',
    status: 'CONNECTED',
    lastSync: '5 mins ago',
    activeFacilitiesCount: 6,
    description: 'Translates South African Triage Scale (SATS) color categories into SEQOY danger levels and pushes pre-arrival vitals directly to ER triage tablets.',
  },
  {
    id: 'khis-dhis2',
    name: 'Kenya Health Information System (KHIS / DHIS2)',
    category: 'NATIONAL_SURVEILLANCE',
    vendor: 'Ministry of Health Kenya',
    protocol: 'DHIS2_REST',
    status: 'CONNECTED',
    lastSync: 'Hourly batch',
    activeFacilitiesCount: 47,
    description: 'Automated MOH 711 & MOH 105 reporting: maps SEQOY MPDSR 3-Delays audits directly into national reproductive health indicator datasets.',
  },
  {
    id: 'damu-sasa',
    name: 'Damu-Sasa (KNBTS Blood Bank)',
    category: 'BLOOD_BANK',
    vendor: 'Damu Sasa Technologies',
    protocol: 'WEBHOOK_JSON',
    status: 'CONNECTED',
    lastSync: '10 mins ago',
    activeFacilitiesCount: 12,
    description: 'Continuous inventory sync of ABO/Rh-D blood units across Nairobi region satellite banks to eliminate blind transfusions during postpartum hemorrhage.',
  },
];

/**
 * Parses incoming HIMS Admission/Discharge Webhook
 * to automatically update bed capacity with zero human data entry.
 */
export function handleHIMSAdmissionWebhook(payload: {
  facilityMflCode: string;
  eventType: 'PATIENT_ADMITTED' | 'PATIENT_DISCHARGED';
  wardType: 'ICU' | 'HDU' | 'MATERNITY';
  patientId: string;
}) {
  const delta = payload.eventType === 'PATIENT_ADMITTED' ? -1 : 1;
  return {
    success: true,
    message: `Processed ${payload.eventType} for ${payload.wardType} ward. Capacity adjusted by ${delta}.`,
    facilityMflCode: payload.facilityMflCode,
    ward: payload.wardType,
    delta,
    processedAt: new Date().toISOString(),
  };
}

/**
 * Generates DHIS2 / KHIS2 DataValueSets JSON Payload
 * for automated MoH compliance export.
 */
export function generateKHIS2Payload(report: {
  orgUnitMfl: string;
  period: string; // e.g. "202608"
  maternalAuditsCount: number;
  delay1Count: number;
  delay2Count: number;
  delay3Count: number;
}) {
  return {
    dataSet: 'MOH_711_RH_SURVEILLANCE',
    completeDate: new Date().toISOString().split('T')[0],
    orgUnit: report.orgUnitMfl,
    period: report.period,
    dataValues: [
      { dataElement: 'MOH711_MPDSR_TOTAL_AUDITED', value: String(report.maternalAuditsCount) },
      { dataElement: 'MOH711_MPDSR_DELAY1_DECISION', value: String(report.delay1Count) },
      { dataElement: 'MOH711_MPDSR_DELAY2_TRANSPORT', value: String(report.delay2Count) },
      { dataElement: 'MOH711_MPDSR_DELAY3_QUALITY_CARE', value: String(report.delay3Count) },
    ],
  };
}
