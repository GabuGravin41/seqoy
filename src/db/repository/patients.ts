import { eq, lte } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { mockStore, Patient } from "@/db/mock-store";
import { computeInitialSchedule, advanceCallSchedule, advanceWeeklyMessageSchedule } from "@/lib/scheduling/checkin-schedule";

function rowToPatient(row: typeof schema.patients.$inferSelect): Patient {
  return {
    id: row.id,
    nationalId: row.nationalId ?? undefined,
    fullName: row.fullName,
    phoneNumber: row.phoneNumber,
    age: row.age,
    gravida: row.gravida,
    parity: row.parity,
    gestationalWeeks: row.gestationalWeeks,
    estimatedDeliveryDate: row.estimatedDeliveryDate ?? "",
    bloodType: row.bloodType,
    preferredLanguage: row.preferredLanguage as Patient["preferredLanguage"],
    primaryFacilityId: row.primaryFacilityId ?? 0,
    currentRiskLevel: row.currentRiskLevel as Patient["currentRiskLevel"],
    lastCheckinAt: row.lastCheckinAt ? row.lastCheckinAt.toISOString() : undefined,
    checkinFrequencyDays: row.checkinFrequencyDays,
    preferredCheckinDayOfWeek: row.preferredCheckinDayOfWeek,
    preferredCheckinHour: row.preferredCheckinHour,
    contactChannel: row.contactChannel as Patient["contactChannel"],
    whatsappNumber: row.whatsappNumber ?? undefined,
    nextCallAt: row.nextCallAt ? row.nextCallAt.toISOString() : undefined,
    nextWeeklyMessageAt: row.nextWeeklyMessageAt ? row.nextWeeklyMessageAt.toISOString() : undefined,
    consentStatus: (row.consentStatus as Patient["consentStatus"]) ?? "GRANTED",
    consentRecordedAt: row.consentRecordedAt ? row.consentRecordedAt.toISOString() : undefined,
    consentChannel: (row.consentChannel as Patient["consentChannel"]) ?? "VERBAL_CLINIC",
    consentVersion: row.consentVersion ?? "ODPC-2026-v1",
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listPatients(filters?: {
  risk?: string;
  facilityId?: number;
}): Promise<Patient[]> {
  const db = getDb();
  const rows: Patient[] = db
    ? (await db.select().from(schema.patients)).map(rowToPatient)
    : mockStore.patients;

  return rows.filter((p) => {
    if (filters?.risk && p.currentRiskLevel !== filters.risk.toUpperCase()) return false;
    if (filters?.facilityId && p.primaryFacilityId !== filters.facilityId) return false;
    return true;
  });
}

export async function getPatientById(id: number): Promise<Patient | undefined> {
  const db = getDb();
  if (!db) return mockStore.patients.find((p) => p.id === id);
  const [row] = await db.select().from(schema.patients).where(eq(schema.patients.id, id));
  return row ? rowToPatient(row) : undefined;
}

export async function findPatientByPhone(phoneNumber: string): Promise<Patient | undefined> {
  const db = getDb();
  if (!db) return mockStore.patients.find((p) => p.phoneNumber === phoneNumber);
  const [row] = await db.select().from(schema.patients).where(eq(schema.patients.phoneNumber, phoneNumber));
  return row ? rowToPatient(row) : undefined;
}

export interface NewPatientInput {
  nationalId?: string;
  fullName: string;
  phoneNumber: string;
  age: number;
  gravida: number;
  parity: number;
  gestationalWeeks: number;
  estimatedDeliveryDate: string;
  bloodType: string;
  preferredLanguage: Patient["preferredLanguage"];
  primaryFacilityId: number;
  checkinFrequencyDays?: number;
  preferredCheckinDayOfWeek?: number;
  preferredCheckinHour?: number;
  contactChannel?: Patient["contactChannel"];
  whatsappNumber?: string;
  consentStatus?: Patient["consentStatus"];
  consentChannel?: Patient["consentChannel"];
  consentVersion?: string;
}

export async function createPatient(input: NewPatientInput): Promise<Patient> {
  const db = getDb();
  const schedule = {
    checkinFrequencyDays: input.checkinFrequencyDays ?? 14,
    preferredCheckinDayOfWeek: input.preferredCheckinDayOfWeek ?? 6,
    preferredCheckinHour: input.preferredCheckinHour ?? 14,
  };
  const { nextCallAt, nextWeeklyMessageAt } = computeInitialSchedule(schedule);
  const contactChannel = input.contactChannel ?? (input.whatsappNumber ? "WHATSAPP" : "SMS");
  const consentStatus = input.consentStatus ?? "GRANTED";
  const consentChannel = input.consentChannel ?? "VERBAL_CLINIC";
  const consentVersion = input.consentVersion ?? "ODPC-2026-v1";
  const consentRecordedAt = new Date();

  if (!db) {
    const newPatient: Patient = {
      id: mockStore.patients.length + 1,
      nationalId: input.nationalId,
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
      age: input.age,
      gravida: input.gravida,
      parity: input.parity,
      gestationalWeeks: input.gestationalWeeks,
      estimatedDeliveryDate: input.estimatedDeliveryDate,
      bloodType: input.bloodType,
      preferredLanguage: input.preferredLanguage,
      primaryFacilityId: input.primaryFacilityId,
      currentRiskLevel: "NORMAL",
      ...schedule,
      contactChannel,
      whatsappNumber: input.whatsappNumber,
      nextCallAt: nextCallAt.toISOString(),
      nextWeeklyMessageAt: nextWeeklyMessageAt.toISOString(),
      consentStatus,
      consentRecordedAt: consentRecordedAt.toISOString(),
      consentChannel,
      consentVersion,
      createdAt: new Date().toISOString(),
    };
    mockStore.patients.unshift(newPatient);
    return newPatient;
  }

  const [row] = await db
    .insert(schema.patients)
    .values({
      nationalId: input.nationalId,
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
      age: input.age,
      gravida: input.gravida,
      parity: input.parity,
      gestationalWeeks: input.gestationalWeeks,
      estimatedDeliveryDate: input.estimatedDeliveryDate,
      bloodType: input.bloodType,
      preferredLanguage: input.preferredLanguage,
      primaryFacilityId: input.primaryFacilityId,
      currentRiskLevel: "NORMAL",
      ...schedule,
      contactChannel,
      whatsappNumber: input.whatsappNumber,
      nextCallAt,
      nextWeeklyMessageAt,
      consentStatus,
      consentRecordedAt,
      consentChannel,
      consentVersion,
    })
    .returning();
  return rowToPatient(row);
}

export interface ScheduleUpdateInput {
  checkinFrequencyDays?: number;
  preferredCheckinDayOfWeek?: number;
  preferredCheckinHour?: number;
  contactChannel?: Patient["contactChannel"];
  whatsappNumber?: string;
}

export async function updatePatientSchedule(id: number, patch: ScheduleUpdateInput): Promise<Patient | undefined> {
  const existing = await getPatientById(id);
  if (!existing) return undefined;

  const schedule = {
    checkinFrequencyDays: patch.checkinFrequencyDays ?? existing.checkinFrequencyDays,
    preferredCheckinDayOfWeek: patch.preferredCheckinDayOfWeek ?? existing.preferredCheckinDayOfWeek,
    preferredCheckinHour: patch.preferredCheckinHour ?? existing.preferredCheckinHour,
  };
  const { nextCallAt, nextWeeklyMessageAt } = computeInitialSchedule(schedule);

  const db = getDb();
  if (!db) {
    const patient = mockStore.patients.find((p) => p.id === id);
    if (!patient) return undefined;
    Object.assign(patient, schedule, {
      contactChannel: patch.contactChannel ?? patient.contactChannel,
      whatsappNumber: patch.whatsappNumber ?? patient.whatsappNumber,
      nextCallAt: nextCallAt.toISOString(),
      nextWeeklyMessageAt: nextWeeklyMessageAt.toISOString(),
    });
    return patient;
  }

  const [row] = await db
    .update(schema.patients)
    .set({
      ...schedule,
      contactChannel: patch.contactChannel ?? existing.contactChannel,
      whatsappNumber: patch.whatsappNumber ?? existing.whatsappNumber,
      nextCallAt,
      nextWeeklyMessageAt,
    })
    .where(eq(schema.patients.id, id))
    .returning();
  return row ? rowToPatient(row) : undefined;
}

export async function updatePatientRiskState(
  id: number,
  riskLevel: Patient["currentRiskLevel"],
  lastCheckinAt: Date = new Date()
): Promise<void> {
  const db = getDb();
  if (!db) {
    const patient = mockStore.patients.find((p) => p.id === id);
    if (patient) {
      patient.currentRiskLevel = riskLevel;
      patient.lastCheckinAt = lastCheckinAt.toISOString();
    }
    return;
  }
  await db
    .update(schema.patients)
    .set({ currentRiskLevel: riskLevel, lastCheckinAt })
    .where(eq(schema.patients.id, id));
}

/** Mothers whose scheduled Delay-1 voice call is due now or earlier. */
export async function listDueForCall(now: Date = new Date()): Promise<Patient[]> {
  const db = getDb();
  if (!db) {
    return mockStore.patients.filter((p) => p.nextCallAt && new Date(p.nextCallAt) <= now);
  }
  const rows = await db.select().from(schema.patients).where(lte(schema.patients.nextCallAt, now));
  return rows.map(rowToPatient);
}

/** Mothers whose weekly WhatsApp/SMS message is due now or earlier. */
export async function listDueForWeeklyMessage(now: Date = new Date()): Promise<Patient[]> {
  const db = getDb();
  if (!db) {
    return mockStore.patients.filter((p) => p.nextWeeklyMessageAt && new Date(p.nextWeeklyMessageAt) <= now);
  }
  const rows = await db.select().from(schema.patients).where(lte(schema.patients.nextWeeklyMessageAt, now));
  return rows.map(rowToPatient);
}

export async function markCallFired(id: number, firedAt: Date = new Date()): Promise<void> {
  const patient = await getPatientById(id);
  if (!patient) return;
  const nextCallAt = advanceCallSchedule(patient, firedAt);

  const db = getDb();
  if (!db) {
    const p = mockStore.patients.find((x) => x.id === id);
    if (p) p.nextCallAt = nextCallAt.toISOString();
    return;
  }
  await db.update(schema.patients).set({ nextCallAt }).where(eq(schema.patients.id, id));
}

export async function markWeeklyMessageFired(id: number, firedAt: Date = new Date()): Promise<void> {
  const nextWeeklyMessageAt = advanceWeeklyMessageSchedule(firedAt);

  const db = getDb();
  if (!db) {
    const p = mockStore.patients.find((x) => x.id === id);
    if (p) p.nextWeeklyMessageAt = nextWeeklyMessageAt.toISOString();
    return;
  }
  await db.update(schema.patients).set({ nextWeeklyMessageAt }).where(eq(schema.patients.id, id));
}
