import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

let pool: Pool | null = null;
let db: any = null;

// Only initialize database connection if DATABASE_URL is available
if (process.env.DATABASE_URL) {
  try {
    console.log('🔌 Initializing database connection...');
    
    // Configure pool with SSL settings for Railway/external databases
    const poolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
    
    pool = new Pool(poolConfig);
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