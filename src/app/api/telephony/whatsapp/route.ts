import { NextRequest, NextResponse } from "next/server";
import { extractSymptomsFromTranscript } from "@/lib/ai/extractSymptoms";
import * as patientsRepo from "@/db/repository/patients";
import * as checkinsRepo from "@/db/repository/checkins";
import { verifyTwilioSignature } from "@/lib/security/webhookAuth";

/**
 * WhatsApp Business webhook (Twilio) — the primary Delay-1 weekly channel.
 * Mothers reply in free text (Swahili or English); we extract danger signs
 * and log a check-in exactly like the voice/SMS channels.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let incomingBody = "";
    let fromNumber = "";
    let senderProfileName = "Mama";
    let rawParams: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      formData.forEach((value, key) => (rawParams[key] = String(value)));
      incomingBody = formData.get("Body")?.toString() || "";
      fromNumber = (formData.get("From")?.toString() || "").replace("whatsapp:", "");
      senderProfileName = formData.get("ProfileName")?.toString() || "Mama";
    } else {
      const json = await request.json();
      incomingBody = json?.body || json?.message?.text || "";
      fromNumber = (json?.from || "").replace("whatsapp:", "");
      senderProfileName = json?.profileName || "Mama";
    }

    if (!verifyTwilioSignature(request, rawParams)) {
      return NextResponse.json({ error: "Invalid Twilio signature" }, { status: 401 });
    }

    const patient = await patientsRepo.findPatientByPhone(fromNumber);
    const language = patient?.preferredLanguage === "ENGLISH" ? "ENGLISH" : "SWAHILI";
    const { symptoms, triage, extractedKeywords } = await extractSymptomsFromTranscript(incomingBody, language);

    if (patient) {
      await patientsRepo.updatePatientRiskState(patient.id, triage.riskLevel);
    }

    await checkinsRepo.createCheckin({
      patientId: patient?.id ?? null,
      reportedPhoneNumber: patient ? undefined : fromNumber,
      requiresPatientMatch: !patient,
      channel: "WHATSAPP",
      languageUsed: language,
      hasSevereHeadache: Boolean(symptoms.hasSevereHeadache),
      hasBlurredVision: Boolean(symptoms.hasBlurredVision),
      hasSevereSwelling: Boolean(symptoms.hasSevereSwelling),
      hasVaginalBleeding: Boolean(symptoms.hasVaginalBleeding),
      hasHighFever: Boolean(symptoms.hasHighFever),
      hasReducedFetalMovement: Boolean(symptoms.hasReducedFetalMovement),
      hasSevereAbdominalPain: Boolean(symptoms.hasSevereAbdominalPain),
      transcript: incomingBody,
      aiClinicalSummary: `[WhatsApp reply: ${extractedKeywords.join(", ") || "no danger signs reported"}] — ${triage.recommendedAction}`,
      triage,
    });

    let replyMessage = "";
    if (triage.riskLevel === "CRITICAL_EMERGENCY") {
      replyMessage =
        language === "ENGLISH"
          ? `URGENT: ${senderProfileName}, your symptoms need medical attention right away. Please go to your clinic now — your nurse has been notified.`
          : `TAHADHARI: ${senderProfileName}, dalili ulizotaja zinahitaji kuonwa na daktari mara moja. Tafadhali nenda kliniki yako sasa — mkunga wako ameshaarifiwa.`;
    } else {
      replyMessage =
        language === "ENGLISH"
          ? `Thank you ${senderProfileName}, your update has been recorded. Keep taking your iron/folic acid tablets.`
          : `Asante ${senderProfileName}, taarifa yako imepokelewa. Endelea kumeza vidonge vya madini ya chuma.`;
    }

    return NextResponse.json({
      success: true,
      sender: fromNumber,
      parsedSymptoms: symptoms,
      riskLevel: triage.riskLevel,
      replyMessage,
    });
  } catch (error: any) {
    console.error("Error handling WhatsApp webhook:", error);
    return NextResponse.json({ error: "Internal webhook error" }, { status: 500 });
  }
}
