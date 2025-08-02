import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let db: any = null;

// Only initialize database connection if DATABASE_URL is available
if (process.env.DATABASE_URL) {
  try {
    console.log('🔌 Initializing database connection...');
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
    console.log('✅ Database connection initialized successfully');
  } catch (error) {
    console.warn('⚠️ Failed to initialize database connection:', error);
    pool = null;
    db = null;
  }
} else {
  console.log('ℹ️ DATABASE_URL not found - running without database (using MemStorage)');
}

export { pool, db };