import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

let pool: Pool | null = null;
let db: any = null;

export function initializeDatabase() {
  if (pool && db) {
    return { pool, db };
  }

  // Use environment variable for database URL
  let DATABASE_URL = process.env.DATABASE_URL;
  
  // Clean the URL if it includes psql command wrapper
  if (DATABASE_URL && DATABASE_URL.startsWith("psql '")) {
    DATABASE_URL = DATABASE_URL.replace(/^psql '/, '').replace(/'$/, '');
  }

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

  pool = new Pool(poolConfig);
  db = drizzle({ client: pool, schema });

  return { pool, db };
}

export function getDatabase() {
  if (!pool || !db) {
    const result = initializeDatabase();
    pool = result.pool;
    db = result.db;
  }
  return { pool, db };
}

export { pool, db };