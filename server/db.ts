import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Optional database connection for Replit compatibility
let pool: Pool | null = null;
let db: any = null;

if (process.env.DATABASE_URL) {
  try {
    console.log('🔌 Database URL found, attempting connection...');
    
    const poolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

    pool = new Pool(poolConfig);
    db = drizzle({ client: pool, schema });
    
    console.log('✅ Database connection configured');
  } catch (error) {
    console.warn('⚠️ Database connection failed, using memory storage:', error);
    pool = null;
    db = null;
  }
} else {
  console.log('ℹ️ No DATABASE_URL found, using memory storage for Replit compatibility');
}

export { pool, db };