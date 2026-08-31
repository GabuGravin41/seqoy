import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "";

// Configure neon if needed
if (process.env.NODE_ENV === "development") {
  neonConfig.fetchConnectionCache = true;
}

let dbInstance: any = null;

export function getDb() {
  if (!connectionString) {
    console.warn("⚠️ DATABASE_URL is not set. Using mock/in-memory mode for offline development.");
    return null;
  }
  if (!dbInstance) {
    const sql = neon(connectionString);
    dbInstance = drizzle(sql, { schema });
  }
  return dbInstance;
}

export const db = connectionString ? drizzle(neon(connectionString), { schema }) : null;
export { schema };
