import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { mockStore, Facility } from "@/db/mock-store";

function rowToFacility(row: typeof schema.facilities.$inferSelect): Facility {
  return {
    id: row.id,
    name: row.name,
    tier: row.tier as Facility["tier"],
    county: row.county,
    subCounty: row.subCounty,
    latitude: row.latitude,
    longitude: row.longitude,
    emergencyPhone: row.emergencyPhone,
    isReferralCenter: row.isReferralCenter,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listFacilities(filters?: {
  referralOnly?: boolean;
  county?: string;
}): Promise<Facility[]> {
  const db = getDb();
  const rows: Facility[] = db
    ? (await db.select().from(schema.facilities)).map(rowToFacility)
    : mockStore.facilities;

  return rows.filter((f) => {
    if (filters?.referralOnly && !f.isReferralCenter) return false;
    if (filters?.county && f.county.toLowerCase() !== filters.county.toLowerCase()) return false;
    return true;
  });
}

export async function getFacilityById(id: number): Promise<Facility | undefined> {
  const db = getDb();
  if (!db) return mockStore.facilities.find((f) => f.id === id);
  const [row] = await db.select().from(schema.facilities).where(eq(schema.facilities.id, id));
  return row ? rowToFacility(row) : undefined;
}
