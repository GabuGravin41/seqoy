import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.STORAGE_DATABASE_URL ||
  process.env.STORAGE_POSTGRES_URL ||
  "";
const isNeonUrl = /neon\.tech/i.test(connectionString);

if (process.env.NODE_ENV === "development") {
  neonConfig.fetchConnectionCache = true;
}

type SeqoyDb = ReturnType<typeof drizzleNeon<typeof schema>> | ReturnType<typeof drizzlePg<typeof schema>>;

function createDb(): SeqoyDb {
  if (isNeonUrl) {
    return drizzleNeon(neon(connectionString), { schema });
  }
  // Local/self-hosted Postgres (e.g. docker-compose for dev/CI) uses the standard
  // node-postgres driver instead of Neon's HTTP-only serverless driver.
  const pool = new Pool({ connectionString });
  return drizzlePg(pool, { schema });
}

let dbInstance: SeqoyDb | null = null;

export function getDb(): SeqoyDb | null {
  if (!connectionString) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "DATABASE_URL is not set. SEQOY requires a real Postgres connection in production — refusing to fall back to in-memory mock data for patient records."
      );
    }
    console.warn("⚠️ DATABASE_URL is not set. Using mock/in-memory mode for offline development.");
    return null;
  }
  if (!dbInstance) {
    dbInstance = createDb();
  }
  return dbInstance;
}

export const db = connectionString ? createDb() : null;
export { schema };
