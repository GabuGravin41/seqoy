/**
 * SEQOY Africa's Talking SMS Engine — the in-country channel for mothers
 * without WhatsApp. Kenyan USSD short codes and bulk SMS both run through
 * Africa's Talking (or a direct telco), not Twilio.
 */

import AfricasTalking from "africastalking";

const apiKey = process.env.AFRICASTALKING_API_KEY;
const username = process.env.AFRICASTALKING_USERNAME;
const shortCode = process.env.AFRICASTALKING_SHORTCODE;

const client = apiKey && username ? AfricasTalking({ apiKey, username }) : null;

export interface SendSMSResult {
  success: boolean;
  mode: "MOCK" | "LIVE";
  messageId?: string;
  status?: string;
  error?: string;
}

export async function sendSMS(toPhoneNumber: string, message: string): Promise<SendSMSResult> {
  if (!client) {
    console.log(`[Africa's Talking Mock SMS] To: ${toPhoneNumber} | Message: ${message}`);
    return { success: true, mode: "MOCK", messageId: `AT_MOCK_${Date.now()}`, status: "sent" };
  }

  try {
    const response = await client.SMS.send({
      to: [toPhoneNumber],
      message,
      from: shortCode,
    });
    const recipient = response?.SMSMessageData?.Recipients?.[0];
    return {
      success: true,
      mode: "LIVE",
      messageId: recipient?.messageId,
      status: recipient?.status,
    };
  } catch (error: any) {
    console.error("[Africa's Talking Error]", error);
    return { success: false, mode: "LIVE", error: error?.message || "Failed to send SMS" };
  }
}
