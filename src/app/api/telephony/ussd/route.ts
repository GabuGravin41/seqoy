import { NextRequest, NextResponse } from "next/server";
import { handleUSSDSession } from "@/lib/ussd/state-machine";
import { mockStore } from "@/db/mock-store";
import { evaluateClinicalRisk } from "@/lib/clinical/risk-scorer";

export async function POST(req: NextRequest) {
  try {
    let sessionId = "";
    let serviceCode = "";
    let phoneNumber = "";
    let text = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      sessionId = (formData.get("sessionId") as string) || "";
      serviceCode = (formData.get("serviceCode") as string) || "";
      phoneNumber = (formData.get("phoneNumber") as string) || "";
      text = (formData.get("text") as string) || "";
    } else {
      const body = await req.json();
      sessionId = body.sessionId || "";
      serviceCode = body.serviceCode || "";
      phoneNumber = body.phoneNumber || "";
      text = body.text || "";
    }

    const result = handleUSSDSession({
      sessionId,
      serviceCode,
      phoneNumber,
      text,
    });

    // If check-in is complete, save to records
    if (result.shouldSaveCheckin && result.triageData) {
      let patient = mockStore.patients.find((p) => p.phoneNumber === phoneNumber);
      if (!patient) {
        // Find by fallback or default
        patient = mockStore.patients[0];
      }

      const triage = evaluateClinicalRisk(result.triageData);

      // Update patient risk status
      patient.currentRiskLevel = triage.riskLevel;
      patient.lastCheckinAt = new Date().toISOString();

      mockStore.checkins.unshift({
        id: mockStore.checkins.length + 1,
        patientId: patient.id,
        channel: "USSD",
        languageUsed: result.triageData.language,
        hasSevereHeadache: result.triageData.hasSevereHeadache,
        hasBlurredVision: result.triageData.hasBlurredVision,
        hasSevereSwelling: result.triageData.hasSevereSwelling,
        hasVaginalBleeding: result.triageData.hasVaginalBleeding,
        hasHighFever: result.triageData.hasHighFever,
        hasReducedFetalMovement: result.triageData.hasReducedFetalMovement,
        hasSevereAbdominalPain: result.triageData.hasSevereAbdominalPain,
        riskScore: triage.riskScore,
        riskLevel: triage.riskLevel,
        suspectedCondition: triage.suspectedCondition,
        flaggedForImmediateReferral: triage.flaggedForImmediateReferral,
        createdAt: new Date().toISOString(),
      });
    }

    // Return plain text as required by Africa's Talking / Twilio USSD gateways
    return new NextResponse(result.response, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error: any) {
    console.error("USSD Webhook error:", error);
    return new NextResponse("END Samahani, hitilafu imetokea. / System error. Please try again.", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
