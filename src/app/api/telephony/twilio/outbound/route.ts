import { NextRequest, NextResponse } from 'next/server';
import { triggerOutboundTriageCall } from '@/lib/telephony/twilio';
import * as patientsRepo from '@/db/repository/patients';
import { requirePermission } from '@/lib/rbac/server';

export async function POST(request: NextRequest) {
  const auth = await requirePermission('canViewAllPatients');
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { toPhoneNumber, patientId, language = 'sw' } = body;

    if (!toPhoneNumber) {
      return NextResponse.json({ error: 'toPhoneNumber is required' }, { status: 400 });
    }

    const patient = patientId ? await patientsRepo.getPatientById(Number(patientId)) : undefined;
    const baseUrl = new URL(request.url).origin;
    const result = await triggerOutboundTriageCall({
      toPhoneNumber,
      patientId: patient?.id ?? patientId ?? '1',
      patientName: patient?.fullName ?? 'Mama',
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
