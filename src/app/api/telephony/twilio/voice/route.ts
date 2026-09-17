import { NextRequest, NextResponse } from 'next/server';
import { generateVoiceCheckinTwiML } from '@/lib/telephony/twilio';
import * as patientsRepo from '@/db/repository/patients';

export async function POST(request: NextRequest) {
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
