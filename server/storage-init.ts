import { db } from "./db";
import type { IStorage } from "./storage";

export async function createStorageInstance(): Promise<IStorage> {
  try {
    // Check if DATABASE_URL exists
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && db) {
      console.log('✅ Using DatabaseStorage with PostgreSQL');
      // Dynamic import to avoid circular dependency
      const { DatabaseStorage } = await import("./database-storage");
      return new DatabaseStorage();
    } else {
      console.log('⚠️ Using MemStorage (DATABASE_URL not found or db not available)');
      const { MemStorage } = await import("./storage");  
      return new MemStorage();
    }
  } catch (error) {
    console.log('⚠️ Database connection failed, falling back to MemStorage:', error);
    const { MemStorage } = await import("./storage");
    return new MemStorage();
  }
}