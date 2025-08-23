import type { Express } from "express";
import { createServer, type Server } from "http";
import { getDatabase } from "./db";
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { 
  users, 
  inventoryItems, 
  manufacturers, 
  banks, 
  vehicleCategories, 
  vehicleTrimLevels,
  dailyAttendance,
  employeeWorkSchedules,
  leaveRequests,
  colorAssociations,
  vehicleSpecifications,
  vehicleImageLinks,
  quotations,
  termsConditions,
  priceCards,
  insertPriceCardSchema,
  type PriceCard,
  type InsertPriceCard
} from "@shared/schema";
import { Pool } from 'pg';
import { eq, desc, asc, or, like, count, sql, ne, isNull, isNotNull, and, not } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Helper function to get vehicle specifications from database
const getVehicleSpecifications = async (vehicle: any) => {
  try {
    const { db } = getDatabase();
    
    // First try to find exact match specifications
    const conditions = [
      eq(vehicleSpecifications.manufacturer, vehicle.manufacturer),
      eq(vehicleSpecifications.category, vehicle.category || ''),
      eq(vehicleSpecifications.year, vehicle.year || 0),
      eq(vehicleSpecifications.engineCapacity, vehicle.engineCapacity || '')
    ];

    if (vehicle.trimLevel) {
      conditions.push(eq(vehicleSpecifications.trimLevel, vehicle.trimLevel));
    }

    const specs = await db.select().from(vehicleSpecifications)
      .where(and(...conditions));
    
    if (specs.length > 0) {
      const spec = specs[0];
      if (spec.specifications) {
        try {
          // Parse the JSON specifications
          return typeof spec.specifications === 'object' 
            ? spec.specifications 
            : JSON.parse(spec.specifications);
        } catch (e) {
          console.log('Error parsing specifications JSON:', e);
        }
      }
    }
    
    // If no specifications found, return basic structure
    return {
      "المواصفات الأساسية": {
        "الصانع": vehicle.manufacturer || "غير محدد",
        "الفئة": vehicle.category || "غير محدد",
        "سنة الصنع": vehicle.year?.toString() || "غير محدد",
        "نوع المحرك": vehicle.engineCapacity || "غير محدد",
        "درجة التجهيز": vehicle.trimLevel || "قياسي"
      },
      "معلومات المركبة": {
        "رقم الهيكل": vehicle.chassisNumber || "غير متوفر",
        "اللون الخارجي": vehicle.exteriorColor || "غير محدد",
        "اللون الداخلي": vehicle.interiorColor || "غير محدد",
        "حالة المركبة": vehicle.status || "غير محدد"
      }
    };
  } catch (error) {
    console.error('Error fetching vehicle specifications:', error);
    return {
      "خطأ": "حدث خطأ في جلب المواصفات، يرجى المحاولة مرة أخرى"
    };
  }
};

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

  // Get reserved inventory items
  app.get("/api/inventory/reserved", async (req, res) => {
    try {
      const { db } = getDatabase();
      const items = await db.select().from(inventoryItems).where(eq(inventoryItems.status, "محجوز"));
      res.json(items);
    } catch (error) {
      console.error("Error fetching reserved inventory:", error);
      res.status(500).json({ message: "Failed to fetch reserved inventory items" });
    }
  });

  // Get sold inventory items
  app.get("/api/inventory/sold", async (req, res) => {
    try {
      const { db } = getDatabase();
      const items = await db.select().from(inventoryItems).where(eq(inventoryItems.status, "مباع"));
      res.json(items);
    } catch (error) {
      console.error("Error fetching sold inventory:", error);
      res.status(500).json({ message: "Failed to fetch sold inventory items" });
    }
  });

  // Reserve an inventory item
  app.put("/api/inventory/:id/reserve", async (req, res) => {
    try {
      const { db } = getDatabase();
      const itemId = parseInt(req.params.id);
      const { customerName, customerPhone, salesRepresentative, reservationNote, paidAmount } = req.body;

      // Check if item exists
      const [existingItem] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, itemId));
      if (!existingItem) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Check if item is available
      if (existingItem.status !== "متوفر") {
        return res.status(400).json({ message: "Vehicle is not available for reservation" });
      }

      // Update the inventory item to reserved status
      const [updatedItem] = await db.update(inventoryItems)
        .set({
          status: "محجوز",
          reservationDate: new Date(),
          reservedBy: customerName || "",
          customerName: customerName || "",
          customerPhone: customerPhone || "",
          salesRepresentative: salesRepresentative || "",
          reservationNote: reservationNote || "",
          paidAmount: paidAmount || 0
        })
        .where(eq(inventoryItems.id, itemId))
        .returning();

      res.json(updatedItem);
    } catch (error) {
      console.error("Error reserving inventory item:", error);
      res.status(500).json({ message: "Failed to reserve inventory item" });
    }
  });

  // Cancel reservation for an inventory item
  app.put("/api/inventory/:id/cancel-reservation", async (req, res) => {
    try {
      const { db } = getDatabase();
      const itemId = parseInt(req.params.id);

      // Check if item exists
      const [existingItem] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, itemId));
      if (!existingItem) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Check if item is reserved
      if (existingItem.status !== "محجوز") {
        return res.status(400).json({ message: "Vehicle is not reserved" });
      }

      // Update the inventory item to available status
      const [updatedItem] = await db.update(inventoryItems)
        .set({
          status: "متوفر",
          reservationDate: null,
          reservedBy: null,
          customerName: null,
          customerPhone: null,
          salesRepresentative: null,
          reservationNote: null,
          paidAmount: null
        })
        .where(eq(inventoryItems.id, itemId))
        .returning();

      res.json(updatedItem);
    } catch (error) {
      console.error("Error canceling reservation:", error);
      res.status(500).json({ message: "Failed to cancel reservation" });
    }
  });

  // Sell an inventory item
  app.put("/api/inventory/:id/sell", async (req, res) => {
    try {
      const { db } = getDatabase();
      const itemId = parseInt(req.params.id);
      const { 
        customerName, 
        customerPhone, 
        salesRepresentative, 
        salePrice, 
        paymentMethod, 
        bankName, 
        saleNotes,
        paidAmount 
      } = req.body;

      // Check if item exists
      const [existingItem] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, itemId));
      if (!existingItem) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Check if item is available for sale (available or reserved)
      if (existingItem.status !== "متوفر" && existingItem.status !== "محجوز") {
        return res.status(400).json({ message: "Vehicle is not available for sale" });
      }

      // Update the inventory item to sold status
      const [updatedItem] = await db.update(inventoryItems)
        .set({
          status: "مباع",
          isSold: true,
          soldDate: new Date(),
          soldToCustomerName: customerName || "",
          soldToCustomerPhone: customerPhone || "",
          soldBySalesRep: salesRepresentative || "",
          salePrice: salePrice || 0,
          paymentMethod: paymentMethod || "",
          bankName: bankName || "",
          saleNotes: saleNotes || "",
          paidAmount: paidAmount || 0
        })
        .where(eq(inventoryItems.id, itemId))
        .returning();

      res.json(updatedItem);
    } catch (error) {
      console.error("Error selling inventory item:", error);
      res.status(500).json({ message: "Failed to sell inventory item" });
    }
  });

  // Sell a reserved vehicle specifically (enhanced version with reservation data preserved)
  app.put("/api/inventory/:id/sell-reserved", async (req, res) => {
    try {
      const { db } = getDatabase();
      const itemId = parseInt(req.params.id);
      const { 
        salePrice, 
        saleDate,
        customerName, 
        customerPhone, 
        salesRepresentative, 
        saleNotes 
      } = req.body;

      // Check if item exists
      const [existingItem] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, itemId));
      if (!existingItem) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Check if item is reserved
      if (existingItem.status !== "محجوز") {
        return res.status(400).json({ message: "Vehicle is not reserved for sale" });
      }

      // Update the inventory item to sold status, preserving reservation data
      const [updatedItem] = await db.update(inventoryItems)
        .set({
          status: "مباع",
          isSold: true,
          soldDate: saleDate ? new Date(saleDate) : new Date(),
          soldToCustomerName: customerName || existingItem.customerName || "",
          soldToCustomerPhone: customerPhone || existingItem.customerPhone || "",
          soldBySalesRep: salesRepresentative || existingItem.salesRepresentative || "",
          salePrice: parseFloat(salePrice) || 0,
          saleNotes: saleNotes || "",
          // Preserve the original reservation data
          reservationDate: existingItem.reservationDate,
          reservedBy: existingItem.reservedBy,
          reservationNote: existingItem.reservationNote,
          paidAmount: existingItem.paidAmount
        })
        .where(eq(inventoryItems.id, itemId))
        .returning();

      res.json(updatedItem);
    } catch (error) {
      console.error("Error selling reserved inventory item:", error);
      res.status(500).json({ message: "Failed to sell reserved inventory item" });
    }
  });

  // Update an inventory item
  app.put("/api/inventory/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const itemId = parseInt(req.params.id);
      const updateData = req.body;

      // Check if item exists
      const [existingItem] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, itemId));
      if (!existingItem) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Update the inventory item
      const [updatedItem] = await db.update(inventoryItems)
        .set(updateData)
        .where(eq(inventoryItems.id, itemId))
        .returning();

      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  // Delete an inventory item
  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const itemId = parseInt(req.params.id);

      // Check if item exists
      const [existingItem] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, itemId));
      if (!existingItem) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Delete the inventory item
      await db.delete(inventoryItems).where(eq(inventoryItems.id, itemId));

      res.json({ message: "Vehicle deleted successfully" });
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // Clear all inventory items
  app.delete("/api/inventory/clear-all", async (req, res) => {
    try {
      const { db } = getDatabase();

      // Get count before deletion for logging
      const allItems = await db.select().from(inventoryItems);
      const totalCount = allItems.length;

      // Delete all inventory items
      await db.delete(inventoryItems);

      console.log(`Cleared all inventory: ${totalCount} items deleted`);
      res.json({ 
        message: "All inventory items cleared successfully", 
        deletedCount: totalCount 
      });
    } catch (error) {
      console.error("Error clearing all inventory:", error);
      res.status(500).json({ message: "Failed to clear inventory" });
    }
  });

  // Fix duplicate manufacturers
  app.post("/api/fix-duplicates", async (req, res) => {
    try {
      const { db } = getDatabase();
      
      console.log("🔍 Fixing duplicate manufacturers...");
      
      // Get all manufacturers
      const allManufacturers = await db.select().from(manufacturers).orderBy(manufacturers.nameAr);
      
      // Group by nameAr to find duplicates
      const manufacturerGroups = new Map<string, typeof allManufacturers>();
      
      for (const manufacturer of allManufacturers) {
        const key = manufacturer.nameAr;
        if (!manufacturerGroups.has(key)) {
          manufacturerGroups.set(key, []);
        }
        manufacturerGroups.get(key)!.push(manufacturer);
      }

      // Find duplicates
      const duplicateGroups = Array.from(manufacturerGroups.entries()).filter(([_, group]) => group.length > 1);
      let deletedCount = 0;
      
      for (const [nameAr, group] of duplicateGroups) {
        // Keep the first one (lowest ID), delete others
        const keepManufacturer = group[0];
        const duplicatesToDelete = group.slice(1);
        
        console.log(`Fixing ${nameAr}: keeping ID ${keepManufacturer.id}, deleting ${duplicatesToDelete.length} duplicates`);
        
        // Delete duplicates one by one
        for (const duplicate of duplicatesToDelete) {
          await db.delete(manufacturers).where(eq(manufacturers.id, duplicate.id));
          deletedCount++;
        }
      }
      
      console.log(`✅ Deleted ${deletedCount} duplicate manufacturers`);
      
      // Return updated count
      const finalManufacturers = await db.select().from(manufacturers);
      res.json({ 
        success: true, 
        deletedCount,
        totalManufacturers: finalManufacturers.length,
        message: `تم حذف ${deletedCount} صانع مكرر بنجاح`
      });
      
    } catch (error) {
      console.error("Error fixing duplicates:", error);
      res.status(500).json({ 
        success: false, 
        message: "خطأ في إصلاح التكرار", 
        error: error.message 
      });
    }
  });

  // Create a new inventory item
  app.post("/api/inventory", async (req, res) => {
    try {
      const { db } = getDatabase();
      const vehicleData = req.body;

      // Create new inventory item
      const [newItem] = await db.insert(inventoryItems).values({
        manufacturer: vehicleData.manufacturer,
        category: vehicleData.category,
        trimLevel: vehicleData.trimLevel,
        engineCapacity: vehicleData.engineCapacity,
        year: vehicleData.year,
        exteriorColor: vehicleData.exteriorColor,
        interiorColor: vehicleData.interiorColor,
        status: vehicleData.status || "متوفر",
        importType: vehicleData.importType || "شخصي",
        ownershipType: vehicleData.ownershipType || "ملك الشركة",
        location: vehicleData.location,
        chassisNumber: vehicleData.chassisNumber,
        images: vehicleData.images || [],
        logo: vehicleData.logo,
        notes: vehicleData.notes,
        detailedSpecifications: vehicleData.detailedSpecifications,
        price: vehicleData.price,
        mileage: vehicleData.mileage
      }).returning();

      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(500).json({ message: "Failed to create inventory item" });
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
      const allManufacturers = await db.select().from(manufacturers);
      
      const manufacturerStats = new Map();
      
      // Create a map for manufacturers with their logos
      const manufacturerLogos = new Map();
      allManufacturers.forEach(mfg => {
        manufacturerLogos.set(mfg.nameAr, mfg.logo);
      });
      
      allItems.forEach(item => {
        const key = item.manufacturer;
        if (!manufacturerStats.has(key)) {
          manufacturerStats.set(key, {
            manufacturer: key,
            total: 0,
            personal: 0,
            company: 0,
            usedPersonal: 0,
            logo: manufacturerLogos.get(key) || null
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

  // Get hierarchical manufacturers (for filtering)
  app.get("/api/hierarchical/manufacturers", async (req, res) => {
    try {
      const { db } = getDatabase();
      const allManufacturers = await db.select().from(manufacturers);
      res.json(allManufacturers);
    } catch (error) {
      console.error("Error fetching hierarchical manufacturers:", error);
      res.status(500).json({ message: "Failed to fetch hierarchical manufacturers" });
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

  // Get banks by type (only active banks for display)
  app.get("/api/banks/type/:type", async (req, res) => {
    try {
      const { db } = getDatabase();
      const { type } = req.params;
      const banksByType = await db.select().from(banks).where(
        and(
          eq(banks.type, type),
          eq(banks.isActive, true)
        )
      );
      res.json(banksByType);
    } catch (error) {
      console.error("Error fetching banks by type:", error);
      res.status(500).json({ message: "Failed to fetch banks by type" });
    }
  });

  // Create new bank
  app.post("/api/banks", async (req, res) => {
    try {
      const { db } = getDatabase();
      const bankData = req.body;
      
      const [newBank] = await db.insert(banks).values({
        logo: bankData.logo || null,
        bankName: bankData.bankName,
        nameEn: bankData.nameEn || null,
        accountName: bankData.accountName,
        accountNumber: bankData.accountNumber,
        iban: bankData.iban,
        type: bankData.type,
        isActive: bankData.isActive ?? true
      }).returning();

      res.json(newBank);
    } catch (error) {
      console.error("Error creating bank:", error);
      res.status(500).json({ message: "Failed to create bank" });
    }
  });

  // Update bank
  app.put("/api/banks/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const bankId = parseInt(req.params.id);
      const bankData = req.body;
      
      const [updatedBank] = await db.update(banks)
        .set({
          logo: bankData.logo,
          bankName: bankData.bankName,
          nameEn: bankData.nameEn,
          accountName: bankData.accountName,
          accountNumber: bankData.accountNumber,
          iban: bankData.iban,
          type: bankData.type,
          isActive: bankData.isActive,
          updatedAt: new Date()
        })
        .where(eq(banks.id, bankId))
        .returning();

      if (!updatedBank) {
        return res.status(404).json({ message: "Bank not found" });
      }

      res.json(updatedBank);
    } catch (error) {
      console.error("Error updating bank:", error);
      res.status(500).json({ message: "Failed to update bank" });
    }
  });

  // Delete bank
  app.delete("/api/banks/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const bankId = parseInt(req.params.id);
      
      const [deletedBank] = await db.delete(banks)
        .where(eq(banks.id, bankId))
        .returning();

      if (!deletedBank) {
        return res.status(404).json({ message: "Bank not found" });
      }

      res.json({ message: "Bank deleted successfully" });
    } catch (error) {
      console.error("Error deleting bank:", error);
      res.status(500).json({ message: "Failed to delete bank" });
    }
  });

  // Get banks by type
  app.get("/api/banks/type/:type", async (req, res) => {
    try {
      const { db } = getDatabase();
      const { type } = req.params;
      const decodedType = decodeURIComponent(type);
      
      const banksByType = await db.select().from(banks).where(eq(banks.type, decodedType));
      res.json(banksByType);
    } catch (error) {
      console.error("Error fetching banks by type:", error);
      res.status(500).json({ message: "Failed to fetch banks by type" });
    }
  });

  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const { db } = getDatabase();
      const allUsers = await db.select().from(users);
      
      // Remove password from response for security
      const usersWithoutPassword = allUsers.map(user => ({
        id: user.id,
        name: user.name,
        jobTitle: user.jobTitle,
        phoneNumber: user.phoneNumber,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }));
      
      res.json(usersWithoutPassword);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get all vehicle categories
  app.get("/api/vehicle-categories", async (req, res) => {
    try {
      const { db } = getDatabase();
      const allCategories = await db.select().from(vehicleCategories);
      res.json(allCategories);
    } catch (error) {
      console.error("Error fetching vehicle categories:", error);
      res.status(500).json({ message: "Failed to fetch vehicle categories" });
    }
  });

  // Get all vehicle trim levels
  app.get("/api/vehicle-trim-levels", async (req, res) => {
    try {
      const { db } = getDatabase();
      const allTrimLevels = await db.select().from(vehicleTrimLevels);
      res.json(allTrimLevels);
    } catch (error) {
      console.error("Error fetching vehicle trim levels:", error);
      res.status(500).json({ message: "Failed to fetch vehicle trim levels" });
    }
  });

  // Get hierarchical data (manufacturers with categories and trim levels)
  app.get("/api/hierarchy/full", async (req, res) => {
    try {
      const { db } = getDatabase();
      
      const manufacturersData = await db.select().from(manufacturers);
      const categoriesData = await db.select().from(vehicleCategories);
      const trimLevelsData = await db.select().from(vehicleTrimLevels);
      
      // Build hierarchy
      const hierarchy = manufacturersData.map(manufacturer => ({
        ...manufacturer,
        categories: categoriesData
          .filter(category => category.manufacturerId === manufacturer.id)
          .map(category => ({
            ...category,
            trimLevels: trimLevelsData.filter(trimLevel => trimLevel.categoryId === category.id)
          }))
      }));
      
      res.json(hierarchy);
    } catch (error) {
      console.error("Error fetching hierarchy:", error);
      res.status(500).json({ message: "Failed to fetch hierarchy" });
    }
  });

  // Get hierarchical manufacturers
  app.get("/api/hierarchical/manufacturers", async (req, res) => {
    try {
      const { db } = getDatabase();
      const manufacturersData = await db.select().from(manufacturers).where(eq(manufacturers.isActive, true));
      res.json(manufacturersData);
    } catch (error) {
      console.error("Error fetching hierarchical manufacturers:", error);
      res.status(500).json({ message: "Failed to fetch hierarchical manufacturers" });
    }
  });

  // Get categories by manufacturer (by name via query parameter)
  app.get("/api/hierarchical/categories", async (req, res) => {
    try {
      const { db } = getDatabase();
      const { manufacturer } = req.query;
      
      if (!manufacturer) {
        return res.status(400).json({ message: "Manufacturer name is required" });
      }

      // First find the manufacturer by name
      const [manufacturerData] = await db.select().from(manufacturers)
        .where(and(eq(manufacturers.nameAr, manufacturer as string), eq(manufacturers.isActive, true)));
      
      if (!manufacturerData) {
        return res.status(404).json({ message: "Manufacturer not found" });
      }

      // Then get categories for this manufacturer
      const categoriesData = await db.select().from(vehicleCategories)
        .where(and(eq(vehicleCategories.manufacturerId, manufacturerData.id), eq(vehicleCategories.isActive, true)));
      
      res.json(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get categories by manufacturer ID (keeping the original endpoint for backward compatibility)
  app.get("/api/hierarchical/categories/:manufacturerId", async (req, res) => {
    try {
      const { db } = getDatabase();
      const manufacturerId = parseInt(req.params.manufacturerId);
      const categoriesData = await db.select().from(vehicleCategories)
        .where(and(eq(vehicleCategories.manufacturerId, manufacturerId), eq(vehicleCategories.isActive, true)));
      res.json(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get trim levels by manufacturer and category names (via query parameters)
  app.get("/api/hierarchical/trimLevels", async (req, res) => {
    try {
      const { db } = getDatabase();
      const { manufacturer, category } = req.query;
      
      if (!manufacturer || !category) {
        return res.status(400).json({ message: "Manufacturer and category names are required" });
      }

      // First find the manufacturer by name
      const [manufacturerData] = await db.select().from(manufacturers)
        .where(and(eq(manufacturers.nameAr, manufacturer as string), eq(manufacturers.isActive, true)));
      
      if (!manufacturerData) {
        return res.status(404).json({ message: "Manufacturer not found" });
      }

      // Then find the category for this manufacturer
      const [categoryData] = await db.select().from(vehicleCategories)
        .where(and(
          eq(vehicleCategories.manufacturerId, manufacturerData.id),
          eq(vehicleCategories.nameAr, category as string),
          eq(vehicleCategories.isActive, true)
        ));
      
      if (!categoryData) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Finally get trim levels for this category
      const trimLevelsData = await db.select().from(vehicleTrimLevels)
        .where(and(eq(vehicleTrimLevels.categoryId, categoryData.id), eq(vehicleTrimLevels.isActive, true)));
      
      res.json(trimLevelsData);
    } catch (error) {
      console.error("Error fetching trim levels:", error);
      res.status(500).json({ message: "Failed to fetch trim levels" });
    }
  });

  // Get trim levels by category ID (keeping the original endpoint for backward compatibility)
  app.get("/api/hierarchical/trim-levels/:categoryId", async (req, res) => {
    try {
      const { db } = getDatabase();
      const categoryId = parseInt(req.params.categoryId);
      const trimLevelsData = await db.select().from(vehicleTrimLevels)
        .where(and(eq(vehicleTrimLevels.categoryId, categoryId), eq(vehicleTrimLevels.isActive, true)));
      res.json(trimLevelsData);
    } catch (error) {
      console.error("Error fetching trim levels:", error);
      res.status(500).json({ message: "Failed to fetch trim levels" });
    }
  });

  // Manufacturers management
  // Get all manufacturers (including inactive)
  app.get("/api/manufacturers", async (req, res) => {
    try {
      const { db } = getDatabase();
      const manufacturersData = await db.select().from(manufacturers);
      res.json(manufacturersData);
    } catch (error) {
      console.error("Error fetching manufacturers:", error);
      res.status(500).json({ message: "Failed to fetch manufacturers" });
    }
  });

  // Add new manufacturer
  app.post("/api/manufacturers", async (req, res) => {
    try {
      const { db } = getDatabase();
      const { nameAr, nameEn, logo } = req.body;

      if (!nameAr?.trim()) {
        return res.status(400).json({ message: "الاسم بالعربية مطلوب" });
      }

      // Check if manufacturer already exists
      const existingManufacturer = await db.select()
        .from(manufacturers)
        .where(eq(manufacturers.nameAr, nameAr.trim()))
        .limit(1);

      if (existingManufacturer.length > 0) {
        return res.status(400).json({ message: "اسم الشركة المصنعة موجود بالفعل" });
      }

      const [newManufacturer] = await db.insert(manufacturers)
        .values({
          nameAr: nameAr.trim(),
          nameEn: nameEn?.trim() || null,
          logo: logo || null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      res.json(newManufacturer);
    } catch (error) {
      console.error("Error creating manufacturer:", error);
      res.status(500).json({ message: "فشل في إضافة الشركة المصنعة" });
    }
  });

  // Update manufacturer
  app.put("/api/manufacturers/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const manufacturerId = parseInt(req.params.id);
      const { nameAr, nameEn, logo, isActive } = req.body;

      if (!nameAr?.trim()) {
        return res.status(400).json({ message: "الاسم بالعربية مطلوب" });
      }

      // Skip duplicate name check for now to avoid complexity

      const [updatedManufacturer] = await db.update(manufacturers)
        .set({
          nameAr: nameAr.trim(),
          nameEn: nameEn?.trim() || null,
          logo: logo || null,
          isActive: isActive !== undefined ? isActive : true,
          updatedAt: new Date()
        })
        .where(eq(manufacturers.id, manufacturerId))
        .returning();

      if (!updatedManufacturer) {
        return res.status(404).json({ message: "الشركة المصنعة غير موجودة" });
      }

      res.json(updatedManufacturer);
    } catch (error) {
      console.error("Error updating manufacturer:", error);
      res.status(500).json({ message: "فشل في تحديث الشركة المصنعة" });
    }
  });

  // Delete manufacturer
  app.delete("/api/manufacturers/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const manufacturerId = parseInt(req.params.id);

      // Check if manufacturer has associated categories or vehicles
      const associatedCategories = await db.select()
        .from(vehicleCategories)
        .where(eq(vehicleCategories.manufacturerId, manufacturerId))
        .limit(1);

      const associatedVehicles = await db.select()
        .from(inventoryItems)
        .where(eq(inventoryItems.manufacturer, manufacturerId.toString()))
        .limit(1);

      if (associatedCategories.length > 0 || associatedVehicles.length > 0) {
        return res.status(400).json({ 
          message: "لا يمكن حذف الشركة المصنعة لأنها مرتبطة بفئات أو مركبات موجودة" 
        });
      }

      const [deletedManufacturer] = await db.delete(manufacturers)
        .where(eq(manufacturers.id, manufacturerId))
        .returning();

      if (!deletedManufacturer) {
        return res.status(404).json({ message: "الشركة المصنعة غير موجودة" });
      }

      res.json({ message: "تم حذف الشركة المصنعة بنجاح", deletedManufacturer });
    } catch (error) {
      console.error("Error deleting manufacturer:", error);
      res.status(500).json({ message: "فشل في حذف الشركة المصنعة" });
    }
  });

  // Toggle manufacturer active status
  app.put("/api/manufacturers/:id/toggle", async (req, res) => {
    try {
      const { db } = getDatabase();
      const manufacturerId = parseInt(req.params.id);
      const { isActive } = req.body;

      const [updatedManufacturer] = await db.update(manufacturers)
        .set({
          isActive: isActive,
          updatedAt: new Date()
        })
        .where(eq(manufacturers.id, manufacturerId))
        .returning();

      if (!updatedManufacturer) {
        return res.status(404).json({ message: "Manufacturer not found" });
      }

      res.json(updatedManufacturer);
    } catch (error) {
      console.error("Error toggling manufacturer status:", error);
      res.status(500).json({ message: "Failed to toggle manufacturer status" });
    }
  });

  // Categories management
  // Get all categories (including inactive) with optional manufacturer filter
  app.get("/api/categories", async (req, res) => {
    try {
      const { db } = getDatabase();
      const { manufacturerId } = req.query;
      
      let query = db.select().from(vehicleCategories);
      
      // Filter by manufacturer if provided
      if (manufacturerId) {
        query = query.where(eq(vehicleCategories.manufacturerId, parseInt(manufacturerId as string)));
      }
      
      const categoriesData = await query;
      res.json(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Toggle category active status
  app.put("/api/categories/:id/toggle", async (req, res) => {
    try {
      const { db } = getDatabase();
      const categoryId = parseInt(req.params.id);
      const { isActive } = req.body;

      const [updatedCategory] = await db.update(vehicleCategories)
        .set({
          isActive: isActive,
          updatedAt: new Date()
        })
        .where(eq(vehicleCategories.id, categoryId))
        .returning();

      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(updatedCategory);
    } catch (error) {
      console.error("Error toggling category status:", error);
      res.status(500).json({ message: "Failed to toggle category status" });
    }
  });

  // Trim levels management
  // Get all trim levels (including inactive) with optional category filter
  app.get("/api/trim-levels", async (req, res) => {
    try {
      const { db } = getDatabase();
      const { categoryId } = req.query;
      
      let query = db.select().from(vehicleTrimLevels);
      
      // Filter by category if provided
      if (categoryId) {
        query = query.where(eq(vehicleTrimLevels.categoryId, parseInt(categoryId as string)));
      }
      
      const trimLevelsData = await query;
      res.json(trimLevelsData);
    } catch (error) {
      console.error("Error fetching trim levels:", error);
      res.status(500).json({ message: "Failed to fetch trim levels" });
    }
  });

  // Toggle trim level active status
  app.put("/api/trim-levels/:id/toggle", async (req, res) => {
    try {
      const { db } = getDatabase();
      const trimLevelId = parseInt(req.params.id);
      const { isActive } = req.body;

      const [updatedTrimLevel] = await db.update(vehicleTrimLevels)
        .set({
          isActive: isActive,
          updatedAt: new Date()
        })
        .where(eq(vehicleTrimLevels.id, trimLevelId))
        .returning();

      if (!updatedTrimLevel) {
        return res.status(404).json({ message: "Trim level not found" });
      }

      res.json(updatedTrimLevel);
    } catch (error) {
      console.error("Error toggling trim level status:", error);
      res.status(500).json({ message: "Failed to toggle trim level status" });
    }
  });

  // User management routes
  // Create new user
  app.post("/api/users", async (req, res) => {
    try {
      const { name, username, password, role, jobTitle, phoneNumber } = req.body;
      
      if (!name || !username || !password || !role) {
        return res.status(400).json({ message: "Missing required fields: name, username, password, role" });
      }

      const { db } = getDatabase();
      
      // Check if username already exists
      const [existingUser] = await db.select().from(users).where(eq(users.username, username));
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user
      const [newUser] = await db.insert(users).values({
        name,
        username,
        password: hashedPassword,
        role,
        jobTitle: jobTitle || '',
        phoneNumber: phoneNumber || '',
        createdAt: new Date()
      }).returning();

      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update existing user
  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { name, username, password, role, jobTitle, phoneNumber } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const { db } = getDatabase();
      
      // Check if user exists
      const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if username already exists for another user
      if (username && username !== existingUser.username) {
        const [userWithSameUsername] = await db.select().from(users).where(eq(users.username, username));
        if (userWithSameUsername && userWithSameUsername.id !== userId) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }

      // Prepare update data
      const updateData: any = {};
      if (name) updateData.name = name;
      if (username) updateData.username = username;
      if (role) updateData.role = role;
      if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

      // Hash new password if provided
      if (password && password.trim() !== '') {
        updateData.password = await bcrypt.hash(password, 12);
      }

      // Update user
      const [updatedUser] = await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      // Return user without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      if (!userId) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const { db } = getDatabase();
      
      // Check if user exists
      const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete user
      await db.delete(users).where(eq(users.id, userId));

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Attendance management endpoints with role-based access
  app.get("/api/daily-attendance", async (req, res) => {
    try {
      const { db } = getDatabase();
      
      // Temporarily disable authentication to test the data
      console.log("📋 Fetching daily attendance...");
      
      const attendanceData = await db.select().from(dailyAttendance).orderBy(desc(dailyAttendance.date));

      console.log(`📊 Found ${attendanceData.length} attendance records`);
      res.json(attendanceData);
    } catch (error) {
      console.error("Error fetching daily attendance:", error);
      res.status(500).json({ message: "Failed to fetch daily attendance" });
    }
  });

  app.get("/api/employee-work-schedules", async (req, res) => {
    try {
      const { db } = getDatabase();
      
      // Temporarily disable authentication to test the data
      // TODO: Fix authentication system
      console.log("📋 Fetching work schedules...");
      
      const scheduleData = await db.select().from(employeeWorkSchedules)
        .where(eq(employeeWorkSchedules.isActive, true))
        .orderBy(employeeWorkSchedules.employeeName);

      console.log(`📊 Found ${scheduleData.length} work schedules`);
      res.json(scheduleData);
    } catch (error) {
      console.error("Error fetching work schedules:", error);
      res.status(500).json({ message: "Failed to fetch work schedules" });
    }
  });

  app.get("/api/leave-requests", async (req, res) => {
    try {
      const { db } = getDatabase();
      
      // Temporarily disable authentication to test the data
      console.log("📋 Fetching leave requests...");
      
      const leaveData = await db.select().from(leaveRequests).orderBy(desc(leaveRequests.createdAt));

      console.log(`📊 Found ${leaveData.length} leave requests`);
      res.json(leaveData);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  // Create leave request
  app.post("/api/leave-requests", async (req, res) => {
    try {
      const { db } = getDatabase();
      
      if (!req.session?.passport?.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.session.passport.user.id;
      const userName = req.session.passport.user.username;

      const { requestType, startDate, endDate, duration, durationType, reason } = req.body;

      const [newRequest] = await db.insert(leaveRequests).values({
        userId,
        userName,
        requestType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        duration,
        durationType,
        reason,
        requestedBy: userId,
        requestedByName: userName,
        status: "pending"
      }).returning();

      res.json(newRequest);
    } catch (error) {
      console.error("Error creating leave request:", error);
      res.status(500).json({ message: "Failed to create leave request" });
    }
  });

  // Update leave request status
  app.put("/api/leave-requests/:id/status", async (req, res) => {
    try {
      const { db } = getDatabase();
      
      if (!req.session?.passport?.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userRole = req.session.passport.user.role;
      const userId = req.session.passport.user.id;
      const userName = req.session.passport.user.username;

      // Only admin and sales_manager can approve/reject requests
      if (userRole !== 'admin' && userRole !== 'sales_manager') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const requestId = parseInt(req.params.id);
      const { status, rejectionReason } = req.body;

      const updateData: any = {
        status,
        approvedBy: userId,
        approvedByName: userName,
        approvedAt: new Date(),
        updatedAt: new Date()
      };

      if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      const [updatedRequest] = await db.update(leaveRequests)
        .set(updateData)
        .where(eq(leaveRequests.id, requestId))
        .returning();

      if (!updatedRequest) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating leave request:", error);
      res.status(500).json({ message: "Failed to update leave request" });
    }
  });

  // Create employee work schedule
  app.post("/api/employee-work-schedules", async (req, res) => {
    try {
      const { db } = getDatabase();
      
      // Temporarily disable authentication for work schedule system
      // if (!req.session?.passport?.user?.id) {
      //   return res.status(401).json({ message: "Authentication required" });
      // }

      const userRole = req.session?.passport?.user?.role || 'admin';

      // Temporarily disable role checking
      // if (userRole !== 'admin' && userRole !== 'sales_manager') {
      //   return res.status(403).json({ message: "Insufficient permissions" });
      // }

      const scheduleData = req.body;
      
      const [newSchedule] = await db.insert(employeeWorkSchedules).values({
        ...scheduleData,
        isActive: true
      }).returning();

      res.json(newSchedule);
    } catch (error) {
      console.error("Error creating work schedule:", error);
      res.status(500).json({ message: "Failed to create work schedule" });
    }
  });

  // Update employee work schedule
  app.put("/api/employee-work-schedules/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const scheduleId = parseInt(req.params.id);
      
      // Temporarily disable authentication for work schedule system
      // if (!req.session?.passport?.user?.id) {
      //   return res.status(401).json({ message: "Authentication required" });
      // }

      const userRole = req.session?.passport?.user?.role || 'admin';

      // Temporarily disable role checking
      // if (userRole !== 'admin' && userRole !== 'sales_manager') {
      //   return res.status(403).json({ message: "Insufficient permissions" });
      // }

      const updateData = req.body;
      
      const [updatedSchedule] = await db.update(employeeWorkSchedules)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(employeeWorkSchedules.id, scheduleId))
        .returning();

      if (!updatedSchedule) {
        return res.status(404).json({ message: "Work schedule not found" });
      }

      res.json(updatedSchedule);
    } catch (error) {
      console.error("Error updating work schedule:", error);
      res.status(500).json({ message: "Failed to update work schedule" });
    }
  });

  // Delete employee work schedule
  app.delete("/api/employee-work-schedules/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const scheduleId = parseInt(req.params.id);
      
      // Temporarily disable authentication for work schedule system
      // if (!req.session?.passport?.user?.id) {
      //   return res.status(401).json({ message: "Authentication required" });
      // }

      const userRole = req.session?.passport?.user?.role || 'admin';

      // Temporarily disable role checking
      // if (userRole !== 'admin' && userRole !== 'sales_manager') {
      //   return res.status(403).json({ message: "Insufficient permissions" });
      // }

      const [deletedSchedule] = await db.delete(employeeWorkSchedules)
        .where(eq(employeeWorkSchedules.id, scheduleId))
        .returning();

      if (!deletedSchedule) {
        return res.status(404).json({ message: "Work schedule not found" });
      }

      res.json({ message: "Work schedule deleted successfully", deletedSchedule });
    } catch (error) {
      console.error("Error deleting work schedule:", error);
      res.status(500).json({ message: "Failed to delete work schedule" });
    }
  });

  // Create daily attendance record
  app.post("/api/daily-attendance", async (req, res) => {
    try {
      const { db } = getDatabase();
      
      // Temporarily disable authentication for attendance system
      // if (!req.session?.passport?.user?.id) {
      //   return res.status(401).json({ message: "Authentication required" });
      // }

      // Temporarily use default values for authentication fields
      const userRole = req.session?.passport?.user?.role || 'admin';
      const createdBy = req.session?.passport?.user?.id || 1;
      const createdByName = req.session?.passport?.user?.username || 'admin';

      // Temporarily disable role checking
      // if (userRole !== 'admin' && userRole !== 'sales_manager') {
      //   return res.status(403).json({ message: "Insufficient permissions" });
      // }

      const attendanceData = {
        ...req.body,
        createdBy,
        createdByName,
        date: new Date(req.body.date),
        scheduleType: req.body.scheduleType || 'متصل' // إضافة نوع الدوام
      };
      
      const [newAttendance] = await db.insert(dailyAttendance).values(attendanceData).returning();

      res.json(newAttendance);
    } catch (error) {
      console.error("Error creating attendance record:", error);
      res.status(500).json({ message: "Failed to create attendance record" });
    }
  });

  // Update daily attendance record
  app.put("/api/daily-attendance/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      
      // Temporarily disable authentication for attendance system
      // if (!req.session?.passport?.user?.id) {
      //   return res.status(401).json({ message: "Authentication required" });
      // }

      const userRole = req.session?.passport?.user?.role || 'admin';
      const userId = req.session?.passport?.user?.id || 1;

      const attendanceId = parseInt(req.params.id);
      
      // Check if user can edit this record
      const [existingRecord] = await db.select()
        .from(dailyAttendance)
        .where(eq(dailyAttendance.id, attendanceId));

      if (!existingRecord) {
        return res.status(404).json({ message: "Attendance record not found" });
      }

      // Temporarily disable permissions check for attendance
      // if (userRole !== 'admin' && userRole !== 'sales_manager' && existingRecord.employeeId !== userId) {
      //   return res.status(403).json({ message: "Insufficient permissions" });
      // }

      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      // Convert date fields to proper Date objects if they exist
      if (updateData.date && typeof updateData.date === 'string') {
        updateData.date = new Date(updateData.date);
      }
      if (updateData.createdAt && typeof updateData.createdAt === 'string') {
        updateData.createdAt = new Date(updateData.createdAt);
      }
      
      const [updatedAttendance] = await db.update(dailyAttendance)
        .set(updateData)
        .where(eq(dailyAttendance.id, attendanceId))
        .returning();

      res.json(updatedAttendance);
    } catch (error) {
      console.error("Error updating attendance record:", error);
      res.status(500).json({ message: "Failed to update attendance record" });
    }
  });

  // Mark day as holiday endpoint
  app.post("/api/daily-attendance/holiday", async (req, res) => {
    try {
      const { db } = getDatabase();
      const { employeeId, date, isHoliday } = req.body;
      
      if (!employeeId || !date) {
        return res.status(400).json({ message: "Employee ID and date are required" });
      }

      // Get employee information first
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, parseInt(employeeId)))
        .limit(1);
      
      if (!user) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const dateObj = new Date(date + 'T00:00:00');
      
      // Check if attendance record exists for this employee and date
      const [existingAttendance] = await db.select()
        .from(dailyAttendance)
        .where(
          and(
            eq(dailyAttendance.employeeId, parseInt(employeeId)),
            eq(dailyAttendance.date, dateObj)
          )
        )
        .limit(1);

      if (existingAttendance) {
        // Update existing record to mark as holiday or remove holiday marking
        const updatedNotes = isHoliday ? 'إجازة' : (existingAttendance.notes === 'إجازة' ? null : existingAttendance.notes);
        
        const [updatedAttendance] = await db.update(dailyAttendance)
          .set({
            notes: updatedNotes,
            updatedAt: new Date()
          })
          .where(eq(dailyAttendance.id, existingAttendance.id))
          .returning();
          
        res.json(updatedAttendance);
      } else {
        // Create new holiday record with proper employee info
        const attendanceData = {
          employeeId: parseInt(employeeId),
          employeeName: user.name,
          date: dateObj,
          scheduleType: "متصل",
          notes: isHoliday ? 'إجازة' : null,
          createdBy: req.session?.passport?.user?.id || 1,
          createdByName: req.session?.passport?.user?.username || 'admin'
        };
        
        const [newAttendance] = await db.insert(dailyAttendance)
          .values(attendanceData)
          .returning();
          
        res.status(201).json(newAttendance);
      }
    } catch (error) {
      console.error("Error marking holiday:", error);
      res.status(500).json({ message: "Failed to mark day as holiday" });
    }
  });

  // Database synchronization endpoint
  app.post("/api/database/sync-external", async (req, res) => {
    try {
      const { syncExternalDatabase } = await import("./sync-external-db");
      const result = await syncExternalDatabase();
      
      if (result.success) {
        res.json({
          message: "Database synchronized successfully",
          counts: result.counts
        });
      } else {
        res.status(500).json({
          message: "Failed to synchronize database",
          error: result.error
        });
      }
    } catch (error) {
      console.error("Error in sync endpoint:", error);
      res.status(500).json({ message: "Failed to synchronize database" });
    }
  });

  // Vehicle data endpoints
  app.get("/api/vehicle-years", async (req, res) => {
    try {
      const { db } = getDatabase();
      const items = await db.select().from(inventoryItems);
      const uniqueYears = [...new Set(items.map((item: any) => item.year))].sort((a: any, b: any) => b - a);
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
        .map((item: any) => item.engineCapacity)
        .filter((capacity: any) => capacity && capacity.trim() !== ""))]
        .sort();
      res.json(uniqueEngineCapacities);
    } catch (error) {
      console.error("Error fetching engine capacities:", error);
      res.status(500).json({ message: "Failed to fetch engine capacities" });
    }
  });

  // Get hierarchical colors (color associations)
  app.get("/api/hierarchical/colors", async (req, res) => {
    try {
      const { db } = getDatabase();
      const { manufacturer, category, trimLevel, colorType } = req.query;
      
      let query = db.select().from(colorAssociations).where(eq(colorAssociations.isActive, true));
      
      // Add filters if provided
      if (manufacturer) {
        query = query.where(eq(colorAssociations.manufacturer, manufacturer as string));
      }
      if (category) {
        query = query.where(eq(colorAssociations.category, category as string));
      }
      if (trimLevel) {
        query = query.where(eq(colorAssociations.trimLevel, trimLevel as string));
      }
      if (colorType) {
        query = query.where(eq(colorAssociations.colorType, colorType as string));
      }
      
      const colors = await query;
      res.json(colors);
    } catch (error) {
      console.error("Error fetching hierarchical colors:", error);
      res.status(500).json({ message: "Failed to fetch hierarchical colors" });
    }
  });

  // Get vehicle specifications
  app.get("/api/vehicle-specifications", async (req, res) => {
    try {
      const { db } = getDatabase();
      const specifications = await db.select().from(vehicleSpecifications);
      res.json(specifications);
    } catch (error) {
      console.error("Error fetching vehicle specifications:", error);
      res.status(500).json({ message: "Failed to fetch vehicle specifications" });
    }
  });

  // Get specifications by chassis number with fallback to general specifications
  app.get("/api/specifications-by-chassis/:chassisNumber", async (req, res) => {
    try {
      const { db } = getDatabase();
      const { chassisNumber } = req.params;
      
      console.log(`🔍 Fetching specifications for chassis: ${chassisNumber}`);

      // First, try to find specifications by chassis number
      const chassisSpecs = await db.select().from(vehicleSpecifications)
        .where(eq(vehicleSpecifications.chassisNumber, chassisNumber));
      
      if (chassisSpecs.length > 0) {
        console.log(`📋 Found chassis-specific specifications`);
        const spec = chassisSpecs[0];
        
        // Parse the specifications JSON if it exists
        let parsedSpecs = {};
        if (spec.specifications) {
          try {
            // Check if it's already an object
            if (typeof spec.specifications === 'object') {
              parsedSpecs = spec.specifications;
            } else {
              // Try to parse as JSON first
              parsedSpecs = JSON.parse(spec.specifications);
            }
          } catch (e) {
            console.log('Error parsing specifications JSON:', e);
            // If JSON parsing fails, treat as raw text
            parsedSpecs = {
              "المواصفات العامة": spec.specifications.toString() || "غير متوفر",
              "نوع المحرك": spec.engineCapacity || "غير محدد",
              "سنة الصنع": spec.year?.toString() || "غير محدد",
              "الفئة": spec.category || "غير محدد"
            };
          }
        }

        return res.json({
          id: spec.id,
          manufacturer: spec.manufacturer,
          category: spec.category,
          trimLevel: spec.trimLevel,
          year: spec.year,
          engineCapacity: spec.engineCapacity,
          chassisNumber: spec.chassisNumber,
          specifications: parsedSpecs,
          specificationsEn: spec.specificationsEn,
          source: 'chassis'
        });
      }

      // If no chassis-specific specs found, look for vehicle in inventory
      const [vehicle] = await db.select().from(inventoryItems)
        .where(eq(inventoryItems.chassisNumber, chassisNumber));
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Look for general specifications matching vehicle details
      const conditions = [
        eq(vehicleSpecifications.manufacturer, vehicle.manufacturer),
        eq(vehicleSpecifications.category, vehicle.category),
        eq(vehicleSpecifications.year, vehicle.year),
        eq(vehicleSpecifications.engineCapacity, vehicle.engineCapacity)
      ];

      if (vehicle.trimLevel) {
        conditions.push(eq(vehicleSpecifications.trimLevel, vehicle.trimLevel));
      }

      const generalSpecs = await db.select().from(vehicleSpecifications)
        .where(and(...conditions));
      
      if (generalSpecs.length > 0) {
        console.log(`📋 Found general specifications for vehicle`);
        const spec = generalSpecs[0];
        
        let parsedSpecs = {};
        if (spec.specifications) {
          try {
            // Check if it's already an object
            if (typeof spec.specifications === 'object') {
              parsedSpecs = spec.specifications;
            } else {
              // Try to parse as JSON first
              parsedSpecs = JSON.parse(spec.specifications);
            }
          } catch (e) {
            console.log('Error parsing specifications JSON:', e);
            // If JSON parsing fails, treat as raw text
            parsedSpecs = {
              "المواصفات العامة": spec.specifications.toString() || "غير متوفر",
              "نوع المحرك": spec.engineCapacity || "غير محدد",
              "سنة الصنع": spec.year?.toString() || "غير محدد",
              "الفئة": spec.category || "غير محدد"
            };
          }
        }

        return res.json({
          id: spec.id,
          manufacturer: spec.manufacturer,
          category: spec.category,
          trimLevel: spec.trimLevel,
          year: spec.year,
          engineCapacity: spec.engineCapacity,
          chassisNumber: null,
          specifications: parsedSpecs,
          specificationsEn: spec.specificationsEn,
          source: 'general'
        });
      }

      // No specifications found, return default
      console.log(`📝 No specifications found, returning default structure`);
      res.json({
        manufacturer: vehicle.manufacturer,
        category: vehicle.category,
        trimLevel: vehicle.trimLevel,
        year: vehicle.year,
        engineCapacity: vehicle.engineCapacity,
        chassisNumber: vehicle.chassisNumber,
        specifications: await getVehicleSpecifications(vehicle),
        specificationsEn: null,
        source: 'default'
      });

    } catch (error) {
      console.error("Error fetching specifications by chassis:", error);
      res.status(500).json({ message: "Failed to fetch vehicle specifications" });
    }
  });

  // Get specific vehicle specifications by parameters - for quotation page
  app.get("/api/specifications/:manufacturer/:category/:trimLevel?/:year/:engineCapacity", async (req, res) => {
    try {
      const { db } = getDatabase();
      const { manufacturer, category, trimLevel, year, engineCapacity } = req.params;
      
      console.log(`🔍 Fetching specifications for: ${manufacturer} ${category} ${trimLevel || 'any'} ${year} ${engineCapacity}`);

      // Build query with exact matching
      const conditions = [
        eq(vehicleSpecifications.manufacturer, manufacturer),
        eq(vehicleSpecifications.category, category),
        eq(vehicleSpecifications.year, parseInt(year)),
        eq(vehicleSpecifications.engineCapacity, engineCapacity)
      ];

      // Add trim level condition if provided and not 'null'
      if (trimLevel && trimLevel !== 'null') {
        conditions.push(eq(vehicleSpecifications.trimLevel, trimLevel));
      }

      const specifications = await db.select().from(vehicleSpecifications)
        .where(and(...conditions));
      
      console.log(`📋 Found ${specifications.length} specifications`);

      if (specifications.length > 0) {
        // Return the first matching specification
        const spec = specifications[0];
        
        // Parse the specifications JSON if it exists
        let parsedSpecs = {};
        if (spec.specifications) {
          try {
            // Check if it's already an object
            if (typeof spec.specifications === 'object') {
              parsedSpecs = spec.specifications;
            } else {
              // Try to parse as JSON first
              parsedSpecs = JSON.parse(spec.specifications);
            }
          } catch (e) {
            console.log('Error parsing specifications JSON:', e);
            // If JSON parsing fails, treat as raw text
            parsedSpecs = {
              "المواصفات العامة": spec.specifications.toString() || "غير متوفر",
              "نوع المحرك": engineCapacity || "غير محدد",
              "سنة الصنع": year || "غير محدد",
              "الفئة": category || "غير محدد"
            };
          }
        } else {
          // Create default specifications structure
          parsedSpecs = {
            "المواصفات العامة": "لم يتم إدخال المواصفات التفصيلية بعد",
            "نوع المحرك": engineCapacity || "غير محدد", 
            "سنة الصنع": year || "غير محدد",
            "الفئة": category || "غير محدد",
            "درجة التجهيز": trimLevel || "غير محدد"
          };
        }

        res.json({
          id: spec.id,
          manufacturer: spec.manufacturer,
          category: spec.category,
          trimLevel: spec.trimLevel,
          year: spec.year,
          engineCapacity: spec.engineCapacity,
          chassisNumber: spec.chassisNumber,
          specifications: parsedSpecs,
          specificationsEn: spec.specificationsEn
        });
      } else {
        // Return default structure with vehicle info
        console.log(`📝 No specifications found, returning default structure`);
        res.json({
          manufacturer,
          category,
          trimLevel: trimLevel || null,
          year: parseInt(year),
          engineCapacity,
          specifications: await getVehicleSpecifications({
            manufacturer, 
            category, 
            year: parseInt(year), 
            engineCapacity, 
            trimLevel
          }),
          specificationsEn: null
        });
      }
    } catch (error) {
      console.error("Error fetching vehicle specifications:", error);
      res.status(500).json({ message: "Failed to fetch vehicle specifications" });
    }
  });

  // Create vehicle specification
  app.post("/api/vehicle-specifications", async (req, res) => {
    try {
      const { db } = getDatabase();
      const { manufacturer, category, trimLevel, year, engineCapacity, chassisNumber, specifications, specificationsEn } = req.body;
      
      const [newSpec] = await db.insert(vehicleSpecifications).values({
        manufacturer,
        category,
        trimLevel,
        year,
        engineCapacity,
        chassisNumber,
        specifications,
        specificationsEn
      }).returning();

      res.json(newSpec);
    } catch (error) {
      console.error("Error creating vehicle specification:", error);
      res.status(500).json({ message: "Failed to create vehicle specification" });
    }
  });

  // Update vehicle specification
  app.put("/api/vehicle-specifications/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const id = parseInt(req.params.id);
      const { manufacturer, category, trimLevel, year, engineCapacity, chassisNumber, specifications, specificationsEn } = req.body;
      
      const [updatedSpec] = await db.update(vehicleSpecifications)
        .set({
          manufacturer,
          category,
          trimLevel,
          year,
          engineCapacity,
          chassisNumber,
          specifications,
          specificationsEn,
          updatedAt: new Date()
        })
        .where(eq(vehicleSpecifications.id, id))
        .returning();

      if (!updatedSpec) {
        return res.status(404).json({ message: "Vehicle specification not found" });
      }

      res.json(updatedSpec);
    } catch (error) {
      console.error("Error updating vehicle specification:", error);
      res.status(500).json({ message: "Failed to update vehicle specification" });
    }
  });

  // Delete vehicle specification
  app.delete("/api/vehicle-specifications/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const id = parseInt(req.params.id);
      
      const [deletedSpec] = await db.delete(vehicleSpecifications)
        .where(eq(vehicleSpecifications.id, id))
        .returning();

      if (!deletedSpec) {
        return res.status(404).json({ message: "Vehicle specification not found" });
      }

      res.json({ message: "Vehicle specification deleted successfully" });
    } catch (error) {
      console.error("Error deleting vehicle specification:", error);
      res.status(500).json({ message: "Failed to delete vehicle specification" });
    }
  });

  // Get vehicle image links
  app.get("/api/vehicle-image-links", async (req, res) => {
    try {
      const { db } = getDatabase();
      const imageLinks = await db.select().from(vehicleImageLinks);
      res.json(imageLinks);
    } catch (error) {
      console.error("Error fetching vehicle image links:", error);
      res.status(500).json({ message: "Failed to fetch vehicle image links" });
    }
  });

  // Create vehicle image link
  app.post("/api/vehicle-image-links", async (req, res) => {
    try {
      const { db } = getDatabase();
      const { manufacturer, category, trimLevel, year, engineCapacity, exteriorColor, interiorColor, chassisNumber, imageUrl, description, descriptionEn } = req.body;
      
      const [newImageLink] = await db.insert(vehicleImageLinks).values({
        manufacturer,
        category,
        trimLevel,
        year,
        engineCapacity,
        exteriorColor,
        interiorColor,
        chassisNumber,
        imageUrl,
        description,
        descriptionEn
      }).returning();

      res.json(newImageLink);
    } catch (error) {
      console.error("Error creating vehicle image link:", error);
      res.status(500).json({ message: "Failed to create vehicle image link" });
    }
  });

  // Update vehicle image link
  app.put("/api/vehicle-image-links/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const id = parseInt(req.params.id);
      const { manufacturer, category, trimLevel, year, engineCapacity, exteriorColor, interiorColor, chassisNumber, imageUrl, description, descriptionEn } = req.body;
      
      const [updatedImageLink] = await db.update(vehicleImageLinks)
        .set({
          manufacturer,
          category,
          trimLevel,
          year,
          engineCapacity,
          exteriorColor,
          interiorColor,
          chassisNumber,
          imageUrl,
          description,
          descriptionEn,
          updatedAt: new Date()
        })
        .where(eq(vehicleImageLinks.id, id))
        .returning();

      if (!updatedImageLink) {
        return res.status(404).json({ message: "Vehicle image link not found" });
      }

      res.json(updatedImageLink);
    } catch (error) {
      console.error("Error updating vehicle image link:", error);
      res.status(500).json({ message: "Failed to update vehicle image link" });
    }
  });

  // Delete vehicle image link
  app.delete("/api/vehicle-image-links/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const id = parseInt(req.params.id);
      
      const [deletedImageLink] = await db.delete(vehicleImageLinks)
        .where(eq(vehicleImageLinks.id, id))
        .returning();

      if (!deletedImageLink) {
        return res.status(404).json({ message: "Vehicle image link not found" });
      }

      res.json({ message: "Vehicle image link deleted successfully" });
    } catch (error) {
      console.error("Error deleting vehicle image link:", error);
      res.status(500).json({ message: "Failed to delete vehicle image link" });
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

  // Import new hierarchy data
  app.post("/api/database/import-new-hierarchy", async (req, res) => {
    try {
      const { importNewHierarchy } = await import('./import-new-hierarchy');
      const result = await importNewHierarchy();
      
      if (result.success) {
        res.json({
          message: "Hierarchy data replaced successfully",
          counts: result.counts
        });
      } else {
        res.status(500).json({
          message: "Failed to replace hierarchy data",
          error: result.error
        });
      }
    } catch (error) {
      console.error("Hierarchy import error:", error);
      res.status(500).json({ message: "Failed to replace hierarchy data" });
    }
  });

  // Toggle manufacturer active status
  app.put("/api/manufacturers/:id/toggle", async (req, res) => {
    try {
      const { db } = getDatabase();
      const manufacturerId = parseInt(req.params.id);
      const { isActive } = req.body;

      const [updatedManufacturer] = await db
        .update(manufacturers)
        .set({ isActive })
        .where(eq(manufacturers.id, manufacturerId))
        .returning();

      if (!updatedManufacturer) {
        return res.status(404).json({ message: "Manufacturer not found" });
      }

      res.json(updatedManufacturer);
    } catch (error) {
      console.error("Error toggling manufacturer status:", error);
      res.status(500).json({ message: "Failed to toggle manufacturer status" });
    }
  });

  // Toggle category active status
  app.put("/api/categories/:id/toggle", async (req, res) => {
    try {
      const { db } = getDatabase();
      const categoryId = parseInt(req.params.id);
      const { isActive } = req.body;

      const [updatedCategory] = await db
        .update(vehicleCategories)
        .set({ isActive })
        .where(eq(vehicleCategories.id, categoryId))
        .returning();

      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(updatedCategory);
    } catch (error) {
      console.error("Error toggling category status:", error);
      res.status(500).json({ message: "Failed to toggle category status" });
    }
  });

  // Toggle trim level active status
  app.put("/api/trim-levels/:id/toggle", async (req, res) => {
    try {
      const { db } = getDatabase();
      const trimLevelId = parseInt(req.params.id);
      const { isActive } = req.body;

      const [updatedTrimLevel] = await db
        .update(vehicleTrimLevels)
        .set({ isActive })
        .where(eq(vehicleTrimLevels.id, trimLevelId))
        .returning();

      if (!updatedTrimLevel) {
        return res.status(404).json({ message: "Trim level not found" });
      }

      res.json(updatedTrimLevel);
    } catch (error) {
      console.error("Error toggling trim level status:", error);
      res.status(500).json({ message: "Failed to toggle trim level status" });
    }
  });

  // ===== QUOTATIONS API ENDPOINTS =====
  
  // Get all quotations
  app.get("/api/quotations", async (req, res) => {
    try {
      const { db } = getDatabase();
      const allQuotations = await db.select().from(quotations).orderBy(desc(quotations.createdAt));
      res.json(allQuotations);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      res.status(500).json({ message: "Failed to fetch quotations" });
    }
  });

  // Get single quotation by ID
  app.get("/api/quotations/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const id = parseInt(req.params.id);
      
      const quotationList = await db.select().from(quotations).where(eq(quotations.id, id));
      
      if (quotationList.length === 0) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      res.json(quotationList[0]);
    } catch (error) {
      console.error("Error fetching quotation:", error);
      res.status(500).json({ message: "Failed to fetch quotation" });
    }
  });

  // Create new quotation
  app.post("/api/quotations", async (req, res) => {
    try {
      const { db } = getDatabase();
      const quotationData = req.body;
      
      // Validate inventoryItemId to prevent integer overflow
      const inventoryItemId = quotationData.inventoryItemId || 0;
      const validInventoryItemId = typeof inventoryItemId === 'number' && 
                                   inventoryItemId >= -2147483648 && 
                                   inventoryItemId <= 2147483647 ? 
                                   inventoryItemId : 0;
      
      const [newQuotation] = await db.insert(quotations).values({
        quoteNumber: quotationData.quoteNumber,
        inventoryItemId: validInventoryItemId,
        manufacturer: quotationData.manufacturer,
        category: quotationData.category,
        trimLevel: quotationData.trimLevel,
        year: quotationData.year,
        exteriorColor: quotationData.exteriorColor || 'غير محدد',
        interiorColor: quotationData.interiorColor || 'غير محدد',
        chassisNumber: quotationData.chassisNumber,
        engineCapacity: quotationData.engineCapacity,
        specifications: quotationData.specifications,
        basePrice: quotationData.basePrice.toString(),
        finalPrice: quotationData.finalPrice.toString(),
        customerName: quotationData.customerName,
        customerPhone: quotationData.customerPhone,
        customerEmail: quotationData.customerEmail,
        customerTitle: quotationData.customerTitle,
        notes: quotationData.notes,
        validUntil: quotationData.validUntil ? new Date(quotationData.validUntil) : null,
        status: quotationData.status || 'مسودة',
        createdBy: quotationData.createdBy,
        companyData: typeof quotationData.companyData === 'string' ? quotationData.companyData : JSON.stringify(quotationData.companyData),
        representativeData: typeof quotationData.representativeData === 'string' ? quotationData.representativeData : JSON.stringify(quotationData.representativeData),
        quoteAppearance: typeof quotationData.quoteAppearance === 'string' ? quotationData.quoteAppearance : JSON.stringify(quotationData.quoteAppearance),
        pricingDetails: typeof quotationData.pricingDetails === 'string' ? quotationData.pricingDetails : JSON.stringify(quotationData.pricingDetails),
        qrCodeData: quotationData.qrCodeData
      }).returning();

      res.json(newQuotation);
    } catch (error) {
      console.error("Error creating quotation:", error);
      res.status(500).json({ message: "Failed to create quotation" });
    }
  });

  // Update quotation
  app.put("/api/quotations/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const id = parseInt(req.params.id);
      const quotationData = req.body;
      
      // Validate inventoryItemId to prevent integer overflow
      const inventoryItemId = quotationData.inventoryItemId || 0;
      const validInventoryItemId = typeof inventoryItemId === 'number' && 
                                   inventoryItemId >= -2147483648 && 
                                   inventoryItemId <= 2147483647 ? 
                                   inventoryItemId : 0;
      
      const [updatedQuotation] = await db.update(quotations)
        .set({
          quoteNumber: quotationData.quoteNumber,
          inventoryItemId: validInventoryItemId,
          manufacturer: quotationData.manufacturer,
          category: quotationData.category,
          trimLevel: quotationData.trimLevel,
          year: quotationData.year,
          exteriorColor: quotationData.exteriorColor || 'غير محدد',
          interiorColor: quotationData.interiorColor || 'غير محدد',
          chassisNumber: quotationData.chassisNumber,
          engineCapacity: quotationData.engineCapacity,
          specifications: quotationData.specifications,
          basePrice: quotationData.basePrice.toString(),
          finalPrice: quotationData.finalPrice.toString(),
          customerName: quotationData.customerName,
          customerPhone: quotationData.customerPhone,
          customerEmail: quotationData.customerEmail,
          customerTitle: quotationData.customerTitle,
          notes: quotationData.notes,
          validUntil: quotationData.validUntil ? new Date(quotationData.validUntil) : null,
          status: quotationData.status || 'مسودة',
          createdBy: quotationData.createdBy,
          companyData: typeof quotationData.companyData === 'string' ? quotationData.companyData : JSON.stringify(quotationData.companyData),
          representativeData: typeof quotationData.representativeData === 'string' ? quotationData.representativeData : JSON.stringify(quotationData.representativeData),
          quoteAppearance: typeof quotationData.quoteAppearance === 'string' ? quotationData.quoteAppearance : JSON.stringify(quotationData.quoteAppearance),
          pricingDetails: typeof quotationData.pricingDetails === 'string' ? quotationData.pricingDetails : JSON.stringify(quotationData.pricingDetails),
          qrCodeData: quotationData.qrCodeData,
          updatedAt: new Date()
        })
        .where(eq(quotations.id, id))
        .returning();

      if (!updatedQuotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }

      res.json(updatedQuotation);
    } catch (error) {
      console.error("Error updating quotation:", error);
      res.status(500).json({ message: "Failed to update quotation" });
    }
  });

  // Delete quotation
  app.delete("/api/quotations/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const id = parseInt(req.params.id);
      
      const [deletedQuotation] = await db.delete(quotations)
        .where(eq(quotations.id, id))
        .returning();

      if (!deletedQuotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }

      res.json({ message: "Quotation deleted successfully" });
    } catch (error) {
      console.error("Error deleting quotation:", error);
      res.status(500).json({ message: "Failed to delete quotation" });
    }
  });

  // Configure multer for logo uploads
  const logoStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
      const logosDir = path.join(process.cwd(), 'public', 'logos');
      try {
        await fs.mkdir(logosDir, { recursive: true });
        cb(null, logosDir);
      } catch (error) {
        cb(error, '');
      }
    },
    filename: (req, file, cb) => {
      // Extract manufacturer info from request
      const manufacturerId = req.params.id;
      // Get file extension
      const ext = path.extname(file.originalname);
      // Use manufacturer ID as filename (will be updated with actual name later)
      cb(null, `temp_${manufacturerId}${ext}`);
    }
  });

  const uploadLogo = multer({
    storage: logoStorage,
    fileFilter: (req, file, cb) => {
      // Check file type
      const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('نوع الملف غير مدعوم. يرجى رفع ملف SVG أو PNG فقط.'));
      }
    },
    limits: {
      fileSize: 2 * 1024 * 1024 // 2MB limit
    }
  });

  // Upload manufacturer logo endpoint
  app.post('/api/manufacturers/:id/upload-logo', uploadLogo.single('logo'), async (req, res) => {
    try {
      const { db } = getDatabase();
      const manufacturerId = parseInt(req.params.id);
      
      if (!req.file) {
        return res.status(400).json({ message: 'لم يتم تحديد ملف' });
      }

      // Get manufacturer info to determine final filename
      const manufacturer = await db.select()
        .from(manufacturers)
        .where(eq(manufacturers.id, manufacturerId))
        .limit(1);

      if (manufacturer.length === 0) {
        // Delete uploaded file if manufacturer not found
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(404).json({ message: 'الصانع غير موجود' });
      }

      const manufacturerData = manufacturer[0];
      const fileExt = path.extname(req.file.originalname);
      
      // Determine final filename using Arabic or English name
      let finalFileName: string;
      if (manufacturerData.nameEn && manufacturerData.nameEn.trim()) {
        // Use English name if available
        finalFileName = `${manufacturerData.nameEn.trim()}${fileExt}`;
      } else {
        // Use Arabic name as fallback
        finalFileName = `${manufacturerData.nameAr.trim()}${fileExt}`;
      }

      const finalPath = path.join(path.dirname(req.file.path), finalFileName);
      
      // Rename file to final name
      await fs.rename(req.file.path, finalPath);
      
      // Update manufacturer logo path in database
      await db.update(manufacturers)
        .set({ 
          logo: `/logos/${finalFileName}`,
          updatedAt: new Date()
        })
        .where(eq(manufacturers.id, manufacturerId));

      res.json({ 
        message: 'تم رفع الشعار بنجاح',
        logoPath: `/logos/${finalFileName}`,
        fileName: finalFileName
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      
      console.error('خطأ في رفع الشعار:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'فشل في رفع الشعار' 
      });
    }
  });

  // Terms and Conditions endpoints
  app.get("/api/terms-conditions", async (req, res) => {
    try {
      const { db } = getDatabase();
      const terms = await db.select().from(termsConditions)
        .where(eq(termsConditions.isActive, true))
        .orderBy(asc(termsConditions.displayOrder));
      
      // Transform the response to match expected frontend format
      const formattedTerms = terms.map(term => ({
        id: term.id,
        term_text: term.termText,
        display_order: term.displayOrder
      }));
      
      res.json(formattedTerms);
    } catch (error) {
      console.error("Error fetching terms and conditions:", error);
      res.status(500).json({ message: "Failed to fetch terms and conditions" });
    }
  });

  app.post("/api/terms-conditions", async (req, res) => {
    try {
      const { db } = getDatabase();
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Content is required" });
      }

      // Split content by lines and create separate terms
      const terms = content.split('\n').filter(line => line.trim());
      
      if (terms.length === 0) {
        return res.status(400).json({ message: "At least one term is required" });
      }

      // First, deactivate all existing terms
      await db.update(termsConditions)
        .set({ isActive: false, updatedAt: new Date() });

      // Insert new terms
      const insertPromises = terms.map((term, index) => 
        db.insert(termsConditions).values({
          termText: term.trim(),
          displayOrder: index + 1,
          isActive: true
        }).returning()
      );

      const results = await Promise.all(insertPromises);
      
      res.json({ 
        message: "Terms and conditions saved successfully", 
        count: results.length 
      });
    } catch (error) {
      console.error("Error saving terms and conditions:", error);
      res.status(500).json({ message: "Failed to save terms and conditions" });
    }
  });

  // Price Cards API Routes
  
  // Get all price cards
  app.get("/api/price-cards", async (req, res) => {
    try {
      const { db } = getDatabase();
      const cards = await db.select().from(priceCards).orderBy(desc(priceCards.createdAt));
      res.json(cards);
    } catch (error) {
      console.error("Error fetching price cards:", error);
      res.status(500).json({ message: "Failed to fetch price cards" });
    }
  });

  // Create a new price card
  app.post("/api/price-cards", async (req, res) => {
    try {
      const { db } = getDatabase();
      
      // Validate the request body using the schema
      const validatedData = insertPriceCardSchema.parse(req.body);
      
      console.log('Creating price card with data:', validatedData);
      
      const [newCard] = await db.insert(priceCards).values(validatedData).returning();
      
      console.log('Price card created successfully:', newCard.id);
      res.json(newCard);
    } catch (error: any) {
      console.error("Error creating price card:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid data format", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create price card" });
    }
  });

  // Update a price card
  app.put("/api/price-cards/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const cardId = parseInt(req.params.id);
      
      if (isNaN(cardId)) {
        return res.status(400).json({ message: "Invalid price card ID" });
      }
      
      // Validate the request body using a partial schema
      const validatedData = insertPriceCardSchema.partial().parse(req.body);
      
      const [updatedCard] = await db.update(priceCards)
        .set({
          ...validatedData,
          updatedAt: new Date()
        })
        .where(eq(priceCards.id, cardId))
        .returning();

      if (!updatedCard) {
        return res.status(404).json({ message: "Price card not found" });
      }

      res.json(updatedCard);
    } catch (error: any) {
      console.error("Error updating price card:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid data format", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update price card" });
    }
  });

  // Delete a price card
  app.delete("/api/price-cards/:id", async (req, res) => {
    try {
      const { db } = getDatabase();
      const cardId = parseInt(req.params.id);
      
      if (isNaN(cardId)) {
        return res.status(400).json({ message: "Invalid price card ID" });
      }
      
      const [deletedCard] = await db.delete(priceCards)
        .where(eq(priceCards.id, cardId))
        .returning();

      if (!deletedCard) {
        return res.status(404).json({ message: "Price card not found" });
      }

      res.json({ message: "Price card deleted successfully", id: cardId });
    } catch (error) {
      console.error("Error deleting price card:", error);
      res.status(500).json({ message: "Failed to delete price card" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}