import { eq, desc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { mockStore, HealthCheckin } from "@/db/mock-store";
import { TriageResult } from "@/lib/clinical/risk-scorer";

function rowToCheckin(row: typeof schema.healthCheckins.$inferSelect): HealthCheckin {
  return {
    id: row.id,
    patientId: row.patientId,
    reportedPhoneNumber: row.reportedPhoneNumber ?? undefined,
    requiresPatientMatch: row.requiresPatientMatch,
    channel: row.channel as HealthCheckin["channel"],
    languageUsed: row.languageUsed,
    hasSevereHeadache: row.hasSevereHeadache ?? false,
    hasBlurredVision: row.hasBlurredVision ?? false,
    hasSevereSwelling: row.hasSevereSwelling ?? false,
    hasVaginalBleeding: row.hasVaginalBleeding ?? false,
    hasHighFever: row.hasHighFever ?? false,
    hasReducedFetalMovement: row.hasReducedFetalMovement ?? false,
    hasSevereAbdominalPain: row.hasSevereAbdominalPain ?? false,
    systolicBp: row.systolicBp ?? undefined,
    diastolicBp: row.diastolicBp ?? undefined,
    transcript: row.transcript ?? undefined,
    aiClinicalSummary: row.aiClinicalSummary ?? undefined,
    riskScore: row.riskScore,
    riskLevel: row.riskLevel as HealthCheckin["riskLevel"],
    suspectedCondition: (row.suspectedCondition as HealthCheckin["suspectedCondition"]) ?? undefined,
    flaggedForImmediateReferral: row.flaggedForImmediateReferral,
    createdAt: row.createdAt.toISOString(),
  };
}

export interface NewCheckinInput {
  patientId: number | null;
  reportedPhoneNumber?: string;
  requiresPatientMatch?: boolean;
  channel: HealthCheckin["channel"];
  languageUsed: string;
  hasSevereHeadache: boolean;
  hasBlurredVision: boolean;
  hasSevereSwelling: boolean;
  hasVaginalBleeding: boolean;
  hasHighFever: boolean;
  hasReducedFetalMovement: boolean;
  hasSevereAbdominalPain: boolean;
  systolicBp?: number;
  diastolicBp?: number;
  transcript?: string;
  aiClinicalSummary?: string;
  triage: TriageResult;
}

export async function listCheckinsForPatient(patientId: number): Promise<HealthCheckin[]> {
  const db = getDb();
  if (!db) return mockStore.checkins.filter((c) => c.patientId === patientId);
  const rows = await db
    .select()
    .from(schema.healthCheckins)
    .where(eq(schema.healthCheckins.patientId, patientId))
    .orderBy(desc(schema.healthCheckins.createdAt));
  return rows.map(rowToCheckin);
}

export async function listUnmatchedCheckins(): Promise<HealthCheckin[]> {
  const db = getDb();
  if (!db) return mockStore.checkins.filter((c) => c.requiresPatientMatch);
  const rows = await db
    .select()
    .from(schema.healthCheckins)
    .where(eq(schema.healthCheckins.requiresPatientMatch, true))
    .orderBy(desc(schema.healthCheckins.createdAt));
  return rows.map(rowToCheckin);
}

export async function createCheckin(input: NewCheckinInput): Promise<HealthCheckin> {
  const db = getDb();
  const base = {
    patientId: input.patientId,
    reportedPhoneNumber: input.reportedPhoneNumber,
    requiresPatientMatch: Boolean(input.requiresPatientMatch),
    channel: input.channel,
    languageUsed: input.languageUsed,
    hasSevereHeadache: input.hasSevereHeadache,
    hasBlurredVision: input.hasBlurredVision,
    hasSevereSwelling: input.hasSevereSwelling,
    hasVaginalBleeding: input.hasVaginalBleeding,
    hasHighFever: input.hasHighFever,
    hasReducedFetalMovement: input.hasReducedFetalMovement,
    hasSevereAbdominalPain: input.hasSevereAbdominalPain,
    systolicBp: input.systolicBp,
    diastolicBp: input.diastolicBp,
    transcript: input.transcript,
    aiClinicalSummary: input.aiClinicalSummary || input.triage.recommendedAction,
    riskScore: input.triage.riskScore,
    riskLevel: input.triage.riskLevel,
    suspectedCondition: input.triage.suspectedCondition,
    flaggedForImmediateReferral: input.triage.flaggedForImmediateReferral,
  };

  if (!db) {
    const newCheckin: HealthCheckin = {
      id: mockStore.checkins.length + 1,
      ...base,
      createdAt: new Date().toISOString(),
    };
    mockStore.checkins.unshift(newCheckin);
    return newCheckin;
  }

  const [row] = await db.insert(schema.healthCheckins).values(base).returning();
  return rowToCheckin(row);
}
