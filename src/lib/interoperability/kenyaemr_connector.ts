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
  encounterTypeUuid?: string;
  gestationalAgeConceptUuid?: string;
  dangerSignConceptUuid?: string;
  timeoutMs?: number;
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

const DEFAULT_ENCOUNTER_TYPE_UUID = "d7151f82-c1f3-4215-9234-7ad01633534d";
const DEFAULT_GESTATIONAL_AGE_CONCEPT = "160085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const DEFAULT_DANGER_SIGN_CONCEPT = "5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export class KenyaEMRConnector {
  private config: KenyaEMRConfig;

  constructor(config?: Partial<KenyaEMRConfig>) {
    this.config = {
      baseUrl: (config?.baseUrl || process.env.KENYAEMR_BASE_URL || "").replace(/\/+$/, ""),
      username: config?.username || process.env.KENYAEMR_USERNAME,
      password: config?.password || process.env.KENYAEMR_PASSWORD,
      facilityMflCode: config?.facilityMflCode || process.env.FACILITY_MFL_CODE || "",
      encounterTypeUuid:
        config?.encounterTypeUuid ||
        process.env.KENYAEMR_ENCOUNTER_TYPE_UUID ||
        DEFAULT_ENCOUNTER_TYPE_UUID,
      gestationalAgeConceptUuid:
        config?.gestationalAgeConceptUuid ||
        process.env.KENYAEMR_GESTATIONAL_AGE_CONCEPT ||
        DEFAULT_GESTATIONAL_AGE_CONCEPT,
      dangerSignConceptUuid:
        config?.dangerSignConceptUuid ||
        process.env.KENYAEMR_DANGER_SIGN_CONCEPT ||
        DEFAULT_DANGER_SIGN_CONCEPT,
      timeoutMs: config?.timeoutMs ?? 10000,
    };
  }

  /**
   * Returns true only when an explicit KenyaEMR endpoint and credentials are
   * configured. Never falls back to default admin/Admin123 demo credentials.
   */
  isConfigured(): boolean {
    return Boolean(this.config.baseUrl && this.config.username && this.config.password);
  }

  private getAuthHeader(): string {
    if (!this.isConfigured()) {
      throw new Error("KenyaEMRConnector is not configured (set KENYAEMR_BASE_URL, KENYAEMR_USERNAME, KENYAEMR_PASSWORD)");
    }
    const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString("base64");
    return `Basic ${credentials}`;
  }

  /**
   * Searches for a patient in KenyaEMR by National ID or Phone Number
   */
  async searchPatient(query: string): Promise<any[]> {
    if (!this.isConfigured()) {
      console.warn("[KenyaEMRConnector] Skipping patient lookup: connector not configured.");
      return [];
    }
    const url = `${this.config.baseUrl}/ws/rest/v1/patient?q=${encodeURIComponent(query)}&v=custom:(uuid,identifiers,person:(display,gender,age,birthdate))`;
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: this.getAuthHeader(),
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(this.config.timeoutMs ?? 10000),
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
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "KenyaEMR connector not configured (missing KENYAEMR_BASE_URL or credentials)",
      };
    }

    const url = `${this.config.baseUrl}/ws/rest/v1/encounter`;

    // Construct CIEL observation array (UUIDs overridable per facility instance)
    const obs = [
      {
        concept: this.config.gestationalAgeConceptUuid || DEFAULT_GESTATIONAL_AGE_CONCEPT,
        value: referral.gestationalWeeks,
      },
      {
        concept: this.config.dangerSignConceptUuid || DEFAULT_DANGER_SIGN_CONCEPT,
        value: referral.clinicalIndication,
      },
    ];

    const payload = {
      encounterDatetime: new Date().toISOString(),
      patient: referral.patientUuid,
      encounterType: this.config.encounterTypeUuid || DEFAULT_ENCOUNTER_TYPE_UUID,
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
        signal: AbortSignal.timeout(this.config.timeoutMs ?? 10000),
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
