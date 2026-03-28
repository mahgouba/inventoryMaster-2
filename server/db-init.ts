import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import bcrypt from 'bcryptjs';

let pool: Pool | null = null;
let db: any = null;

export async function initializeDatabase() {
  // Prefer NEON_DATABASE_URL (external Neon DB) over the default DATABASE_URL (Replit Helium DB)
  let DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  
  // Clean the URL if it includes psql command wrapper
  if (DATABASE_URL && DATABASE_URL.startsWith("psql '")) {
    DATABASE_URL = DATABASE_URL.replace(/^psql '/, '').replace(/'$/, '');
  }
  
  if (DATABASE_URL) {
    try {
      console.log('🔌 Initializing database connection...');
      const dbSource = process.env.NEON_DATABASE_URL ? '☁️ Neon (external)' : '🏠 Replit (local)';
      console.log(`📍 Using database URL [${dbSource}]:`, DATABASE_URL.substring(0, 50) + '...');
      
      const isLocalDb = DATABASE_URL.includes('sslmode=disable') || DATABASE_URL.includes('localhost') || DATABASE_URL.includes('helium');
      const poolConfig = {
        connectionString: DATABASE_URL,
        ssl: isLocalDb ? false : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      };
      
      pool = new Pool(poolConfig);
      db = drizzle({ client: pool, schema });
      
      // Test the connection
      await pool.query('SELECT 1');
      console.log('✅ Database connection successful');

      // Seed default admin user if no users exist
      const userCount = await pool.query('SELECT COUNT(*) FROM users');
      if (parseInt(userCount.rows[0].count) === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await pool.query(
          "INSERT INTO users (name, job_title, phone_number, username, password, role) VALUES ($1, $2, $3, $4, $5, $6)",
          ['المدير', 'مدير النظام', '0500000000', 'admin', hashedPassword, 'admin']
        );
        console.log('✅ Default admin user created (username: admin, password: admin123)');
      }
      
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
    const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    if (DATABASE_URL) {
      const isLocalDb2 = DATABASE_URL.includes('sslmode=disable') || DATABASE_URL.includes('localhost') || DATABASE_URL.includes('helium');
      const newPool = new Pool({
        connectionString: DATABASE_URL,
        ssl: isLocalDb2 ? false : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
      const newDb = drizzle({ client: newPool, schema });
      pool = newPool;
      db = newDb;
      console.log('✅ Database reconnected');
    } else {
      console.error('❌ DATABASE_URL environment variable not found');
    }
  }
  return { pool, db };
}