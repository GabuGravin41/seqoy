import { desc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { mockStore, MPDSRAuditLog } from "@/db/mock-store";
import { getReferralById } from "./referrals";
import { getPatientById } from "./patients";

type AuditRow = typeof schema.mpdsrAuditLogs.$inferSelect;

async function rowToAudit(row: AuditRow): Promise<MPDSRAuditLog> {
  const patient = row.patientId ? await getPatientById(row.patientId) : undefined;
  return {
    id: row.id,
    referralId: row.referralId ?? 0,
    patientId: row.patientId,
    patientName: patient?.fullName ?? "Unknown Patient",
    county: row.county,
    delay1DurationMinutes: row.delay1DurationMinutes ?? 0,
    delay3DurationMinutes: row.delay3DurationMinutes ?? 0,
    delay1Factor: row.delay1Factor ?? "",
    delay2Note: row.delay2Note ?? undefined,
    delay3Factor: row.delay3Factor ?? "",
    wasPreventableDelayIdentified: row.wasPreventableDelayIdentified,
    clinicalOutcome: row.clinicalOutcome,
    executiveAuditSummary: row.executiveAuditSummary,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listAuditLogs(): Promise<MPDSRAuditLog[]> {
  const db = getDb();
  if (!db) return mockStore.mpdsrLogs;
  const rows = await db.select().from(schema.mpdsrAuditLogs).orderBy(desc(schema.mpdsrAuditLogs.createdAt));
  return Promise.all(rows.map(rowToAudit));
}

export interface NewAuditInput {
  referralId?: number;
  patientId: number;
  county: string;
  delay1Identified: boolean;
  delay1Notes?: string;
  delay2Notes?: string; // optional manual note only; transport is not a product feature
  delay3Identified: boolean;
  delay3Notes?: string;
  clinicalOutcome: string;
  executiveAuditSummary: string;
}

/**
 * Real Delay 1 / Delay 3 durations, computed from the linked referral's
 * actual lifecycle timestamps when available — never a fabricated constant.
 * Delay 2 (transport) is out of product scope and never computed here.
 */
async function computeDelayDurations(referralId?: number) {
  if (!referralId) return { delay1: undefined, delay3: undefined };
  const referral = await getReferralById(referralId);
  if (!referral) return { delay1: undefined, delay3: undefined };

  const initiated = referral.initiatedAt ? new Date(referral.initiatedAt).getTime() : undefined;
  const acknowledged = referral.acknowledgedAt ? new Date(referral.acknowledgedAt).getTime() : undefined;
  const admitted = referral.admittedAt ? new Date(referral.admittedAt).getTime() : undefined;

  const minutes = (a?: number, b?: number) =>
    a !== undefined && b !== undefined ? Math.max(0, Math.round((b - a) / 60000)) : undefined;

  return {
    // Delay 1 (decision to seek care) isn't observable from referral
    // timestamps — it needs the check-in-to-referral gap, tracked separately
    // per patient, so it's left undefined here rather than invented.
    delay1: undefined,
    // Delay 3: time from the receiving facility acknowledging the referral
    // (i.e. confirming capacity) to the mother actually being admitted.
    delay3: minutes(acknowledged ?? initiated, admitted),
  };
}

export async function createAuditLog(input: NewAuditInput): Promise<MPDSRAuditLog> {
  const durations = await computeDelayDurations(input.referralId);
  const patient = await getPatientById(input.patientId);

  const base = {
    referralId: input.referralId,
    patientId: input.patientId,
    county: input.county,
    delay1DurationMinutes: durations.delay1,
    delay3DurationMinutes: durations.delay3,
    delay1Factor: input.delay1Notes,
    delay2Note: input.delay2Notes,
    delay3Factor: input.delay3Notes,
    wasPreventableDelayIdentified: input.delay1Identified || input.delay3Identified,
    clinicalOutcome: input.clinicalOutcome,
    executiveAuditSummary: input.executiveAuditSummary,
  };

  const db = getDb();
  if (!db) {
    const newAudit: MPDSRAuditLog = {
      id: mockStore.mpdsrLogs.length + 1,
      referralId: base.referralId ?? 0,
      patientId: base.patientId,
      patientName: patient?.fullName ?? "Unknown Patient",
      county: base.county,
      delay1DurationMinutes: base.delay1DurationMinutes ?? 0,
      delay3DurationMinutes: base.delay3DurationMinutes ?? 0,
      delay1Factor: base.delay1Factor ?? "",
      delay2Note: base.delay2Note,
      delay3Factor: base.delay3Factor ?? "",
      wasPreventableDelayIdentified: base.wasPreventableDelayIdentified,
      clinicalOutcome: base.clinicalOutcome,
      executiveAuditSummary: base.executiveAuditSummary,
      createdAt: new Date().toISOString(),
    };
    mockStore.mpdsrLogs.unshift(newAudit);
    return newAudit;
  }

  const [row] = await db.insert(schema.mpdsrAuditLogs).values(base).returning();
  return rowToAudit(row);
}
