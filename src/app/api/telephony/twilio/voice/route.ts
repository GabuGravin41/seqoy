import { NextRequest, NextResponse } from 'next/server';
import { generateVoiceCheckinTwiML } from '@/lib/telephony/twilio';
import * as patientsRepo from '@/db/repository/patients';
import { verifyTwilioSignature } from '@/lib/security/webhookAuth';

export async function POST(request: NextRequest) {
  const params: Record<string, string> = {};
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    formData.forEach((value, key) => {
      params[key] = String(value);
    });
  }

  if (!verifyTwilioSignature(request, params)) {
    return NextResponse.json({ error: 'Invalid Twilio signature' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId') || '1';
  const lang = (searchParams.get('lang') as 'sw' | 'en') || 'sw';
  const baseUrl = new URL(request.url).origin;

  const patient = await patientsRepo.getPatientById(Number(patientId));

  const twiml = generateVoiceCheckinTwiML({
    patientName: patient?.fullName ?? 'Mama',
    language: lang,
    baseUrl,
    patientId,
  });

  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}
