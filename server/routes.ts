import type { Express } from "express";
import { createServer, type Server } from "http";
import { getDatabase } from "./db";
import { users, inventoryItems, manufacturers, banks, vehicleCategories, vehicleTrimLevels } from "@shared/schema";
import { Pool } from 'pg';
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

      const { db } = getDatabase();
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
      const { db } = getDatabase();
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
      const { db } = getDatabase();
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
      const { db } = getDatabase();
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
      const { db } = getDatabase();
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
      const { db } = getDatabase();
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
      const { db } = getDatabase();
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
      const { db } = getDatabase();
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

  // Database management routes
  app.get("/api/database/stats", async (req, res) => {
    try {
      const { db } = getDatabase();
      
      // Get counts for all major tables
      const [
        usersCount,
        inventoryCount,
        manufacturersCount,
        vehicleCategoriesCount,
        trimLevelsCount,
        banksCount,
        bankInterestRatesCount,
        companiesCount,
        quotationsCount,
        colorAssociationsCount,
        vehicleSpecificationsCount,
        vehicleImageLinksCount
      ] = await Promise.all([
        db.select().from(users).then(rows => rows.length),
        db.select().from(inventoryItems).then(rows => rows.length),
        db.select().from(manufacturers).then(rows => rows.length),
        db.select().from(vehicleCategories).then(rows => rows.length).catch(() => 0),
        db.select().from(vehicleTrimLevels).then(rows => rows.length).catch(() => 0),
        db.select().from(banks).then(rows => rows.length),
        db.execute('SELECT COUNT(*) as count FROM bank_interest_rates').then(result => result.rows[0]?.count || 0).catch(() => 0),
        db.execute('SELECT COUNT(*) as count FROM companies').then(result => result.rows[0]?.count || 0).catch(() => 0),
        db.execute('SELECT COUNT(*) as count FROM quotations').then(result => result.rows[0]?.count || 0).catch(() => 0),
        db.execute('SELECT COUNT(*) as count FROM color_associations').then(result => result.rows[0]?.count || 0).catch(() => 0),
        db.execute('SELECT COUNT(*) as count FROM vehicle_specifications').then(result => result.rows[0]?.count || 0).catch(() => 0),
        db.execute('SELECT COUNT(*) as count FROM vehicle_image_links').then(result => result.rows[0]?.count || 0).catch(() => 0)
      ]);

      const stats = {
        users: parseInt(usersCount.toString()),
        inventory: parseInt(inventoryCount.toString()),
        manufacturers: parseInt(manufacturersCount.toString()),
        vehicleCategories: parseInt(vehicleCategoriesCount.toString()),
        trimLevels: parseInt(trimLevelsCount.toString()),
        banks: parseInt(banksCount.toString()),
        bankInterestRates: parseInt(bankInterestRatesCount.toString()),
        companies: parseInt(companiesCount.toString()),
        quotations: parseInt(quotationsCount.toString()),
        colorAssociations: parseInt(colorAssociationsCount.toString()),
        vehicleSpecifications: parseInt(vehicleSpecificationsCount.toString()),
        vehicleImageLinks: parseInt(vehicleImageLinksCount.toString())
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching database stats:", error);
      res.status(500).json({ message: "Failed to fetch database statistics" });
    }
  });

  app.post("/api/database/test-connection", async (req, res) => {
    try {
      const { connectionString } = req.body;
      
      if (!connectionString) {
        return res.status(400).json({ success: false, error: "Connection string is required" });
      }

      // Test the external database connection
      const testPool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 1,
        idleTimeoutMillis: 5000,
        connectionTimeoutMillis: 10000,
      });

      try {
        await testPool.query('SELECT 1');
        await testPool.end();
        
        res.json({ success: true, message: "Connection successful" });
      } catch (testError) {
        await testPool.end().catch(() => {});
        res.json({ success: false, error: testError.message });
      }
    } catch (error) {
      console.error("Connection test error:", error);
      res.json({ success: false, error: "Failed to test connection" });
    }
  });

  app.get("/api/database/export", async (req, res) => {
    try {
      const { db } = getDatabase();
      const { types } = req.query;
      const selectedTypes = types ? types.toString().split(',') : [];
      
      const exportData: any = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        data: {}
      };

      // Export all or selected data types
      if (selectedTypes.length === 0 || selectedTypes.includes('users')) {
        exportData.data.users = await db.select().from(users);
      }
      
      if (selectedTypes.length === 0 || selectedTypes.includes('inventory')) {
        exportData.data.inventory = await db.select().from(inventoryItems);
      }
      
      if (selectedTypes.length === 0 || selectedTypes.includes('manufacturers')) {
        exportData.data.manufacturers = await db.select().from(manufacturers);
      }
      
      if (selectedTypes.length === 0 || selectedTypes.includes('banks')) {
        exportData.data.banks = await db.select().from(banks);
      }

      // Try to export other tables if they exist
      try {
        if (selectedTypes.length === 0 || selectedTypes.includes('vehicleCategories')) {
          exportData.data.vehicleCategories = await db.select().from(vehicleCategories);
        }
      } catch (e) {
        console.log('vehicleCategories table not available');
      }

      try {
        if (selectedTypes.length === 0 || selectedTypes.includes('trimLevels')) {
          exportData.data.trimLevels = await db.select().from(vehicleTrimLevels);
        }
      } catch (e) {
        console.log('vehicleTrimLevels table not available');
      }

      res.json(exportData);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Failed to export database" });
    }
  });

  app.post("/api/database/import", async (req, res) => {
    try {
      const { db } = getDatabase();
      const importData = req.body;
      const selectedTypes = importData.selectedTypes || [];
      
      if (!importData.data) {
        return res.status(400).json({ message: "No data provided for import" });
      }

      // Import selected data types
      if (selectedTypes.length === 0 || selectedTypes.includes('users')) {
        if (importData.data.users) {
          // Clear existing users (except admins)
          await db.execute('DELETE FROM users WHERE role != \'admin\'');
          
          // Insert new users
          for (const user of importData.data.users) {
            try {
              await db.insert(users).values({
                name: user.name,
                jobTitle: user.jobTitle || user.job_title,
                phoneNumber: user.phoneNumber || user.phone_number,
                username: user.username,
                password: user.password,
                role: user.role
              }).onConflictDoNothing();
            } catch (e) {
              console.log(`Failed to import user ${user.username}:`, e);
            }
          }
        }
      }

      if (selectedTypes.length === 0 || selectedTypes.includes('inventory')) {
        if (importData.data.inventory) {
          // Clear existing inventory
          await db.execute('DELETE FROM inventory_items');
          
          // Insert new inventory
          for (const item of importData.data.inventory) {
            try {
              await db.insert(inventoryItems).values({
                manufacturer: item.manufacturer,
                category: item.category,
                trimLevel: item.trimLevel || item.trim_level,
                engineCapacity: item.engineCapacity || item.engine_capacity,
                year: item.year,
                exteriorColor: item.exteriorColor || item.exterior_color,
                interiorColor: item.interiorColor || item.interior_color,
                status: item.status,
                importType: item.importType || item.import_type,
                ownershipType: item.ownershipType || item.ownership_type || 'ملك الشركة',
                location: item.location,
                chassisNumber: item.chassisNumber || item.chassis_number,
                images: item.images || [],
                logo: item.logo,
                notes: item.notes,
                detailedSpecifications: item.detailedSpecifications || item.detailed_specifications,
                price: item.price,
                isSold: item.isSold || item.is_sold || false,
                soldDate: item.soldDate || item.sold_date,
                reservationDate: item.reservationDate || item.reservation_date,
                reservedBy: item.reservedBy || item.reserved_by,
                salesRepresentative: item.salesRepresentative || item.sales_representative,
                reservationNote: item.reservationNote || item.reservation_note,
                customerName: item.customerName || item.customer_name,
                customerPhone: item.customerPhone || item.customer_phone,
                paidAmount: item.paidAmount || item.paid_amount,
                salePrice: item.salePrice || item.sale_price,
                paymentMethod: item.paymentMethod || item.payment_method,
                bankName: item.bankName || item.bank_name,
                soldToCustomerName: item.soldToCustomerName || item.sold_to_customer_name,
                soldToCustomerPhone: item.soldToCustomerPhone || item.sold_to_customer_phone,
                soldBySalesRep: item.soldBySalesRep || item.sold_by_sales_rep,
                saleNotes: item.saleNotes || item.sale_notes,
                mileage: item.mileage
              });
            } catch (e) {
              console.log(`Failed to import inventory item ${item.chassisNumber}:`, e);
            }
          }
        }
      }

      if (selectedTypes.length === 0 || selectedTypes.includes('manufacturers')) {
        if (importData.data.manufacturers) {
          // Clear existing manufacturers
          await db.execute('DELETE FROM manufacturers');
          
          // Insert new manufacturers
          for (const manufacturer of importData.data.manufacturers) {
            try {
              await db.insert(manufacturers).values({
                nameAr: manufacturer.nameAr || manufacturer.name_ar,
                nameEn: manufacturer.nameEn || manufacturer.name_en,
                logo: manufacturer.logo,
                isActive: manufacturer.isActive ?? manufacturer.is_active ?? true
              });
            } catch (e) {
              console.log(`Failed to import manufacturer ${manufacturer.nameAr}:`, e);
            }
          }
        }
      }

      if (selectedTypes.length === 0 || selectedTypes.includes('banks')) {
        if (importData.data.banks) {
          // Clear existing banks
          await db.execute('DELETE FROM banks');
          
          // Insert new banks
          for (const bank of importData.data.banks) {
            try {
              await db.insert(banks).values({
                logo: bank.logo,
                bankName: bank.bankName || bank.bank_name,
                nameEn: bank.nameEn || bank.name_en,
                accountName: bank.accountName || bank.account_name,
                accountNumber: bank.accountNumber || bank.account_number,
                iban: bank.iban,
                type: bank.type,
                isActive: bank.isActive ?? bank.is_active ?? true
              });
            } catch (e) {
              console.log(`Failed to import bank ${bank.bankName}:`, e);
            }
          }
        }
      }

      res.json({ message: "Data imported successfully" });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ message: "Failed to import database" });
    }
  });

  app.post("/api/database/import-from-external", async (req, res) => {
    try {
      const { connectionString, selectedTypes } = req.body;
      
      if (!connectionString) {
        return res.status(400).json({ message: "Connection string is required" });
      }

      // Import from external database using the existing import function
      const { importFromExternalDatabase } = await import('./import-external-db');
      await importFromExternalDatabase(connectionString);
      
      res.json({ message: "External database import completed successfully" });
    } catch (error) {
      console.error("External import error:", error);
      res.status(500).json({ message: "Failed to import from external database" });
    }
  });

  app.post("/api/database/export-to-external", async (req, res) => {
    try {
      const { connectionString } = req.body;
      
      if (!connectionString) {
        return res.status(400).json({ message: "Connection string is required" });
      }

      // Export to external database
      const { exportToExternalDatabase } = await import('./export-to-external');
      await exportToExternalDatabase(connectionString);
      
      res.json({ message: "Database exported to external database successfully" });
    } catch (error) {
      console.error("External export error:", error);
      res.status(500).json({ message: "Failed to export to external database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}