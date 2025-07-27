import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Only configure database if DATABASE_URL is available
let pool: Pool | null = null;
let db: any = null;

if (process.env.DATABASE_URL) {
  neonConfig.webSocketConstructor = ws;
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
  console.log("✅ Database connection configured");
} else {
  console.log("⚠️ DATABASE_URL not set - database features will use in-memory storage");
}

export { pool, db };