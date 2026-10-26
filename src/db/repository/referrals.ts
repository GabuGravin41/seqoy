import { eq, count } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { mockStore, FacilityReferral } from "@/db/mock-store";
import { getPatientById } from "./patients";
import { getFacilityById } from "./facilities";

type ReferralRow = typeof schema.facilityReferrals.$inferSelect;

async function rowToReferral(row: ReferralRow): Promise<FacilityReferral> {
  const [patient, referringFacility, receivingFacility] = await Promise.all([
    getPatientById(row.patientId),
    getFacilityById(row.referringFacilityId),
    getFacilityById(row.receivingFacilityId),
  ]);

  return {
    id: row.id,
    referralCode: row.referralCode,
    patientId: row.patientId,
    patientName: patient?.fullName,
    referringFacilityId: row.referringFacilityId,
    referringFacilityName: referringFacility?.name,
    receivingFacilityId: row.receivingFacilityId,
    receivingFacilityName: receivingFacility?.name,
    clinicalIndication: row.clinicalIndication,
    urgencyLevel: row.urgencyLevel as FacilityReferral["urgencyLevel"],
    acuityTier: row.acuityTier as FacilityReferral["acuityTier"],
    isAcuityOverride: row.isAcuityOverride,
    acuityOverrideReason: row.acuityOverrideReason ?? undefined,
    icuBedReserved: row.icuBedReserved,
    theatreReserved: row.theatreReserved,
    bloodUnitsReserved: row.bloodUnitsReserved,
    bloodTypeReserved: row.bloodTypeReserved ?? undefined,
    unreservedBloodReserved: row.unreservedBloodReserved,
    whatsappDispatchStatus: row.whatsappDispatchStatus as FacilityReferral["whatsappDispatchStatus"],
    whatsappDispatchedAt: row.whatsappDispatchedAt ? row.whatsappDispatchedAt.toISOString() : undefined,
    status: row.status as FacilityReferral["status"],
    preArrivalHandoverNote: row.preArrivalHandoverNote ?? undefined,
    initiatedAt: row.initiatedAt.toISOString(),
    acknowledgedAt: row.acknowledgedAt ? row.acknowledgedAt.toISOString() : undefined,
    admittedAt: row.admittedAt ? row.admittedAt.toISOString() : undefined,
    completedAt: row.completedAt ? row.completedAt.toISOString() : undefined,
  };
}

export async function listReferrals(filters?: {
  status?: string;
  patientId?: number;
}): Promise<FacilityReferral[]> {
  const db = getDb();
  let list: FacilityReferral[];

  if (!db) {
    list = mockStore.referrals;
  } else {
    const rows = await db.select().from(schema.facilityReferrals);
    list = await Promise.all(rows.map(rowToReferral));
  }

  return list.filter((r) => {
    if (filters?.status && r.status !== filters.status.toUpperCase()) return false;
    if (filters?.patientId && r.patientId !== filters.patientId) return false;
    return true;
  });
}

export async function getReferralById(id: number): Promise<FacilityReferral | undefined> {
  const db = getDb();
  if (!db) return mockStore.referrals.find((r) => r.id === id);
  const [row] = await db.select().from(schema.facilityReferrals).where(eq(schema.facilityReferrals.id, id));
  return row ? rowToReferral(row) : undefined;
}

export interface NewReferralInput {
  patientId: number;
  referringFacilityId: number;
  receivingFacilityId: number;
  clinicalIndication: string;
  urgencyLevel: FacilityReferral["urgencyLevel"];
  acuityTier?: FacilityReferral["acuityTier"];
  isAcuityOverride?: boolean;
  acuityOverrideReason?: string;
  icuBedReserved: boolean;
  theatreReserved: boolean;
  bloodUnitsReserved: number;
  bloodTypeReserved?: string;
  unreservedBloodReserved?: number;
  preArrivalHandoverNote?: string;
}

