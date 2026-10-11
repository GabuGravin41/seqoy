import { NextRequest, NextResponse } from 'next/server';
import { createFHIRReferralBundle } from '@/lib/interoperability/fhir';
import * as referralsRepo from '@/db/repository/referrals';
import * as patientsRepo from '@/db/repository/patients';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const referralIdParam = searchParams.get('referralId');

  let referral;
  if (referralIdParam) {
    const id = parseInt(referralIdParam, 10);
    if (!isNaN(id)) {
      referral = await referralsRepo.getReferralById(id);
    }
  } else {
    // If no referralId provided, fetch the most recent referral
    const allReferrals = await referralsRepo.listReferrals();
    if (allReferrals.length > 0) {
      referral = allReferrals[allReferrals.length - 1];
    }
  }

  if (!referral) {
    return NextResponse.json(
      {
        error: 'Referral not found',
        message: 'No referral matching the provided ID was found in the database.',
      },
      { status: 404 }
    );
  }

  // Fetch patient record
  const patient = await patientsRepo.getPatientById(referral.patientId);
  const patientName = patient?.fullName || referral.patientName || 'Unknown Patient';
  const gestationalWeek = patient?.gestationalWeeks || 32;

  // Determine triage score and symptoms based on urgency
  const riskScore = referral.urgencyLevel === 'CRITICAL_STAT' ? 8.5 : referral.urgencyLevel === 'EMERGENCY' ? 6.5 : 4.0;
  const triageLevel = referral.urgencyLevel === 'CRITICAL_STAT' ? 'CRITICAL' : 'ELEVATED';
  const symptoms = referral.clinicalIndication ? [referral.clinicalIndication] : ['Maternal Danger Sign Alert'];

  const fhirBundle = createFHIRReferralBundle({
    patient: {
      id: referral.patientId,
      name: patientName,
      phone: patient?.phoneNumber || '+254700000000',
      gestationalWeek: gestationalWeek,
      nationalId: patient?.nationalId || `MOH-KEN-${referral.patientId}`,
    },
    observation: {
      patientId: referral.patientId,
      patientName: patientName,
      riskScore: riskScore,
      triageLevel: triageLevel,
      symptoms: symptoms,
    },
    serviceRequest: {
      id: referral.id,
      referralCode: referral.referralCode,
      patientId: referral.patientId,
      patientName: patientName,
      referringFacility: referral.referringFacilityName || 'Referring Primary Care Clinic',
      receivingFacility: referral.receivingFacilityName || 'Receiving Hospital',
      clinicalIndication: referral.clinicalIndication,
      urgencyLevel: referral.urgencyLevel,
      dispatchedAt: referral.initiatedAt,
    },
  });

  return NextResponse.json(fhirBundle, {
    headers: {
      'Content-Type': 'application/fhir+json; charset=utf-8',
      'X-Seqoy-Referral-Id': String(referral.id),
      'X-Seqoy-Referral-Code': referral.referralCode,
    },
  });
}
