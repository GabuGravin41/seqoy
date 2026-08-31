import { NextRequest, NextResponse } from 'next/server';
import { mockEmergencyReferrals, mockFacilities } from '@/db/mock-store';
import { dispatchEmergencyAmbulance } from '@/lib/transport/dispatch';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      referringFacilityId,
      receivingFacilityId,
      clinicalIndication,
      urgencyLevel = 'CRITICAL_STAT',
      icuBedReserved = false,
      theatreReserved = false,
      bloodUnitsReserved = 0,
    } = body;

    if (!patientId || !referringFacilityId || !receivingFacilityId || !clinicalIndication) {
      return NextResponse.json(
        { error: 'Missing required parameters (patientId, referringFacilityId, receivingFacilityId, clinicalIndication)' },
        { status: 400 }
      );
    }

    const referringFacility = mockFacilities.find((f) => f.id === Number(referringFacilityId));
    const receivingFacility = mockFacilities.find((f) => f.id === Number(receivingFacilityId));

    if (!referringFacility || !receivingFacility) {
      return NextResponse.json({ error: 'Referring or receiving facility not found' }, { status: 404 });
    }

    // 1. Dispatch emergency ambulance
    const dispatchResult = await dispatchEmergencyAmbulance({
      referralId: mockEmergencyReferrals.length + 1,
      referringFacilityId: referringFacility.id,
      referringFacilityName: referringFacility.name,
      receivingFacilityId: receivingFacility.id,
      receivingFacilityName: receivingFacility.name,
      patientName: 'Enrolled Mother',
      clinicalIndication,
      urgencyLevel,
    });

    // 2. Create emergency referral record
    const referralCode = `SEQ-REF-${new Date().getFullYear()}-${String(mockEmergencyReferrals.length + 1).padStart(3, '0')}`;
    const newReferral = {
      id: mockEmergencyReferrals.length + 1,
      referralCode,
      patientId: Number(patientId),
      referringFacilityId: referringFacility.id,
      receivingFacilityId: receivingFacility.id,
      urgencyLevel: urgencyLevel as any,
      clinicalIndication,
      icuBedReserved: Boolean(icuBedReserved),
      theatreReserved: Boolean(theatreReserved),
      bloodUnitsReserved: Number(bloodUnitsReserved),
      bloodTypeReserved: 'O-',
      transportDispatchId: dispatchResult.dispatchId,
      ambulanceCallSign: dispatchResult.ambulanceCallSign,
      estimatedTransitMinutes: dispatchResult.estimatedArrivalMinutes,
      transportTrackingUrl: dispatchResult.liveTrackingUrl,
      status: 'IN_TRANSIT' as const,
      preArrivalHandoverNote: `Emergency referral for ${clinicalIndication}`,
      initiatedAt: new Date().toISOString(),
      ambulanceDispatchedAt: new Date().toISOString(),
    };

    mockEmergencyReferrals.unshift(newReferral as any);

    return NextResponse.json({
      success: true,
      message: `Emergency referral ${referralCode} dispatched to ${receivingFacility.name}`,
      referral: newReferral,
      transport: dispatchResult,
    });
  } catch (error: any) {
    console.error('Dispatch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
