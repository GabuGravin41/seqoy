import { NextRequest, NextResponse } from 'next/server';
import { createFHIRReferralBundle } from '@/lib/interoperability/fhir';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const referralId = searchParams.get('referralId') || '1';

  // Sample referral bundle
  const sampleBundle = createFHIRReferralBundle({
    patient: {
      id: 1,
      name: 'Wanjiku Muthoni',
      phone: '+254712345678',
      gestationalWeek: 34,
      nationalId: '33190822',
    },
    observation: {
      patientId: 1,
      patientName: 'Wanjiku Muthoni',
      riskScore: 7.8,
      triageLevel: 'CRITICAL',
      symptoms: ['Severe Headache', 'Scotoma', 'Bilateral Edema'],
    },
    serviceRequest: {
      id: referralId,
      referralCode: 'SEQ-REF-2026-001',
      patientId: 1,
      patientName: 'Wanjiku Muthoni',
      referringFacility: 'Kangemi Health Centre',
      receivingFacility: 'Pumwani Maternity Hospital',
      clinicalIndication: 'Imminent Eclampsia / Severe Preeclampsia',
      urgencyLevel: 'CRITICAL_STAT',
      dispatchedAt: new Date().toISOString(),
    },
  });

  return NextResponse.json(sampleBundle, {
    headers: {
      'Content-Type': 'application/fhir+json; charset=utf-8',
    },
  });
}
