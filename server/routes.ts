import type { Express } from "express";
import { createServer, type Server } from "http";
import { getDatabase } from "./db";
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
  vehicleImageLinks
} from "@shared/schema";
import { Pool } from 'pg';
import { eq, desc, and } from "drizzle-orm";
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

  // Get categories by manufacturer
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

  // Get trim levels by category
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
  // Get all categories (including inactive)  
  app.get("/api/categories", async (req, res) => {
    try {
      const { db } = getDatabase();
      const categoriesData = await db.select().from(vehicleCategories);
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
  // Get all trim levels (including inactive)
  app.get("/api/trim-levels", async (req, res) => {
    try {
      const { db } = getDatabase();
      const trimLevelsData = await db.select().from(vehicleTrimLevels);
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
      
      if (!req.session?.passport?.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userRole = req.session.passport.user.role;

      // Only admin and sales_manager can create schedules
      if (userRole !== 'admin' && userRole !== 'sales_manager') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

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

  // Create daily attendance record
  app.post("/api/daily-attendance", async (req, res) => {
    try {
      const { db } = getDatabase();
      
      if (!req.session?.passport?.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userRole = req.session.passport.user.role;
      const createdBy = req.session.passport.user.id;
      const createdByName = req.session.passport.user.username;

      // Only admin and sales_manager can create attendance records for others
      if (userRole !== 'admin' && userRole !== 'sales_manager') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const attendanceData = {
        ...req.body,
        createdBy,
        createdByName,
        date: new Date(req.body.date)
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
      
      if (!req.session?.passport?.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userRole = req.session.passport.user.role;
      const userId = req.session.passport.user.id;

      const attendanceId = parseInt(req.params.id);
      
      // Check if user can edit this record
      const [existingRecord] = await db.select()
        .from(dailyAttendance)
        .where(eq(dailyAttendance.id, attendanceId));

      if (!existingRecord) {
        return res.status(404).json({ message: "Attendance record not found" });
      }

      // Admin and sales_manager can edit all records, others can only edit their own
      if (userRole !== 'admin' && userRole !== 'sales_manager' && existingRecord.employeeId !== userId) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      
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

  const httpServer = createServer(app);
  return httpServer;
}