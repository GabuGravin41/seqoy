import { NextRequest, NextResponse } from "next/server";
import { extractSymptomsFromTranscript } from "@/lib/ai/extractSymptoms";
import * as patientsRepo from "@/db/repository/patients";
import * as checkinsRepo from "@/db/repository/checkins";
import * as capacitiesRepo from "@/db/repository/capacities";
import * as facilitiesRepo from "@/db/repository/facilities";
import { verifySharedSecret } from "@/lib/security/webhookAuth";
import { parseShiftCapacityMessage } from "@/lib/routing/shift-capacity-parser";
import { logAudit } from "@/lib/security/audit";

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, "");
}

/**
 * Africa's Talking inbound SMS webhook:
 * 1. Delay 3 shift capacity updates from registered hospital duty-station phones
 *    (e.g. "CAP ICU=2 THEATRE=READY ONEG=4" or "CAP STRIKE").
 * 2. Delay 1 symptom check-in replies from expectant mothers.
 */
export async function POST(req: NextRequest) {
  if (!verifySharedSecret(req, "SMS_WEBHOOK_SECRET")) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let fromNumber = "";
    let text = "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      fromNumber = (formData.get("from") as string) || "";
      text = (formData.get("text") as string) || "";
    } else {
      const body = await req.json();
      fromNumber = body.from || "";
      text = body.text || "";
    }

    // 1. Check if this is a hospital duty-station shift capacity update
    const shiftUpdate = parseShiftCapacityMessage(text);
    if (shiftUpdate.isShiftUpdate) {
      const normalizedFrom = normalizePhone(fromNumber);
      const [capacities, facilities] = await Promise.all([
        capacitiesRepo.listCapacities(),
        facilitiesRepo.listFacilities(),
      ]);

      const matchedCapacity = capacities.find(
        (c) => c.dutyStationWhatsappPhone && normalizePhone(c.dutyStationWhatsappPhone) === normalizedFrom
      );
      const matchedFacility = matchedCapacity
        ? facilities.find((f) => f.id === matchedCapacity.facilityId)
        : facilities.find((f) => f.isReferralCenter && normalizePhone(f.emergencyPhone) === normalizedFrom);

      if (!matchedFacility) {
        return NextResponse.json(
          { error: "Sender phone is not a registered hospital duty station" },
          { status: 403 }
        );
      }

      const updated = await capacitiesRepo.updateCapacity(matchedFacility.id, shiftUpdate.patch);
      await logAudit(
        { userId: `sms:${normalizedFrom}`, role: "BED_MANAGER" },
        "CAPACITY_SHIFT_SMS_UPDATE",
        "facility",
        String(matchedFacility.id),
        { summary: shiftUpdate.summary }
      );

      return NextResponse.json({
        success: true,
        type: "SHIFT_CAPACITY_UPDATE",
        facilityId: matchedFacility.id,
        facilityName: matchedFacility.name,
        summary: shiftUpdate.summary,
        lastUpdated: updated?.lastUpdated,
      });
    }

    const patient = await patientsRepo.findPatientByPhone(fromNumber);
    const language = patient?.preferredLanguage === "ENGLISH" ? "ENGLISH" : "SWAHILI";
    const { symptoms, triage, extractedKeywords } = await extractSymptomsFromTranscript(text, language);

    if (patient) {
      await patientsRepo.updatePatientRiskState(patient.id, triage.riskLevel);
    }

    await checkinsRepo.createCheckin({
      patientId: patient?.id ?? null,
      reportedPhoneNumber: patient ? undefined : fromNumber,
      requiresPatientMatch: !patient,
      channel: "SMS",
      languageUsed: language,
      hasSevereHeadache: Boolean(symptoms.hasSevereHeadache),
      hasBlurredVision: Boolean(symptoms.hasBlurredVision),
      hasSevereSwelling: Boolean(symptoms.hasSevereSwelling),
      hasVaginalBleeding: Boolean(symptoms.hasVaginalBleeding),
      hasHighFever: Boolean(symptoms.hasHighFever),
      hasReducedFetalMovement: Boolean(symptoms.hasReducedFetalMovement),
      hasSevereAbdominalPain: Boolean(symptoms.hasSevereAbdominalPain),
      transcript: text,
      aiClinicalSummary: `[SMS reply: ${extractedKeywords.join(", ") || "no danger signs reported"}] — ${triage.recommendedAction}`,
      triage,
    });

    return NextResponse.json({ success: true, riskLevel: triage.riskLevel, extractedKeywords });
  } catch (error: any) {
    console.error("Inbound SMS webhook error:", error);
    return NextResponse.json({ error: "Internal webhook error" }, { status: 500 });
  }
}
