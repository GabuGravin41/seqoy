import { NextRequest, NextResponse } from "next/server";
import { extractSymptomsFromTranscript } from "@/lib/ai/extractSymptoms";
import { generateTriageResultTwiML, sendEmergencySMSAlert } from "@/lib/telephony/twilio";
import * as patientsRepo from "@/db/repository/patients";
import * as checkinsRepo from "@/db/repository/checkins";
import { verifyTwilioSignature } from "@/lib/security/webhookAuth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const rawParams: Record<string, string> = {};
    formData.forEach((value, key) => (rawParams[key] = String(value)));

    if (!verifyTwilioSignature(request, rawParams)) {
      return NextResponse.json({ error: "Invalid Twilio signature" }, { status: 401 });
    }

    const speechResult = (formData.get("SpeechResult") as string) || "";
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get("lang") as "sw" | "en") || "sw";
    const patientIdParam = searchParams.get("patientId");
    const language = lang === "sw" ? "SWAHILI" : "ENGLISH";

    const { symptoms, triage, extractedKeywords } = await extractSymptomsFromTranscript(speechResult, language);

    const patient = patientIdParam ? await patientsRepo.getPatientById(Number(patientIdParam)) : undefined;
    if (patient) {
      await patientsRepo.updatePatientRiskState(patient.id, triage.riskLevel);
      await patientsRepo.markCallFired(patient.id);
    }

    await checkinsRepo.createCheckin({
      patientId: patient?.id ?? null,
      reportedPhoneNumber: patient ? undefined : undefined,
      requiresPatientMatch: !patient,
      channel: "VOICE_AI",
      languageUsed: language,
      hasSevereHeadache: Boolean(symptoms.hasSevereHeadache),
      hasBlurredVision: Boolean(symptoms.hasBlurredVision),
      hasSevereSwelling: Boolean(symptoms.hasSevereSwelling),
      hasVaginalBleeding: Boolean(symptoms.hasVaginalBleeding),
      hasHighFever: Boolean(symptoms.hasHighFever),
      hasReducedFetalMovement: Boolean(symptoms.hasReducedFetalMovement),
      hasSevereAbdominalPain: Boolean(symptoms.hasSevereAbdominalPain),
      transcript: speechResult,
      aiClinicalSummary: `[Call: ${extractedKeywords.join(", ") || "none"}] — ${triage.recommendedAction}`,
      triage,
    });

    if (triage.flaggedForImmediateReferral || triage.riskLevel === "CRITICAL_EMERGENCY") {
      await sendEmergencySMSAlert({
        toPhoneNumber: process.env.EMERGENCY_CLINIC_PHONE || "+254712345678",
        message: `SEQOY CRITICAL ALERT: ${patient?.fullName ?? "A mother"} reported ${extractedKeywords.join(", ")} during a scheduled check-in call. Risk score: ${triage.riskScore}/100.`,
      });
    }

    const twiml = generateTriageResultTwiML({
      riskLevel: triage.riskLevel,
      advice: triage.recommendedAction,
      language: lang,
    });

    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  } catch (error: any) {
    console.error("Twilio gather webhook error:", error);
    const twiml = generateTriageResultTwiML({ riskLevel: "NORMAL", advice: "Routine check-in logged.", language: "sw" });
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }
}
