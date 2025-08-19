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
  leaveRequests 
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
      const manufacturersData = await db.select().from(manufacturers);
      res.json(manufacturersData);
    } catch (error) {
      console.error("Error fetching hierarchical manufacturers:", error);
      res.status(500).json({ message: "Failed to fetch hierarchical manufacturers" });
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
      
      // Check if user is authenticated
      if (!req.session?.passport?.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userRole = req.session.passport.user.role;
      const userId = req.session.passport.user.id;

      let attendanceData;

      // Admin and sales_manager can see all attendance records
      if (userRole === 'admin' || userRole === 'sales_manager') {
        attendanceData = await db.select().from(dailyAttendance).orderBy(desc(dailyAttendance.date));
      } 
      // Other roles (accountant, bank_accountant, salesperson, seller) can only see their own records
      else {
        attendanceData = await db.select()
          .from(dailyAttendance)
          .where(eq(dailyAttendance.employeeId, userId))
          .orderBy(desc(dailyAttendance.date));
      }

      res.json(attendanceData);
    } catch (error) {
      console.error("Error fetching daily attendance:", error);
      res.status(500).json({ message: "Failed to fetch daily attendance" });
    }
  });

  app.get("/api/employee-work-schedules", async (req, res) => {
    try {
      const { db } = getDatabase();
      
      // Check if user is authenticated
      if (!req.session?.passport?.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userRole = req.session.passport.user.role;
      const userId = req.session.passport.user.id;

      let scheduleData;

      // Admin and sales_manager can see all work schedules
      if (userRole === 'admin' || userRole === 'sales_manager') {
        scheduleData = await db.select().from(employeeWorkSchedules)
          .where(eq(employeeWorkSchedules.isActive, true))
          .orderBy(employeeWorkSchedules.employeeName);
      } 
      // Other roles can only see their own schedule
      else {
        scheduleData = await db.select()
          .from(employeeWorkSchedules)
          .where(and(
            eq(employeeWorkSchedules.employeeId, userId),
            eq(employeeWorkSchedules.isActive, true)
          ))
          .orderBy(employeeWorkSchedules.employeeName);
      }

      res.json(scheduleData);
    } catch (error) {
      console.error("Error fetching work schedules:", error);
      res.status(500).json({ message: "Failed to fetch work schedules" });
    }
  });

  app.get("/api/leave-requests", async (req, res) => {
    try {
      const { db } = getDatabase();
      
      // Check if user is authenticated
      if (!req.session?.passport?.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userRole = req.session.passport.user.role;
      const userId = req.session.passport.user.id;

      let leaveData;

      // Admin and sales_manager can see all leave requests
      if (userRole === 'admin' || userRole === 'sales_manager') {
        leaveData = await db.select().from(leaveRequests).orderBy(desc(leaveRequests.createdAt));
      } 
      // Other roles can only see their own leave requests
      else {
        leaveData = await db.select()
          .from(leaveRequests)
          .where(eq(leaveRequests.userId, userId))
          .orderBy(desc(leaveRequests.createdAt));
      }

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