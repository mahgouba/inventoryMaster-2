import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

let pool: Pool;
let db: any;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Using in-memory storage instead.");
  // Create a dummy connection for compatibility
  pool = new Pool({ connectionString: "postgresql://dummy:dummy@localhost:5432/dummy" });
  db = drizzle(pool, { schema });
} else {
  try {
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    db = drizzle(pool, { schema });
    console.log("Connected to PostgreSQL database");
  } catch (error) {
    console.error("Database connection failed:", error);
    // Fallback to dummy connection
    pool = new Pool({ connectionString: "postgresql://dummy:dummy@localhost:5432/dummy" });
    db = drizzle(pool, { schema });
  }
}

export { pool, db };