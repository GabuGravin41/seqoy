// SEQOY MPDSR (Maternal and Perinatal Death Surveillance and Response) Analytics.
// Every figure here is derived from real audit log rows — nothing is a
// fabricated placeholder. When there isn't enough data yet, the report says
// so explicitly (`insufficientData`) instead of showing an invented number.

import { MPDSRAuditLog } from "@/db/mock-store";

export interface MPDSRReport {
  totalAudited: number;
  insufficientData: boolean;
  delay1IdentifiedRatePercent: number;
  delay3IdentifiedRatePercent: number;
  preventableRatePercent: number;
  averageDelay3Minutes: number | null;
  outcomeBreakdown: Record<string, number>;
}

export function generateCountyMPDSRReport(auditLogs: MPDSRAuditLog[] = []): MPDSRReport {
  const total = auditLogs.length;

  if (total === 0) {
    return {
      totalAudited: 0,
      insufficientData: true,
      delay1IdentifiedRatePercent: 0,
      delay3IdentifiedRatePercent: 0,
      preventableRatePercent: 0,
      averageDelay3Minutes: null,
      outcomeBreakdown: {},
    };
  }

  const delay1Count = auditLogs.filter((l) => l.delay1Factor).length;
  const delay3Count = auditLogs.filter((l) => l.delay3Factor).length;
  const preventableCount = auditLogs.filter((l) => l.wasPreventableDelayIdentified).length;

  const delay3Values = auditLogs
    .map((l) => l.delay3DurationMinutes)
    .filter((v): v is number => typeof v === "number" && v > 0);
  const averageDelay3Minutes =
    delay3Values.length > 0 ? Math.round(delay3Values.reduce((a, b) => a + b, 0) / delay3Values.length) : null;

  const outcomeBreakdown: Record<string, number> = {};
  for (const log of auditLogs) {
    outcomeBreakdown[log.clinicalOutcome] = (outcomeBreakdown[log.clinicalOutcome] ?? 0) + 1;
  }

  return {
    totalAudited: total,
    insufficientData: false,
    delay1IdentifiedRatePercent: Math.round((delay1Count / total) * 100),
    delay3IdentifiedRatePercent: Math.round((delay3Count / total) * 100),
    preventableRatePercent: Math.round((preventableCount / total) * 100),
    averageDelay3Minutes,
    outcomeBreakdown,
  };
}
