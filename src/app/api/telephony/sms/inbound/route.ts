import { NextRequest, NextResponse } from "next/server";
import { extractSymptomsFromTranscript } from "@/lib/ai/extractSymptoms";
import * as patientsRepo from "@/db/repository/patients";
import * as checkinsRepo from "@/db/repository/checkins";
import { verifySharedSecret } from "@/lib/security/webhookAuth";

/**
 * Africa's Talking inbound SMS webhook — the reply half of the weekly Delay-1
 * message for mothers without WhatsApp. Posts as application/x-www-form-urlencoded
 * with `from` and `text` fields.
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
