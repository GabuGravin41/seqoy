/**
 * SEQOY HL7 FHIR R4 Interoperability Transformer
 * Converts SEQOY clinical entities into international HL7 FHIR standard resources
 * for seamless zero-friction ingestion by KenyaEMR (OpenMRS), Funsoft, Smart Triage, and Epic/Cerner.
 */

export interface FHIRIdentifier {
  system: string;
  value: string;
}

export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  identifier: FHIRIdentifier[];
  active: boolean;
  name: [{ text: string; family?: string; given?: string[] }];
  telecom: [{ system: 'phone'; value: string; use: 'mobile' }];
  gender: 'female';
  extension?: Array<{
    url: string;
    valueInteger?: number;
    valueString?: string;
  }>;
}

export interface FHIRObservation {
  resourceType: 'Observation';
  id: string;
  status: 'final' | 'preliminary';
  category: [{ coding: [{ system: string; code: string; display: string }] }];
  code: { coding: [{ system: string; code: string; display: string }] };
  subject: { reference: string; display: string };
  effectiveDateTime: string;
  valueQuantity?: { value: number; unit: string; system: string; code: string };
  valueString?: string;
  interpretation?: [{ coding: [{ system: string; code: string; display: string }] }];
}

export interface FHIRServiceRequest {
  resourceType: 'ServiceRequest';
  id: string;
  identifier: FHIRIdentifier[];
  status: 'active' | 'completed' | 'on-hold';
  intent: 'order';
  priority: 'stat' | 'urgent' | 'routine';
  code: { coding: [{ system: string; code: string; display: string }] };
  subject: { reference: string; display: string };
  requester: { display: string };
  performer: [{ display: string }];
  reasonCode: [{ text: string }];
  authoredOn: string;
}

export interface FHIRLocationCapacity {
  resourceType: 'Location';
  id: string;
  identifier: FHIRIdentifier[];
  name: string;
  status: 'active';
  operationalStatus: {
    system: 'http://terminology.hl7.org/CodeSystem/v2-0116';
    code: string;
    display: string;
  };
  extension: Array<{
    url: string;
    valueInteger?: number;
    valueString?: string;
  }>;
}

/**
 * Transforms a SEQOY Patient into an HL7 FHIR R4 Patient Resource
 */
export function toFHIRPatient(patient: {
  id: number | string;
  name: string;
  phone: string;
  gestationalWeek: number;
  nationalId?: string;
}): FHIRPatient {
  return {
    resourceType: 'Patient',
    id: `seqoy-patient-${patient.id}`,
    identifier: [
      {
        system: 'http://health.go.ke/identifiers/national-id',
        value: patient.nationalId || `MOH-KEN-${patient.id}`,
      },
      {
        system: 'http://seqoy.health/identifiers/mothers',
        value: String(patient.id),
      },
    ],
    active: true,
    name: [{ text: patient.name }],
    telecom: [{ system: 'phone', value: patient.phone, use: 'mobile' }],
    gender: 'female',
    extension: [
      {
        url: 'http://seqoy.health/fhir/StructureDefinition/gestational-age-weeks',
        valueInteger: patient.gestationalWeek,
      },
    ],
  };
}

/**
 * Transforms SEQOY Risk & Danger Score into an HL7 FHIR Observation
 */
export function toFHIRObservation(observation: {
  patientId: number | string;
  patientName: string;
  riskScore: number;
  triageLevel: string;
  symptoms: string[];
  recordedAt?: string;
}): FHIRObservation {
  return {
    resourceType: 'Observation',
    id: `obs-risk-${observation.patientId}-${Date.now()}`,
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'survey',
            display: 'Survey / Triage Risk Assessment',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '89208-3',
          display: 'Maternal Early Warning Triage Score',
        },
      ],
    },
    subject: {
      reference: `Patient/seqoy-patient-${observation.patientId}`,
      display: observation.patientName,
    },
    effectiveDateTime: observation.recordedAt || new Date().toISOString(),
    valueQuantity: {
      value: observation.riskScore,
      unit: '{score}',
      system: 'http://unitsofmeasure.org',
      code: '{score}',
    },
    valueString: observation.symptoms.join(', ') || 'No danger signs',
    interpretation: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: observation.riskScore >= 7 ? 'CRITICAL' : observation.riskScore >= 4 ? 'HIGH' : 'NORMAL',
            display: observation.triageLevel,
          },
        ],
      },
    ],
  };
}

/**
 * Transforms an Emergency Transfer Referral into an HL7 FHIR ServiceRequest
 */
export function toFHIRServiceRequest(referral: {
  id: string | number;
  referralCode: string;
  patientId: number | string;
  patientName: string;
  referringFacility: string;
  receivingFacility: string;
  clinicalIndication: string;
  urgencyLevel: string;
  dispatchedAt: string;
}): FHIRServiceRequest {
  return {
    resourceType: 'ServiceRequest',
    id: `req-transfer-${referral.id}`,
    identifier: [
      {
        system: 'http://seqoy.health/identifiers/referrals',
        value: referral.referralCode,
      },
    ],
    status: 'active',
    intent: 'order',
    priority: referral.urgencyLevel === 'CRITICAL_STAT' ? 'stat' : 'urgent',
    code: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '3457005',
          display: 'Patient referral for emergency obstetric care',
        },
      ],
    },
    subject: {
      reference: `Patient/seqoy-patient-${referral.patientId}`,
      display: referral.patientName,
    },
    requester: { display: referral.referringFacility },
    performer: [{ display: referral.receivingFacility }],
    reasonCode: [{ text: referral.clinicalIndication }],
    authoredOn: referral.dispatchedAt,
  };
}

/**
 * Generates an HL7 FHIR R4 Bundle containing the complete referral package
 * for automated ingestion by receiving HIMS.
 */
export function createFHIRReferralBundle(data: {
  patient: any;
  observation: any;
  serviceRequest: any;
}) {
  return {
    resourceType: 'Bundle',
    type: 'transaction',
    timestamp: new Date().toISOString(),
    entry: [
      {
        resource: toFHIRPatient(data.patient),
        request: { method: 'PUT', url: `Patient/seqoy-patient-${data.patient.id}` },
      },
      {
        resource: toFHIRObservation(data.observation),
        request: { method: 'POST', url: 'Observation' },
      },
      {
        resource: toFHIRServiceRequest(data.serviceRequest),
        request: { method: 'POST', url: 'ServiceRequest' },
      },
    ],
  };
}
