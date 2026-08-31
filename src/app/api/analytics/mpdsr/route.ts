import { NextRequest, NextResponse } from 'next/server';
import { mockMpdsrAuditLogs, mockEmergencyReferrals } from '@/db/mock-store';
import { generateCountyMPDSRReport } from '@/lib/analytics/mpdsr';

export async function GET(request: NextRequest) {
  try {
    const report = generateCountyMPDSRReport(mockMpdsrAuditLogs);
    return NextResponse.json({
      report,
      recentAuditLogs: mockMpdsrAuditLogs.slice(0, 10),
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      referralId,
      patientId,
      clinicalIndication,
      delay1Identified = false,
      delay1Notes,
      delay2Identified = false,
      delay2Notes,
      delay3Identified = false,
      delay3Notes,
      finalOutcome = 'DISCHARGED_HEALTHY',
      preventableFactors = [],
      recommendations = [],
      auditedByNurse = 'Nurse Auditor',
    } = body;

    const newAudit = {
      id: mockMpdsrAuditLogs.length + 1,
      referralId: Number(referralId),
      patientId: Number(patientId),
      patientName: 'Enrolled Mother',
      county: 'Nairobi Region',
      delay1DurationMinutes: 15,
      delay2DurationMinutes: 20,
      delay3DurationMinutes: 5,
      delay1Factor: delay1Notes || 'Early Voice AI detection',
      delay2Factor: delay2Notes || 'Direct referral transfer',
      delay3Factor: delay3Notes || 'Pre-allocated bed and blood resources',
      wasPreventableDelayIdentified: Boolean(delay1Identified || delay2Identified || delay3Identified),
      clinicalOutcome: finalOutcome,
      executiveAuditSummary: recommendations.join('; ') || 'Standard MPDSR review conducted.',
      createdAt: new Date().toISOString(),
      delay1Identified: Boolean(delay1Identified),
      delay2Identified: Boolean(delay2Identified),
      delay3Identified: Boolean(delay3Identified),
    };

    mockMpdsrAuditLogs.unshift(newAudit as any);

    return NextResponse.json({
      success: true,
      message: `MPDSR Audit Log #${newAudit.id} saved successfully`,
      audit: newAudit,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
