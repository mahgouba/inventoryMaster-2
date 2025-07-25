import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// For development compatibility, use a fallback or handle missing DATABASE_URL gracefully
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Using fallback database configuration for development.");
  // You can set a fallback URL or handle this gracefully
  process.env.DATABASE_URL = "postgresql://localhost:5432/inventory_dev";
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });