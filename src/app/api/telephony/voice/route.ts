import { NextRequest, NextResponse } from "next/server";
import { parseVoiceTranscription, swahiliVoiceScript, englishVoiceScript } from "@/lib/voice/ai-agent";
import { mockStore } from "@/db/mock-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "SWAHILI";
  const script = lang.toUpperCase() === "ENGLISH" ? englishVoiceScript : swahiliVoiceScript;

  return NextResponse.json({
    status: "ready",
    language: lang,
    script,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientId,
      phoneNumber,
      transcript,
      language = "SWAHILI",
      systolicBp,
      diastolicBp,
    } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: "transcript is required for Voice AI parsing" },
        { status: 400 }
      );
    }

    const { symptoms, triage, extractedKeywords } = parseVoiceTranscription(
      transcript,
      language.toUpperCase() === "ENGLISH" ? "ENGLISH" : "SWAHILI"
    );

    // If vitals provided, merge them
    if (systolicBp || diastolicBp) {
      symptoms.systolicBp = systolicBp;
      symptoms.diastolicBp = diastolicBp;
    }

    let patient = mockStore.patients.find(
      (p) => p.id === Number(patientId) || (phoneNumber && p.phoneNumber === phoneNumber)
    );

    if (!patient) {
      patient = mockStore.patients[0];
    }

    // Update patient clinical state
    patient.currentRiskLevel = triage.riskLevel;
    patient.lastCheckinAt = new Date().toISOString();

    const newCheckin = {
      id: mockStore.checkins.length + 1,
      patientId: patient.id,
      channel: "VOICE_AI" as const,
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
      aiClinicalSummary: `[Extracted Entities: ${extractedKeywords.join(", ")}] — ${triage.recommendedAction}`,
      riskScore: triage.riskScore,
      riskLevel: triage.riskLevel,
      suspectedCondition: triage.suspectedCondition,
      flaggedForImmediateReferral: triage.flaggedForImmediateReferral,
      createdAt: new Date().toISOString(),
    };

    mockStore.checkins.unshift(newCheckin);

    return NextResponse.json({
      success: true,
      patient: {
        id: patient.id,
        name: patient.fullName,
        riskLevel: patient.currentRiskLevel,
      },
      checkin: newCheckin,
      triage,
      extractedKeywords,
    });
  } catch (error: any) {
    console.error("Voice AI Webhook error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
