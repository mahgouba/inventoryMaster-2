import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Required database connection
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please ensure the database is provisioned and environment variables are configured."
  );
}

console.log('🔌 Initializing database connection...');
console.log('📋 DATABASE_URL available:', !!process.env.DATABASE_URL);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

export const pool = new Pool(poolConfig);
export const db = drizzle({ client: pool, schema });

// Test connection on startup
pool.connect()
  .then(client => {
    console.log('✅ Database connection successful');
    client.release();
  })
  .catch(error => {
    console.error('❌ Database connection failed:', error);
    throw error;
  });