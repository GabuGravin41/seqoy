import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { mockStore, HospitalCapacity } from "@/db/mock-store";

type CapacityRow = typeof schema.hospitalCapacities.$inferSelect;

function rowToCapacity(row: CapacityRow): HospitalCapacity {
  return {
    id: row.id,
    facilityId: row.facilityId,
    icuBedsTotal: row.icuBedsTotal,
    icuBedsAvailable: row.icuBedsAvailable,
    hduBedsTotal: row.hduBedsTotal,
    hduBedsAvailable: row.hduBedsAvailable,
    maternityBedsAvailable: row.maternityBedsAvailable,
    operatingTheatresTotal: row.operatingTheatresTotal,
    operatingTheatresAvailable: row.operatingTheatresAvailable,
    theatreReadinessStatus: row.theatreReadinessStatus as HospitalCapacity["theatreReadinessStatus"],
    bloodStock: {
      "A+": row.bloodStockA_Pos,
      "A-": row.bloodStockA_Neg,
      "B+": row.bloodStockB_Pos,
      "B-": row.bloodStockB_Neg,
      "AB+": row.bloodStockAb_Pos,
      "AB-": row.bloodStockAb_Neg,
      "O+": row.bloodStockO_Pos,
      "O-": row.bloodStockO_Neg,
    },
    unreservedEmergencyONeg: row.unreservedEmergencyONeg ?? 0,
    obstetricianOnDuty: row.obstetricianOnDuty,
    anesthesiologistOnDuty: row.anesthesiologistOnDuty,
    neonatologistOnDuty: row.neonatologistOnDuty,
    isApexReferralCenter: row.isApexReferralCenter ?? false,
    hemodialysisAvailable: row.hemodialysisAvailable ?? false,
    bloodIrradiationAvailable: row.bloodIrradiationAvailable ?? false,
    neonatalVentilatorsAvailable: row.neonatalVentilatorsAvailable ?? 0,
    dutyStationWhatsappPhone: row.dutyStationWhatsappPhone ?? undefined,
    syncMode: row.syncMode as HospitalCapacity["syncMode"],
    lastWebhookSyncAt: row.lastWebhookSyncAt ? row.lastWebhookSyncAt.toISOString() : undefined,
    lastUpdated: row.lastUpdated.toISOString(),
  };
}

function bloodStockColumns(bloodStock: Partial<HospitalCapacity["bloodStock"]>) {
  const map: Record<string, keyof CapacityRow> = {
    "A+": "bloodStockA_Pos",
    "A-": "bloodStockA_Neg",
    "B+": "bloodStockB_Pos",
    "B-": "bloodStockB_Neg",
    "AB+": "bloodStockAb_Pos",
    "AB-": "bloodStockAb_Neg",
    "O+": "bloodStockO_Pos",
    "O-": "bloodStockO_Neg",
  };
  const out: Record<string, number> = {};
  for (const [bloodType, column] of Object.entries(map)) {
    const value = bloodStock[bloodType as keyof HospitalCapacity["bloodStock"]];
    if (value !== undefined) out[column] = value;
  }
  return out;
}

export async function listCapacities(): Promise<HospitalCapacity[]> {
  const db = getDb();
  if (!db) return mockStore.capacities;
  const rows = await db.select().from(schema.hospitalCapacities);
  return rows.map(rowToCapacity);
}

export async function getCapacityByFacilityId(facilityId: number): Promise<HospitalCapacity | undefined> {
  const db = getDb();
  if (!db) return mockStore.capacities.find((c) => c.facilityId === facilityId);
  const [row] = await db
    .select()
    .from(schema.hospitalCapacities)
    .where(eq(schema.hospitalCapacities.facilityId, facilityId));
  return row ? rowToCapacity(row) : undefined;
}

export interface CapacityUpdateInput {
  icuBedsAvailable?: number;
  icuBedsTotal?: number;
  hduBedsAvailable?: number;
  maternityBedsAvailable?: number;
  operatingTheatresAvailable?: number;
  theatreReadinessStatus?: HospitalCapacity["theatreReadinessStatus"];
  bloodStock?: Partial<HospitalCapacity["bloodStock"]>;
  unreservedEmergencyONeg?: number;
  obstetricianOnDuty?: boolean;
  anesthesiologistOnDuty?: boolean;
  neonatologistOnDuty?: boolean;
  /** Who actually changed these numbers — shown to referring clinics instead of a blanket "connected" claim. */
  source?: "EHR_WEBHOOK" | "MANUAL";
}

