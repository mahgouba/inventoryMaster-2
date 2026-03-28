import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '';

if (!dbUrl) {
  throw new Error(
    "DATABASE_URL or NEON_DATABASE_URL must be set. Did you forget to provision a database?",
  );
}
const isLocalDb = dbUrl.includes('sslmode=disable') || dbUrl.includes('localhost') || dbUrl.includes('helium');

export const pool = new Pool({ 
  connectionString: dbUrl,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
export const db = drizzle({ client: pool, schema });

// Export the getDatabase function that other files expect
export function getDatabase() {
  return { db, pool };
}