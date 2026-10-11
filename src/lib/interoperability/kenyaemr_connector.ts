/**
 * SEQOY to KenyaEMR / OpenMRS Interoperability Connector
 * 
 * Provides bi-directional REST Web Services and FHIR communication between
 * SEQOY Maternal Emergency Network and KenyaEMR (OpenMRS platform deployed across
 * 2,000+ public healthcare facilities in Kenya, supported by CDC / USAID / Palladium).
 * 
 * CIEL / OpenMRS Concept Mappings:
 * - 113054: Pre-eclampsia
 * - 118744: Eclampsia
 * - 230: Postpartum Hemorrhage
 * - 5622: Other Obstetric / Maternal Danger Sign
 * - 160085: Gestational Age in Weeks
 * - 5088: Systolic Blood Pressure
 * - 5087: Diastolic Blood Pressure
 */

export interface KenyaEMRConfig {
  baseUrl: string;       // e.g. "https://kenyaemr.hospital.go.ke:8443/openmrs"
  username?: string;
  password?: string;
  facilityMflCode: string; // Kenya Master Facility List (KMFL) Code e.g. "13023" (Pumwani)
}

export interface KenyaEMRPatientIdentifier {
  identifier: string;
  identifierType: string; // UUID for OpenMRS National ID or OpenMRS ID
  location: string;       // Location UUID
  preferred: boolean;
}

export interface KenyaEMREncounterPayload {
  encounterDatetime: string;
  patient: string;         // OpenMRS Patient UUID
  encounterType: string;   // "Maternity Triage / Referral" UUID
  location: string;        // Location UUID
  obs: Array<{
    concept: string;       // CIEL Concept UUID
    value: string | number | boolean;
  }>;
}

export class KenyaEMRConnector {
  private config: KenyaEMRConfig;

  constructor(config?: Partial<KenyaEMRConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || process.env.KENYAEMR_BASE_URL || "https://demo.kenyaemr.org/openmrs",
      username: config?.username || process.env.KENYAEMR_USERNAME || "admin",
      password: config?.password || process.env.KENYAEMR_PASSWORD || "Admin123",
      facilityMflCode: config?.facilityMflCode || process.env.FACILITY_MFL_CODE || "13023",
    };
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString("base64");
    return `Basic ${credentials}`;
  }

  /**
   * Searches for a patient in KenyaEMR by National ID or Phone Number
   */
  async searchPatient(query: string): Promise<any[]> {
    const url = `${this.config.baseUrl}/ws/rest/v1/patient?q=${encodeURIComponent(query)}&v=custom:(uuid,identifiers,person:(display,gender,age,birthdate))`;
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: this.getAuthHeader(),
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`KenyaEMR API returned ${res.status}`);
      }
      const data = await res.json();
      return data.results || [];
    } catch (e: any) {
      console.warn(`[KenyaEMRConnector] Patient lookup failed: ${e.message}`);
      return [];
    }
  }

  /**
   * Pushes a SEQOY maternal emergency referral encounter into KenyaEMR
   */
  async recordMaternalReferralEncounter(referral: {
    patientUuid: string;
    clinicalIndication: string;
    riskScore: number;
    gestationalWeeks: number;
    urgencyLevel: string;
  }): Promise<{ success: boolean; encounterUuid?: string; error?: string }> {
    const url = `${this.config.baseUrl}/ws/rest/v1/encounter`;
    
    // Construct CIEL observation array
    const obs = [
      {
        concept: "160085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", // Gestational age (CIEL 160085)
        value: referral.gestationalWeeks,
      },
      {
        concept: "5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", // Other maternal danger sign
        value: referral.clinicalIndication,
      },
    ];

    const payload = {
      encounterDatetime: new Date().toISOString(),
      patient: referral.patientUuid,
      encounterType: "d7151f82-c1f3-4215-9234-7ad01633534d", // Standard Emergency / Triage Encounter Type
      obs,
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `HTTP ${res.status}: ${errText}` };
      }

      const data = await res.json();
      return { success: true, encounterUuid: data.uuid };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Generates standard HL7 FHIR Observation resource for OpenMRS FHIR2 module
   */
  toOpenMRSFHIRObservation(patientUuid: string, dangerSign: string, score: number) {
    return {
      resourceType: "Observation",
      status: "final",
      code: {
        coding: [
          {
            system: "http://openmrs.org/concepts",
            code: "5622",
            display: "Maternal Danger Sign Alert",
          },
        ],
      },
      subject: {
        reference: `Patient/${patientUuid}`,
      },
      valueString: dangerSign,
      component: [
        {
          code: {
            coding: [{ system: "http://seqoy.health/cs/triage", code: "RISK_SCORE" }],
          },
          valueQuantity: {
            value: score,
            unit: "score",
          },
        },
      ],
    };
  }
}
