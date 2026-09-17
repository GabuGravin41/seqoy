import { NextRequest, NextResponse } from "next/server";
import { swahiliVoiceScript, englishVoiceScript } from "@/lib/voice/ai-agent";
import { extractSymptomsFromTranscript } from "@/lib/ai/extractSymptoms";
import * as patientsRepo from "@/db/repository/patients";
import * as checkinsRepo from "@/db/repository/checkins";
import { requirePermission } from "@/lib/rbac/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "SWAHILI";
  const script = lang.toUpperCase() === "ENGLISH" ? englishVoiceScript : swahiliVoiceScript;
  return NextResponse.json({ status: "ready", language: lang, script });
}

export async function POST(req: NextRequest) {
  // This endpoint is triggered from inside the app (PhoneDrawer / Simulator),
  // not by an external telco — real Twilio voice callbacks land on
  // /api/telephony/twilio/gather instead, which verifies Twilio's signature.
  const auth = await requirePermission("canViewAllPatients");
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { patientId, phoneNumber, transcript, language = "SWAHILI", systolicBp, diastolicBp } = body;

    if (!transcript) {
      return NextResponse.json({ error: "transcript is required for Voice AI parsing" }, { status: 400 });
    }

    const { symptoms, triage, extractedKeywords, method } = await extractSymptomsFromTranscript(
      transcript,
      language.toUpperCase() === "ENGLISH" ? "ENGLISH" : "SWAHILI"
    );

    if (systolicBp || diastolicBp) {
      symptoms.systolicBp = systolicBp;
      symptoms.diastolicBp = diastolicBp;
    }

    let patient = patientId ? await patientsRepo.getPatientById(Number(patientId)) : undefined;
    if (!patient && phoneNumber) patient = await patientsRepo.findPatientByPhone(phoneNumber);

    if (patient) {
      await patientsRepo.updatePatientRiskState(patient.id, triage.riskLevel);
      await patientsRepo.markCallFired(patient.id);
    }

    const checkin = await checkinsRepo.createCheckin({
      patientId: patient?.id ?? null,
      reportedPhoneNumber: patient ? undefined : phoneNumber,
      requiresPatientMatch: !patient,
      channel: "VOICE_AI",
      languageUsed: language.toUpperCase(),
      hasSevereHeadache: Boolean(symptoms.hasSevereHeadache),
      hasBlurredVision: Boolean(symptoms.hasBlurredVision),
      hasSevereSwelling: Boolean(symptoms.hasSevereSwelling),
      hasVaginalBleeding: Boolean(symptoms.hasVaginalBleeding),
      hasHighFever: Boolean(symptoms.hasHighFever),
      hasReducedFetalMovement: Boolean(symptoms.hasReducedFetalMovement),
      hasSevereAbdominalPain: Boolean(symptoms.hasSevereAbdominalPain),
      systolicBp: symptoms.systolicBp,
      diastolicBp: symptoms.diastolicBp,
      transcript,
      aiClinicalSummary: `[${method === "CLAUDE" ? "AI-extracted" : "Keyword-matched"}: ${extractedKeywords.join(", ") || "none"}] — ${triage.recommendedAction}`,
      triage,
    });

    return NextResponse.json({
      success: true,
      patient: patient ? { id: patient.id, name: patient.fullName, riskLevel: triage.riskLevel } : null,
      checkin,
      triage,
      extractedKeywords,
      extractionMethod: method,
    });
  } catch (error: any) {
    console.error("Voice AI Webhook error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
