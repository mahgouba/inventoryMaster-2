import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use provided production database URL or fall back to environment variable
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_aKGc5jdCuOI4@ep-solitary-hill-a69yqw2u.us-west-2.aws.neon.tech/neondb?sslmode=require";

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please ensure the database is provisioned and environment variables are configured."
  );
}

console.log('🔌 Initializing database connection...');
console.log('📋 DATABASE_URL available:', !!DATABASE_URL);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

const poolConfig = {
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Always use SSL for Neon database
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