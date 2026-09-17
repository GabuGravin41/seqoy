/**
 * SEQOY Delay-3 facility readiness integration.
 *
 * There is no live connection to any named hospital EHR vendor yet — that
 * requires an actual data-sharing agreement per facility. What this module
 * provides is the real, working mechanism a facility's EHR/HIMS can push
 * bed/theatre updates through (an HL7 FHIR-shaped webhook), plus the honest
 * fallback every facility has from day one: a manual update screen a bed
 * manager uses directly. Per-facility sync status (HospitalCapacity.syncMode)
 * reflects which one is actually in use — never a blanket "connected" claim.
 */

import * as capacitiesRepo from "@/db/repository/capacities";

export interface HIMSAdmissionWebhookPayload {
  facilityId: number;
  eventType: "PATIENT_ADMITTED" | "PATIENT_DISCHARGED";
  wardType: "ICU" | "HDU" | "MATERNITY";
}

/**
 * Applies a hospital's admission/discharge webhook to the live capacity
 * board — this actually decrements/increments the bed count referring
 * clinics see, not just a description of what would happen.
 */
export async function handleHIMSAdmissionWebhook(payload: HIMSAdmissionWebhookPayload) {
  const delta = payload.eventType === "PATIENT_ADMITTED" ? -1 : 1;
  const capacity = await capacitiesRepo.adjustBed(payload.facilityId, payload.wardType, delta);

  if (!capacity) {
    return {
      success: false,
      message: `No capacity record found for facility ${payload.facilityId}`,
    };
  }

  return {
    success: true,
    message: `${payload.eventType} applied to ${payload.wardType} ward.`,
    facilityId: payload.facilityId,
    ward: payload.wardType,
    delta,
    capacity,
    processedAt: new Date().toISOString(),
  };
}

/**
 * Generates a DHIS2 / KHIS2 DataValueSets payload shape for MoH reporting.
 * This is a data transformer only — actually submitting it requires a real
 * KHIS2 org-unit account and API credentials, which is a partnership/business
 * step, not something this function claims to have already done.
 */
export function generateKHIS2Payload(report: {
  orgUnitMfl: string;
  period: string; // e.g. "202608"
  auditsCount: number;
  delay1IdentifiedCount: number;
  delay3IdentifiedCount: number;
}) {
  return {
    dataSet: "MOH_711_RH_SURVEILLANCE",
    completeDate: new Date().toISOString().split("T")[0],
    orgUnit: report.orgUnitMfl,
    period: report.period,
    dataValues: [
      { dataElement: "MOH711_MPDSR_TOTAL_AUDITED", value: String(report.auditsCount) },
      { dataElement: "MOH711_MPDSR_DELAY1_DECISION", value: String(report.delay1IdentifiedCount) },
      { dataElement: "MOH711_MPDSR_DELAY3_QUALITY_CARE", value: String(report.delay3IdentifiedCount) },
    ],
  };
}
