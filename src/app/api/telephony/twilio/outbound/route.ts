import { NextRequest, NextResponse } from 'next/server';
import { triggerOutboundTriageCall } from '@/lib/telephony/twilio';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toPhoneNumber, patientId = '1', patientName = 'Mama Wanjiku', language = 'sw' } = body;

    if (!toPhoneNumber) {
      return NextResponse.json({ error: 'toPhoneNumber is required' }, { status: 400 });
    }

    const baseUrl = new URL(request.url).origin;
    const result = await triggerOutboundTriageCall({
      toPhoneNumber,
      patientId,
      patientName,
      language,
      baseUrl,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to initiate outbound call', details: error?.message },
      { status: 500 }
    );
  }
}
