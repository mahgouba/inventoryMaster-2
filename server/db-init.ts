import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

let pool: Pool | null = null;
let db: any = null;

export async function initializeDatabase() {
  // Force use of external database URL
  let DATABASE_URL = "postgresql://neondb_owner:npg_E9MhlZt2CTGz@ep-dry-night-afnnpvw9-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  
  // Clean the URL if it includes psql command wrapper
  if (DATABASE_URL && DATABASE_URL.startsWith("psql '")) {
    DATABASE_URL = DATABASE_URL.replace(/^psql '/, '').replace(/'$/, '');
  }
  
  if (DATABASE_URL) {
    try {
      console.log('🔌 Initializing database connection...');
      console.log('📍 Using database URL:', DATABASE_URL.substring(0, 50) + '...');
      
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
  if (!db || !pool) {
    console.warn('⚠️ Database not initialized, attempting to reconnect...');
    // Force reconnection with external database
    const DATABASE_URL = "postgresql://neondb_owner:npg_E9MhlZt2CTGz@ep-dry-night-afnnpvw9-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
    const newPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    const newDb = drizzle({ client: newPool, schema: require("@shared/schema") });
    pool = newPool;
    db = newDb;
    console.log('✅ Database reconnected');
  }
  return { pool, db };
}