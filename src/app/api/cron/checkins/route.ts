import { NextRequest, NextResponse } from "next/server";
import * as patientsRepo from "@/db/repository/patients";
import { triggerOutboundTriageCall, sendWhatsAppMessage } from "@/lib/telephony/twilio";
import { sendSMS } from "@/lib/telephony/africastalking";
import { getWeeklyMessage } from "@/lib/scheduling/weekly-content";

export const dynamic = "force-dynamic";

/**
 * Delay 1 scheduler — run this daily (e.g. Vercel Cron at a fixed hour).
 * Each mother has her own call cadence (default every 2 weeks, Saturday
 * 2PM, but configurable) and her own weekly WhatsApp/SMS cadence; this job
 * checks both independently instead of assuming everyone gets called on a
 * fixed global day.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized cron invocation" }, { status: 401 });
    }

    const baseUrl = new URL(request.url).origin;
    const now = new Date();

    const [dueForCall, dueForMessage] = await Promise.all([
      patientsRepo.listDueForCall(now),
      patientsRepo.listDueForWeeklyMessage(now),
    ]);

    const callResults = [];
    for (const mother of dueForCall) {
      const language = mother.preferredLanguage === "ENGLISH" ? "en" : "sw";
      const callResult = await triggerOutboundTriageCall({
        toPhoneNumber: mother.phoneNumber,
        patientName: mother.fullName,
        language,
        patientId: mother.id,
        baseUrl,
      });
      await patientsRepo.markCallFired(mother.id, now);
      callResults.push({ patientId: mother.id, patientName: mother.fullName, callStatus: callResult.mode, callSid: (callResult as any).callSid });
    }

    const messageResults = [];
    for (const mother of dueForMessage) {
      const language = mother.preferredLanguage === "ENGLISH" ? "ENGLISH" : "SWAHILI";
      const content = getWeeklyMessage(mother.gestationalWeeks, language);

      const result =
        mother.contactChannel === "WHATSAPP" && mother.whatsappNumber
          ? await sendWhatsAppMessage({ toPhoneNumber: mother.whatsappNumber, message: content })
          : await sendSMS(mother.phoneNumber, content);

      await patientsRepo.markWeeklyMessageFired(mother.id, now);
      messageResults.push({ patientId: mother.id, patientName: mother.fullName, channel: mother.contactChannel, status: result.mode });
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      callsQueued: callResults.length,
      messagesQueued: messageResults.length,
      calls: callResults,
      messages: messageResults,
    });
  } catch (error: any) {
    console.error("Error executing Delay-1 check-in cron:", error);
    return NextResponse.json({ error: "Failed to run scheduled check-ins", details: error?.message }, { status: 500 });
  }
}
