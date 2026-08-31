import { NextRequest, NextResponse } from 'next/server';
import { generateVoiceCheckinTwiML } from '@/lib/telephony/twilio';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId') || '1';
  const lang = (searchParams.get('lang') as 'sw' | 'en') || 'sw';
  const baseUrl = new URL(request.url).origin;

  const twiml = generateVoiceCheckinTwiML({
    patientName: 'Mama Wanjiku',
    language: lang,
    baseUrl,
    patientId,
  });

  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}