export async function updateCapacity(
  facilityId: number,
  patch: CapacityUpdateInput
): Promise<HospitalCapacity | undefined> {
  const db = getDb();

  if (!db) {
    const capacity = mockStore.capacities.find((c) => c.facilityId === facilityId);
    if (!capacity) return undefined;
    if (patch.icuBedsAvailable !== undefined) capacity.icuBedsAvailable = patch.icuBedsAvailable;
    if (patch.icuBedsTotal !== undefined) capacity.icuBedsTotal = patch.icuBedsTotal;
    if (patch.hduBedsAvailable !== undefined) capacity.hduBedsAvailable = patch.hduBedsAvailable;
    if (patch.maternityBedsAvailable !== undefined) capacity.maternityBedsAvailable = patch.maternityBedsAvailable;
    if (patch.operatingTheatresAvailable !== undefined)
      capacity.operatingTheatresAvailable = patch.operatingTheatresAvailable;
    if (patch.theatreReadinessStatus !== undefined) capacity.theatreReadinessStatus = patch.theatreReadinessStatus;
    if (patch.bloodStock) capacity.bloodStock = { ...capacity.bloodStock, ...patch.bloodStock };
    if (patch.unreservedEmergencyONeg !== undefined)
      capacity.unreservedEmergencyONeg = patch.unreservedEmergencyONeg;
    if (patch.obstetricianOnDuty !== undefined) capacity.obstetricianOnDuty = patch.obstetricianOnDuty;
    if (patch.anesthesiologistOnDuty !== undefined) capacity.anesthesiologistOnDuty = patch.anesthesiologistOnDuty;
    if (patch.neonatologistOnDuty !== undefined) capacity.neonatologistOnDuty = patch.neonatologistOnDuty;
    if (patch.source) capacity.syncMode = patch.source;
    if (patch.source === "EHR_WEBHOOK") capacity.lastWebhookSyncAt = new Date().toISOString();
    capacity.lastUpdated = new Date().toISOString();
    return capacity;
  }

  const values: Record<string, unknown> = { lastUpdated: new Date() };
  if (patch.source) values.syncMode = patch.source;
  if (patch.source === "EHR_WEBHOOK") values.lastWebhookSyncAt = new Date();
  if (patch.icuBedsAvailable !== undefined) values.icuBedsAvailable = patch.icuBedsAvailable;
  if (patch.icuBedsTotal !== undefined) values.icuBedsTotal = patch.icuBedsTotal;
  if (patch.hduBedsAvailable !== undefined) values.hduBedsAvailable = patch.hduBedsAvailable;
  if (patch.maternityBedsAvailable !== undefined) values.maternityBedsAvailable = patch.maternityBedsAvailable;
  if (patch.operatingTheatresAvailable !== undefined)
    values.operatingTheatresAvailable = patch.operatingTheatresAvailable;
  if (patch.theatreReadinessStatus !== undefined) values.theatreReadinessStatus = patch.theatreReadinessStatus;
  if (patch.bloodStock) Object.assign(values, bloodStockColumns(patch.bloodStock));
  if (patch.unreservedEmergencyONeg !== undefined)
    values.unreservedEmergencyONeg = patch.unreservedEmergencyONeg;
  if (patch.obstetricianOnDuty !== undefined) values.obstetricianOnDuty = patch.obstetricianOnDuty;
  if (patch.anesthesiologistOnDuty !== undefined) values.anesthesiologistOnDuty = patch.anesthesiologistOnDuty;
  if (patch.neonatologistOnDuty !== undefined) values.neonatologistOnDuty = patch.neonatologistOnDuty;

  const [row] = await db
    .update(schema.hospitalCapacities)
    .set(values)
    .where(eq(schema.hospitalCapacities.facilityId, facilityId))
    .returning();
  return row ? rowToCapacity(row) : undefined;
}

/**
 * Applied by the HIMS admission/discharge webhook: a bed is actually
 * incremented/decremented instead of merely being described in a response.
 */
export async function adjustBed(
  facilityId: number,
  wardType: "ICU" | "HDU" | "MATERNITY",
  delta: number
): Promise<HospitalCapacity | undefined> {
  const current = await getCapacityByFacilityId(facilityId);
  if (!current) return undefined;

  const field =
    wardType === "ICU" ? "icuBedsAvailable" : wardType === "HDU" ? "hduBedsAvailable" : "maternityBedsAvailable";
  const bound = wardType === "ICU" ? current.icuBedsTotal : wardType === "HDU" ? current.hduBedsTotal : undefined;
  const nextValue = Math.max(0, current[field] + delta);
  const clamped = bound !== undefined ? Math.min(bound, nextValue) : nextValue;

  return updateCapacity(facilityId, { [field]: clamped, source: "EHR_WEBHOOK" } as CapacityUpdateInput);
}
