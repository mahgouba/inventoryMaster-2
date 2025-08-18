import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { users, inventoryItems, manufacturers, banks } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const [user] = await db.select().from(users).where(eq(users.username, username));
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Return user data without password
      res.json({
        username: user.username,
        role: user.role,
        id: user.id
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get all inventory items
  app.get("/api/inventory", async (req, res) => {
    try {
      const items = await db.select().from(inventoryItems);
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  // Get inventory stats
  app.get("/api/inventory/stats", async (req, res) => {
    try {
      const allItems = await db.select().from(inventoryItems);
      
      const stats = {
        total: allItems.length,
        available: allItems.filter(item => item.status === "متوفر").length,
        inTransit: allItems.filter(item => item.status === "في الطريق").length,
        maintenance: allItems.filter(item => item.status === "صيانة").length,
        reserved: allItems.filter(item => item.status === "محجوز").length,
        sold: allItems.filter(item => item.status === "مباع").length,
        personal: allItems.filter(item => item.importType === "شخصي").length,
        company: allItems.filter(item => item.importType === "شركة").length,
        usedPersonal: allItems.filter(item => item.importType === "شخصي مستعمل").length
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching inventory stats:", error);
      res.status(500).json({ message: "Failed to fetch inventory stats" });
    }
  });

  // Get manufacturer statistics
  app.get("/api/inventory/manufacturer-stats", async (req, res) => {
    try {
      const allItems = await db.select().from(inventoryItems);
      const manufacturerStats = new Map();
      
      allItems.forEach(item => {
        const key = item.manufacturer;
        if (!manufacturerStats.has(key)) {
          manufacturerStats.set(key, {
            manufacturer: key,
            total: 0,
            personal: 0,
            company: 0,
            usedPersonal: 0,
            logo: null
          });
        }
        
        const stat = manufacturerStats.get(key);
        stat.total++;
        
        if (item.importType === "شخصي") stat.personal++;
        else if (item.importType === "شركة") stat.company++;
        else if (item.importType === "شخصي مستعمل") stat.usedPersonal++;
      });
      
      res.json(Array.from(manufacturerStats.values()));
    } catch (error) {
      console.error("Error fetching manufacturer stats:", error);
      res.status(500).json({ message: "Failed to fetch manufacturer stats" });
    }
  });

  // Get all manufacturers  
  app.get("/api/manufacturers", async (req, res) => {
    try {
      const allManufacturers = await db.select().from(manufacturers);
      res.json(allManufacturers);
    } catch (error) {
      console.error("Error fetching manufacturers:", error);
      res.status(500).json({ message: "Failed to fetch manufacturers" });
    }
  });

  // Get all banks
  app.get("/api/banks", async (req, res) => {
    try {
      const allBanks = await db.select().from(banks);
      res.json(allBanks);
    } catch (error) {
      console.error("Error fetching banks:", error);
      res.status(500).json({ message: "Failed to fetch banks" });
    }
  });

  // Attendance management placeholder endpoints
  app.get("/api/daily-attendance", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching daily attendance:", error);
      res.status(500).json({ message: "Failed to fetch daily attendance" });
    }
  });

  app.get("/api/employee-work-schedules", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching work schedules:", error);
      res.status(500).json({ message: "Failed to fetch work schedules" });
    }
  });

  app.get("/api/leave-requests", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  // Vehicle data endpoints
  app.get("/api/vehicle-years", async (req, res) => {
    try {
      const items = await db.select().from(inventoryItems);
      const uniqueYears = [...new Set(items.map(item => item.year))].sort((a, b) => b - a);
      res.json(uniqueYears);
    } catch (error) {
      console.error("Error fetching vehicle years:", error);
      res.status(500).json({ message: "Failed to fetch vehicle years" });
    }
  });

  app.get("/api/engine-capacities", async (req, res) => {
    try {
      const items = await db.select().from(inventoryItems);
      const uniqueEngineCapacities = [...new Set(items
        .map(item => item.engineCapacity)
        .filter(capacity => capacity && capacity.trim() !== ""))]
        .sort();
      res.json(uniqueEngineCapacities);
    } catch (error) {
      console.error("Error fetching engine capacities:", error);
      res.status(500).json({ message: "Failed to fetch engine capacities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}