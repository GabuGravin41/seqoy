import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log("ℹ️ No DATABASE_URL provided. Skipping live DB seed (in-memory mock is active).");
    return;
  }

  console.log("🌱 Seeding Neon Database with Kenyan Facilities and Capacity metrics...");
  const sql = neon(connectionString);
  const db = drizzle(sql, { schema });

  // 1. Insert Facilities
  console.log("Inserting facilities...");
  await db.insert(schema.facilities).values([
    {
      id: 1,
      name: "Kangemi Health Centre",
      tier: "LEVEL_3_CLINIC",
      county: "Nairobi",
      subCounty: "Westlands",
      latitude: -1.2618,
      longitude: 36.7513,
      emergencyPhone: "+254711000101",
      isReferralCenter: false,
    },
    {
      id: 2,
      name: "Pumwani Maternity Hospital",
      tier: "LEVEL_5_COUNTY",
      county: "Nairobi",
      subCounty: "Kamukunji",
      latitude: -1.2789,
      longitude: 36.8488,
      emergencyPhone: "+254711000202",
      isReferralCenter: true,
    },
    {
      id: 3,
      name: "Kenyatta National Hospital (KNH)",
      tier: "LEVEL_6_NATIONAL",
      county: "Nairobi",
      subCounty: "Kibra",
      latitude: -1.3015,
      longitude: 36.8073,
      emergencyPhone: "+254711000303",
      isReferralCenter: true,
    },
    {
      id: 4,
      name: "Kiambu County Referral Hospital",
      tier: "LEVEL_5_COUNTY",
      county: "Kiambu",
      subCounty: "Kiambu Town",
      latitude: -1.1714,
      longitude: 36.8356,
      emergencyPhone: "+254711000404",
      isReferralCenter: true,
    },
  ]).onConflictDoNothing();

  // 2. Insert Capacities
  console.log("Inserting hospital capacities...");
  await db.insert(schema.hospitalCapacities).values([
    {
      facilityId: 2, // Pumwani
      icuBedsTotal: 8,
      icuBedsAvailable: 3,
      hduBedsTotal: 12,
      hduBedsAvailable: 5,
      maternityBedsAvailable: 24,
      operatingTheatresTotal: 4,
      operatingTheatresAvailable: 2,
      theatreReadinessStatus: "READY",
      bloodStockA_Pos: 6,
      bloodStockA_Neg: 2,
      bloodStockB_Pos: 8,
      bloodStockB_Neg: 1,
      bloodStockAb_Pos: 3,
      bloodStockAb_Neg: 1,
      bloodStockO_Pos: 14,
      bloodStockO_Neg: 4,
      obstetricianOnDuty: true,
      anesthesiologistOnDuty: true,
      neonatologistOnDuty: true,
    },
    {
      facilityId: 3, // KNH (0 ICU beds baseline)
      icuBedsTotal: 30,
      icuBedsAvailable: 0,
      hduBedsTotal: 25,
      hduBedsAvailable: 1,
      maternityBedsAvailable: 3,
      operatingTheatresTotal: 8,
      operatingTheatresAvailable: 0,
      theatreReadinessStatus: "SURGERY_IN_PROGRESS",
      bloodStockA_Pos: 2,
      bloodStockA_Neg: 0,
      bloodStockB_Pos: 3,
      bloodStockB_Neg: 0,
      bloodStockAb_Pos: 1,
      bloodStockAb_Neg: 0,
      bloodStockO_Pos: 5,
      bloodStockO_Neg: 0,
      obstetricianOnDuty: true,
      anesthesiologistOnDuty: true,
      neonatologistOnDuty: true,
    },
    {
      facilityId: 4, // Kiambu Level 5
      icuBedsTotal: 6,
      icuBedsAvailable: 4,
      hduBedsTotal: 8,
      hduBedsAvailable: 4,
      maternityBedsAvailable: 18,
      operatingTheatresTotal: 3,
      operatingTheatresAvailable: 2,
      theatreReadinessStatus: "READY",
      bloodStockA_Pos: 8,
      bloodStockA_Neg: 3,
      bloodStockB_Pos: 6,
      bloodStockB_Neg: 2,
      bloodStockAb_Pos: 4,
      bloodStockAb_Neg: 2,
      bloodStockO_Pos: 16,
      bloodStockO_Neg: 5,
      obstetricianOnDuty: true,
      anesthesiologistOnDuty: true,
      neonatologistOnDuty: true,
    },
  ]).onConflictDoNothing();

  console.log("✅ Neon Database seeded successfully!");
}

seed().catch(console.error);
