import { NextRequest, NextResponse } from 'next/server';
import { handleHIMSAdmissionWebhook } from '@/lib/interoperability/adapters';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facilityMflCode = '13044', eventType = 'PATIENT_ADMITTED', wardType = 'ICU', patientId = 'P-991' } = body;

    const result = handleHIMSAdmissionWebhook({
      facilityMflCode,
      eventType,
      wardType,
      patientId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Invalid webhook payload', details: error?.message },
      { status: 400 }
    );
  }
}
