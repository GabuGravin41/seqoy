import { NextRequest, NextResponse } from 'next/server';
import { parseVoiceTranscription } from '@/lib/voice/ai-agent';
import { generateTriageResultTwiML, sendEmergencySMSAlert } from '@/lib/telephony/twilio';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const speechResult = (formData.get('SpeechResult') as string) || '';
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') as 'sw' | 'en') || 'sw';
    const patientId = searchParams.get('patientId') || '1';

    // 1. Parse speech transcript into clinical entities & evaluate risk
    const parsedData = parseVoiceTranscription(speechResult, lang === 'sw' ? 'SWAHILI' : 'ENGLISH');
    const { triage, extractedKeywords } = parsedData;

    // 2. If critical, trigger instant SMS to clinic midwife
    if (triage.flaggedForImmediateReferral || triage.riskLevel === 'CRITICAL_EMERGENCY') {
      await sendEmergencySMSAlert({
        toPhoneNumber: process.env.EMERGENCY_CLINIC_PHONE || '+254712345678',
        message: `🚨 SEQOY CRITICAL ALERT: Patient #${patientId} reported ${extractedKeywords.join(', ')} during Twilio check-in. Risk Score: ${triage.riskScore}/100. View referral at https://app.seqoy.health`,
      });
    }

    // 3. Return audio TwiML response to caller
    const twiml = generateTriageResultTwiML({
      riskLevel: triage.riskLevel,
      advice: triage.recommendedAction,
      language: lang,
    });

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error: any) {
    const twiml = generateTriageResultTwiML({
      riskLevel: 'NORMAL',
      advice: 'Routine check-in logged.',
      language: 'sw',
    });
    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
