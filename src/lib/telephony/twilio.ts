/**
 * SEQOY Twilio Voice & SMS Telephony Engine
 * Programmatic voice calls, Swahili/English speech gathering, and emergency SMS alerts.
 */

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+12025550199';

// Initialize client if credentials present, otherwise provide safe mock mode
export const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

export interface OutboundCallRequest {
  toPhoneNumber: string;
  patientId: number | string;
  patientName: string;
  language?: 'sw' | 'en';
  baseUrl?: string;
}

/**
 * Triggers an automated outbound Voice AI check-in call to an expectant mother
 */
export async function triggerOutboundTriageCall({
  toPhoneNumber,
  patientId,
  patientName,
  language = 'sw',
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.seqoy.health',
}: OutboundCallRequest) {
  const webhookUrl = `${baseUrl}/api/telephony/twilio/voice?patientId=${patientId}&lang=${language}`;

  if (!twilioClient) {
    console.log(`[Twilio Mock Call] Initiated call to ${toPhoneNumber} for ${patientName} (${language})`);
    return {
      success: true,
      mode: 'MOCK',
      callSid: `CA_MOCK_${Date.now()}`,
      status: 'queued',
      to: toPhoneNumber,
      webhookUrl,
      message: 'Simulated outbound call queued (set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.local for live network calls)',
    };
  }

  try {
    const call = await twilioClient.calls.create({
      to: toPhoneNumber,
      from: twilioPhoneNumber,
      url: webhookUrl,
      method: 'POST',
      statusCallback: `${baseUrl}/api/telephony/twilio/status`,
      statusCallbackEvent: ['completed', 'failed', 'busy', 'no-answer'],
    });

    return {
      success: true,
      mode: 'LIVE',
      callSid: call.sid,
      status: call.status,
      to: toPhoneNumber,
    };
  } catch (error: any) {
    console.error('[Twilio Error]', error);
    return {
      success: false,
      error: error?.message || 'Failed to initiate Twilio call',
    };
  }
}

/**
 * Sends an urgent SMS notification to a clinic midwife or family member
 */
export async function sendEmergencySMSAlert({
  toPhoneNumber,
  message,
}: {
  toPhoneNumber: string;
  message: string;
}) {
  if (!twilioClient) {
    console.log(`[Twilio Mock SMS] To: ${toPhoneNumber} | Message: ${message}`);
    return {
      success: true,
      mode: 'MOCK',
      messageSid: `SM_MOCK_${Date.now()}`,
      status: 'sent',
    };
  }

  try {
    const sms = await twilioClient.messages.create({
      body: message,
      to: toPhoneNumber,
      from: twilioPhoneNumber,
    });

    return {
      success: true,
      mode: 'LIVE',
      messageSid: sms.sid,
      status: sms.status,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to send SMS',
    };
  }
}

/**
 * Generates TwiML for maternal voice check-in with speech recognition
 */
export function generateVoiceCheckinTwiML({
  patientName,
  language = 'sw',
  baseUrl = '',
  patientId = '1',
}: {
  patientName: string;
  language?: 'sw' | 'en';
  baseUrl?: string;
  patientId?: number | string;
}) {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  const gatherAction = `${baseUrl}/api/telephony/twilio/gather?patientId=${patientId}&lang=${language}`;

  if (language === 'sw') {
    const gather = response.gather({
      input: ['speech'],
      action: gatherAction,
      method: 'POST',
      language: 'sw-KE',
      timeout: 5,
      speechTimeout: 'auto',
    });

    gather.say(
      { voice: 'Polly.Astrid', language: 'sv-SE' },
      `Habari ${patientName}. Hii ni huduma ya SEQOY kutoka kliniki yako. Tafadhali tueleze unavyohisi leo. Je, una maumivu ya kichwa, kutokwa na damu, au mtoto hachezi vizuri?`
    );

    // If mother doesn't speak in 5s
    response.say('Samahani hatukusikia. Tafadhali piga simu tena au tembelea kliniki yako mara moja.');
  } else {
    const gather = response.gather({
      input: ['speech'],
      action: gatherAction,
      method: 'POST',
      language: 'en-US',
      timeout: 5,
      speechTimeout: 'auto',
    });

    gather.say(
      `Hello ${patientName}. This is SEQOY maternal health check-in. Please describe how you are feeling today. Do you have a severe headache, vision blurriness, bleeding, or decreased fetal movement?`
    );

    response.say('We did not receive any input. Please call your clinic or emergency contact immediately.');
  }

  return response.toString();
}

/**
 * Generates TwiML response after speech parsing
 */
export function generateTriageResultTwiML({
  riskLevel,
  advice,
  language = 'sw',
}: {
  riskLevel: string;
  advice: string;
  language?: 'sw' | 'en';
}) {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  if (riskLevel === 'CRITICAL_EMERGENCY' || riskLevel === 'HIGH_RISK') {
    response.say(
      language === 'sw'
        ? `Asante. Tumetambua dalili za hatari. Mkunga wako wa kliniki amearifiwa mara moja. Tafadhali pumzika, usafiri wa dharura unaandaliwa sasa.`
        : `Thank you. We have detected critical danger signs. Your clinic nurse has been notified immediately. Please rest while emergency transfer is coordinated.`
    );
  } else {
    response.say(
      language === 'sw'
        ? `Asante kwa taarifa yako. Hali yako inaendelea vizuri. Kumbuka kuhudhuria kliniki ya ANC kama ilivyopangwa.`
        : `Thank you. Your antenatal vitals are stable. Please remember your scheduled ANC appointment.`
    );
  }

  response.hangup();
  return response.toString();
}
