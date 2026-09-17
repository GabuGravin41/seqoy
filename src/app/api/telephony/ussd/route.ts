import { NextRequest, NextResponse } from "next/server";
import { handleUSSDSession } from "@/lib/ussd/state-machine";
import { evaluateClinicalRisk } from "@/lib/clinical/risk-scorer";
import * as patientsRepo from "@/db/repository/patients";
import * as checkinsRepo from "@/db/repository/checkins";
import { verifySharedSecretOrSession } from "@/lib/security/webhookAuth";

export async function POST(req: NextRequest) {
  if (!(await verifySharedSecretOrSession(req, "USSD_WEBHOOK_SECRET"))) {
    return new NextResponse("END Unauthorized", { status: 401, headers: { "Content-Type": "text/plain" } });
  }

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

    const result = handleUSSDSession({ sessionId, serviceCode, phoneNumber, text });

    if (result.scheduleUpdate) {
      const patient = await patientsRepo.findPatientByPhone(phoneNumber);
      if (patient) {
        await patientsRepo.updatePatientSchedule(patient.id, result.scheduleUpdate);
      }
    }

    // If check-in is complete, save to records — never attribute an unmatched
    // phone number to the wrong mother; record it as needing manual review instead.
    if (result.shouldSaveCheckin && result.triageData) {
      const patient = await patientsRepo.findPatientByPhone(phoneNumber);
      const triage = evaluateClinicalRisk(result.triageData);

      if (patient) {
        await patientsRepo.updatePatientRiskState(patient.id, triage.riskLevel);
      }

      await checkinsRepo.createCheckin({
        patientId: patient?.id ?? null,
        reportedPhoneNumber: patient ? undefined : phoneNumber,
        requiresPatientMatch: !patient,
        channel: "USSD",
        languageUsed: result.triageData.language,
        hasSevereHeadache: result.triageData.hasSevereHeadache,
        hasBlurredVision: result.triageData.hasBlurredVision,
        hasSevereSwelling: result.triageData.hasSevereSwelling,
        hasVaginalBleeding: result.triageData.hasVaginalBleeding,
        hasHighFever: result.triageData.hasHighFever,
        hasReducedFetalMovement: result.triageData.hasReducedFetalMovement,
        hasSevereAbdominalPain: result.triageData.hasSevereAbdominalPain,
        triage,
      });
    }

    // Plain text CON/END response, as required by Africa's Talking USSD gateways.
    return new NextResponse(result.response, { status: 200, headers: { "Content-Type": "text/plain" } });
  } catch (error: any) {
    console.error("USSD Webhook error:", error);
    return new NextResponse("END Samahani, hitilafu imetokea. / System error. Please try again.", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
