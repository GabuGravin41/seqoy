import { NextRequest, NextResponse } from "next/server";
import { mockStore, HealthCheckin } from "@/db/mock-store";
import { evaluateClinicalRisk } from "@/lib/clinical/risk-scorer";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const patientId = Number(params.id);
  const checkins = mockStore.checkins.filter((c) => c.patientId === patientId);

  return NextResponse.json({
    patientId,
    total: checkins.length,
    checkins,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = Number(params.id);
    const patient = mockStore.patients.find((p) => p.id === patientId);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      channel = "IN_PERSON",
      languageUsed = patient.preferredLanguage,
      hasSevereHeadache = false,
      hasBlurredVision = false,
      hasSevereSwelling = false,
      hasVaginalBleeding = false,
      hasHighFever = false,
      hasReducedFetalMovement = false,
      hasSevereAbdominalPain = false,
      systolicBp,
      diastolicBp,
      transcript,
      aiClinicalSummary,
    } = body;

    const triage = evaluateClinicalRisk({
      hasSevereHeadache,
      hasBlurredVision,
      hasSevereSwelling,
      hasVaginalBleeding,
      hasHighFever,
      hasReducedFetalMovement,
      hasSevereAbdominalPain,
      systolicBp,
      diastolicBp,
      gestationalWeeks: patient.gestationalWeeks,
    });

    // Update patient current risk state
    patient.currentRiskLevel = triage.riskLevel;
    patient.lastCheckinAt = new Date().toISOString();

    const newCheckin: HealthCheckin = {
      id: mockStore.checkins.length + 1,
      patientId,
      channel: channel as any,
      languageUsed,
      hasSevereHeadache,
      hasBlurredVision,
      hasSevereSwelling,
      hasVaginalBleeding,
      hasHighFever,
      hasReducedFetalMovement,
      hasSevereAbdominalPain,
      systolicBp,
      diastolicBp,
      transcript,
      aiClinicalSummary: aiClinicalSummary || triage.recommendedAction,
      riskScore: triage.riskScore,
      riskLevel: triage.riskLevel,
      suspectedCondition: triage.suspectedCondition,
      flaggedForImmediateReferral: triage.flaggedForImmediateReferral,
      createdAt: new Date().toISOString(),
    };

    mockStore.checkins.unshift(newCheckin);

    return NextResponse.json({
      success: true,
      checkin: newCheckin,
      triage,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to log checkin" }, { status: 500 });
  }
}
