import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Using in-memory storage instead.");
  // Create a dummy connection string for compatibility
  process.env.DATABASE_URL = "postgresql://dummy:dummy@localhost:5432/dummy";
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });