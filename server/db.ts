import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const dbUrl = process.env.DATABASE_URL || '';
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