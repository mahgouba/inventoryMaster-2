import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

let pool: Pool | null = null;
let db: any = null;

export async function initializeDatabase() {
  // Use the main production database URL
  const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_aKGc5jdCuOI4@ep-solitary-hill-a69yqw2u.us-west-2.aws.neon.tech/neondb?sslmode=require";
  
  if (DATABASE_URL) {
    try {
      console.log('🔌 Initializing database connection...');
      
      const poolConfig = {
        connectionString: DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      };
      
      pool = new Pool(poolConfig);
      db = drizzle({ client: pool, schema });
      
      // Test the connection
      await pool.query('SELECT 1');
      console.log('✅ Database connection successful');
      
      return { pool, db };
    } catch (error) {
      console.warn('⚠️ Database connection failed:', error);
      if (pool) {
        try {
          await pool.end();
        } catch (e) {
          console.warn('Error closing pool:', e);
        }
      }
      pool = null;
      db = null;
      return { pool: null, db: null };
    }
  } else {
    console.log('ℹ️ DATABASE_URL not found - using memory storage');
    return { pool: null, db: null };
  }
}

export function getDatabase() {
  return { pool, db };
}