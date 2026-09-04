import { NextRequest, NextResponse } from 'next/server';
import { initialPatients } from '@/db/mock-store';
import { triggerOutboundTriageCall } from '@/lib/telephony/twilio';

export const dynamic = 'force-dynamic';

/**
 * Vercel Cron or External Scheduler Endpoint
 * Scheduled to run every Saturday at 14:00 EAT (11:00 UTC)
 * Cron Expression: "0 11 * * 6"
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If a cron secret is configured, verify it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized cron invocation' }, { status: 401 });
    }

    // Filter active expectant mothers eligible for routine Saturday check-in
    const eligibleMothers = initialPatients.filter(
      (p) => p.gestationalWeeks >= 16 && p.gestationalWeeks <= 42
    );

    const callDispatches = [];

    for (const mother of eligibleMothers) {
      const language = mother.preferredLanguage === 'ENGLISH' ? 'en' : 'sw';
      const callResult = await triggerOutboundTriageCall({
        toPhoneNumber: mother.phoneNumber,
        patientName: mother.fullName,
        language: language,
        patientId: mother.id,
      });

      callDispatches.push({
        patientId: mother.id,
        patientName: mother.fullName,
        phoneNumber: mother.phoneNumber,
        gestationalWeek: mother.gestationalWeeks,
        callStatus: callResult.mode,
        callSid: callResult.callSid,
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cronJob: 'SATURDAY_MATERNAL_VOICE_CHECKIN',
      scheduledTime: 'Saturday 14:00 EAT',
      totalMothersQueued: eligibleMothers.length,
      dispatches: callDispatches,
    });
  } catch (error: any) {
    console.error('Error executing Saturday maternal call cron:', error);
    return NextResponse.json(
      { error: 'Failed to dispatch Saturday voice check-in batch', details: error?.message },
      { status: 500 }
    );
  }
}
