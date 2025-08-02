import { Router } from "express";
import { importDataFromJson } from "../import-data";
import { createTables } from "../create-tables";

const router = Router();

// Import data endpoint
router.post("/import", async (req, res) => {
  try {
    console.log("📥 Starting data import API call...");
    
    // First create tables if they don't exist
    try {
      await createTables();
      console.log("✅ Database tables verified/created");
    } catch (tableError: any) {
      console.log("⚠️ Table creation skipped (may already exist):", tableError.message);
    }
    
    // Import data
    const stats = await importDataFromJson();
    
    res.json({
      success: true,
      message: "Data imported successfully",
      stats
    });
  } catch (error: any) {
    console.error("❌ Import error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to import data",
      error: error.message
    });
  }
});

// Get import status
router.get("/status", async (req, res) => {
  try {
    // Check if database is connected
    const isConnected = !!process.env.DATABASE_URL;
    
    res.json({
      success: true,
      databaseConnected: isConnected,
      databaseUrl: process.env.DATABASE_URL ? "Connected" : "Not configured"
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to check status",
      error: error.message
    });
  }
});

export default router;