function nextReferralCode(count: number) {
  return `SEQ-REF-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
}

export async function createReferral(input: NewReferralInput): Promise<FacilityReferral> {
  const db = getDb();

  if (!db) {
    const patient = mockStore.patients.find((p) => p.id === input.patientId);
    const referringFacility = mockStore.facilities.find((f) => f.id === input.referringFacilityId);
    const receivingFacility = mockStore.facilities.find((f) => f.id === input.receivingFacilityId);
    const newReferral: FacilityReferral = {
      id: mockStore.referrals.length + 1,
      referralCode: nextReferralCode(mockStore.referrals.length),
      patientId: input.patientId,
      patientName: patient?.fullName,
      referringFacilityId: input.referringFacilityId,
      referringFacilityName: referringFacility?.name,
      receivingFacilityId: input.receivingFacilityId,
      receivingFacilityName: receivingFacility?.name,
      clinicalIndication: input.clinicalIndication,
      urgencyLevel: input.urgencyLevel,
      acuityTier: input.acuityTier || "ROUTINE",
      isAcuityOverride: input.isAcuityOverride || false,
      acuityOverrideReason: input.acuityOverrideReason,
      icuBedReserved: input.icuBedReserved,
      theatreReserved: input.theatreReserved,
      bloodUnitsReserved: input.bloodUnitsReserved,
      bloodTypeReserved: input.bloodTypeReserved,
      unreservedBloodReserved: input.unreservedBloodReserved || 0,
      whatsappDispatchStatus: "NOT_DISPATCHED",
      status: "REQUESTED",
      preArrivalHandoverNote: input.preArrivalHandoverNote,
      initiatedAt: new Date().toISOString(),
    };
    mockStore.referrals.unshift(newReferral);
    return newReferral;
  }

  const [{ total }] = await db.select({ total: count() }).from(schema.facilityReferrals);
  const [row] = await db
    .insert(schema.facilityReferrals)
    .values({
      referralCode: nextReferralCode(Number(total) || 0),
      patientId: input.patientId,
      referringFacilityId: input.referringFacilityId,
      receivingFacilityId: input.receivingFacilityId,
      clinicalIndication: input.clinicalIndication,
      urgencyLevel: input.urgencyLevel,
      acuityTier: input.acuityTier || "ROUTINE",
      isAcuityOverride: input.isAcuityOverride || false,
      acuityOverrideReason: input.acuityOverrideReason,
      icuBedReserved: input.icuBedReserved,
      theatreReserved: input.theatreReserved,
      bloodUnitsReserved: input.bloodUnitsReserved,
      bloodTypeReserved: input.bloodTypeReserved,
      unreservedBloodReserved: input.unreservedBloodReserved || 0,
      whatsappDispatchStatus: "NOT_DISPATCHED",
      status: "REQUESTED",
      preArrivalHandoverNote: input.preArrivalHandoverNote,
    })
    .returning();
  return rowToReferral(row);
}

export async function updateReferralDispatch(
  id: number,
  status: "DISPATCHED" | "ACKNOWLEDGED"
): Promise<FacilityReferral | undefined> {
  const db = getDb();
  if (!db) {
    const referral = mockStore.referrals.find((r) => r.id === id);
    if (!referral) return undefined;
    referral.whatsappDispatchStatus = status;
    referral.whatsappDispatchedAt = new Date().toISOString();
    return referral;
  }
  const [row] = await db
    .update(schema.facilityReferrals)
    .set({
      whatsappDispatchStatus: status,
      whatsappDispatchedAt: new Date(),
    })
    .where(eq(schema.facilityReferrals.id, id))
    .returning();
  return row ? rowToReferral(row) : undefined;
}

export async function updateReferralStatus(
  id: number,
  status: FacilityReferral["status"]
): Promise<FacilityReferral | undefined> {
  const db = getDb();
  const timestampField =
    status === "ACKNOWLEDGED" || status === "ACCEPTED"
      ? "acknowledgedAt"
      : status === "ADMITTED"
      ? "admittedAt"
      : status === "COMPLETED"
      ? "completedAt"
      : undefined;

  if (!db) {
    const referral = mockStore.referrals.find((r) => r.id === id);
    if (!referral) return undefined;
    referral.status = status;
    if (timestampField) (referral as any)[timestampField] = new Date().toISOString();
    return referral;
  }

  const values: Record<string, unknown> = { status };
  if (timestampField) values[timestampField] = new Date();
  const [row] = await db
    .update(schema.facilityReferrals)
    .set(values)
    .where(eq(schema.facilityReferrals.id, id))
    .returning();
  return row ? rowToReferral(row) : undefined;
}
