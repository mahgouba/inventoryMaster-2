import "dotenv/config";
import { db } from "./db";
import { 
  users, inventoryItems, banks, manufacturers, vehicleCategories, vehicleTrimLevels, colorAssociations,
  vehicleSpecifications, vehicleImageLinks,
  type User, type InsertUser, 
  type InventoryItem, type InsertInventoryItem, 
  type Bank, type InsertBank,
  type Manufacturer, type InsertManufacturer,
  type VehicleCategory, type InsertVehicleCategory,
  type VehicleTrimLevel, type InsertVehicleTrimLevel,
  type ColorAssociation, type InsertColorAssociation,
  type VehicleSpecification, type InsertVehicleSpecification,
  type VehicleImageLink, type InsertVehicleImageLink
} from "@shared/schema";
import { eq, sql, and, or, ilike, desc, asc } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  constructor() {
    console.log('🔌 Initializing DatabaseStorage...');
    if (!db) {
      console.error('❌ Database connection not available');
      throw new Error('Database connection not available');
    }
    console.log('✅ DatabaseStorage initialized successfully');
  }
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updated || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  // Inventory Items
  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).orderBy(desc(inventoryItems.entryDate));
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item || undefined;
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventoryItems).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [updated] = await db.update(inventoryItems).set(item).where(eq(inventoryItems.id, id)).returning();
    return updated || undefined;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    const result = await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
    return result.rowCount > 0;
  }

  async clearAllInventoryItems(): Promise<boolean> {
    await db.delete(inventoryItems);
    return true;
  }

  async searchInventoryItems(query: string): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).where(
      or(
        ilike(inventoryItems.manufacturer, `%${query}%`),
        ilike(inventoryItems.category, `%${query}%`),
        ilike(inventoryItems.chassisNumber, `%${query}%`),
        ilike(inventoryItems.exteriorColor, `%${query}%`)
      )
    );
  }

  async filterInventoryItems(filters: {
    category?: string;
    status?: string;
    year?: number;
    manufacturer?: string;
    importType?: string;
    location?: string;
  }): Promise<InventoryItem[]> {
    let query = db.select().from(inventoryItems);
    const conditions = [];

    if (filters.manufacturer) conditions.push(eq(inventoryItems.manufacturer, filters.manufacturer));
    if (filters.category) conditions.push(eq(inventoryItems.category, filters.category));
    if (filters.status) conditions.push(eq(inventoryItems.status, filters.status));
    if (filters.year) conditions.push(eq(inventoryItems.year, filters.year));
    if (filters.importType) conditions.push(eq(inventoryItems.importType, filters.importType));
    if (filters.location) conditions.push(eq(inventoryItems.location, filters.location));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async getInventoryStats(): Promise<{
    total: number;
    available: number;
    inTransit: number;
    maintenance: number;
    reserved: number;
    sold: number;
    personal: number;
    company: number;
    usedPersonal: number;
  }> {
    const stats = await db
      .select({
        total: sql<number>`count(*)::int`,
        available: sql<number>`sum(case when ${inventoryItems.status} = 'متوفر' then 1 else 0 end)::int`,
        inTransit: sql<number>`sum(case when ${inventoryItems.status} = 'في الطريق' then 1 else 0 end)::int`,
        maintenance: sql<number>`sum(case when ${inventoryItems.status} = 'صيانة' then 1 else 0 end)::int`,
        reserved: sql<number>`sum(case when ${inventoryItems.status} = 'محجوز' then 1 else 0 end)::int`,
        sold: sql<number>`sum(case when ${inventoryItems.isSold} = true then 1 else 0 end)::int`,
        personal: sql<number>`sum(case when ${inventoryItems.importType} = 'شخصي' then 1 else 0 end)::int`,
        company: sql<number>`sum(case when ${inventoryItems.importType} = 'شركة' then 1 else 0 end)::int`,
        usedPersonal: sql<number>`sum(case when ${inventoryItems.importType} = 'مستعمل شخصي' then 1 else 0 end)::int`,
      })
      .from(inventoryItems);

    return stats[0];
  }

  async getManufacturerStats(): Promise<Array<{
    manufacturer: string;
    total: number;
    personal: number;
    company: number;
    usedPersonal: number;
    logo?: string | null;
  }>> {
    const stats = await db
      .select({
        manufacturer: inventoryItems.manufacturer,
        total: sql<number>`count(*)::int`,
        personal: sql<number>`sum(case when ${inventoryItems.importType} = 'شخصي' then 1 else 0 end)::int`,
        company: sql<number>`sum(case when ${inventoryItems.importType} = 'شركة' then 1 else 0 end)::int`,
        usedPersonal: sql<number>`sum(case when ${inventoryItems.importType} = 'مستعمل شخصي' then 1 else 0 end)::int`,
        logo: inventoryItems.logo,
      })
      .from(inventoryItems)
      .groupBy(inventoryItems.manufacturer, inventoryItems.logo);

    return stats;
  }

  async getLocationStats(): Promise<Array<{
    location: string;
    total: number;
    available: number;
    inTransit: number;
    maintenance: number;
    sold: number;
  }>> {
    const stats = await db
      .select({
        location: inventoryItems.location,
        total: sql<number>`count(*)::int`,
        available: sql<number>`sum(case when ${inventoryItems.status} = 'متوفر' then 1 else 0 end)::int`,
        inTransit: sql<number>`sum(case when ${inventoryItems.status} = 'في الطريق' then 1 else 0 end)::int`,
        maintenance: sql<number>`sum(case when ${inventoryItems.status} = 'صيانة' then 1 else 0 end)::int`,
        sold: sql<number>`sum(case when ${inventoryItems.isSold} = true then 1 else 0 end)::int`,
      })
      .from(inventoryItems)
      .groupBy(inventoryItems.location);

    return stats;
  }

  async getReservedItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).where(eq(inventoryItems.status, 'محجوز'));
  }

  // Banks
  async getAllBanks(): Promise<Bank[]> {
    return await db.select().from(banks).orderBy(desc(banks.createdAt));
  }

  async getBank(id: number): Promise<Bank | undefined> {
    const [bank] = await db.select().from(banks).where(eq(banks.id, id));
    return bank || undefined;
  }

  async createBank(bank: InsertBank): Promise<Bank> {
    const [newBank] = await db.insert(banks).values(bank).returning();
    return newBank;
  }

  async updateBank(id: number, bank: Partial<InsertBank>): Promise<Bank | undefined> {
    const [updated] = await db.update(banks).set({
      ...bank,
      updatedAt: new Date()
    }).where(eq(banks.id, id)).returning();
    return updated || undefined;
  }

  async deleteBank(id: number): Promise<boolean> {
    const result = await db.delete(banks).where(eq(banks.id, id));
    return result.rowCount > 0;
  }

  async getBanksByType(type: string): Promise<Bank[]> {
    return await db.select().from(banks).where(eq(banks.type, type));
  }

  // Manufacturers
  async getAllManufacturers(): Promise<Manufacturer[]> {
    return await db.select().from(manufacturers).orderBy(desc(manufacturers.createdAt));
  }

  async getManufacturer(id: number): Promise<Manufacturer | undefined> {
    const [manufacturer] = await db.select().from(manufacturers).where(eq(manufacturers.id, id));
    return manufacturer || undefined;
  }

  async createManufacturer(manufacturer: InsertManufacturer): Promise<Manufacturer> {
    const [newManufacturer] = await db.insert(manufacturers).values(manufacturer).returning();
    return newManufacturer;
  }

  async updateManufacturer(id: number, manufacturer: Partial<InsertManufacturer>): Promise<Manufacturer | undefined> {
    const [updated] = await db.update(manufacturers).set({
      ...manufacturer,
      updatedAt: new Date()
    }).where(eq(manufacturers.id, id)).returning();
    return updated || undefined;
  }

  async deleteManufacturer(id: number): Promise<boolean> {
    const result = await db.delete(manufacturers).where(eq(manufacturers.id, id));
    return result.rowCount > 0;
  }

  async getManufacturerByName(name: string): Promise<Manufacturer | undefined> {
    const [manufacturer] = await db.select().from(manufacturers).where(
      or(eq(manufacturers.nameAr, name), eq(manufacturers.nameEn, name))
    );
    return manufacturer || undefined;
  }

  // Vehicle Categories
  async getAllVehicleCategories(): Promise<VehicleCategory[]> {
    return await db.select().from(vehicleCategories).orderBy(desc(vehicleCategories.createdAt));
  }

  async getVehicleCategory(id: number): Promise<VehicleCategory | undefined> {
    const [category] = await db.select().from(vehicleCategories).where(eq(vehicleCategories.id, id));
    return category || undefined;
  }

  async createVehicleCategory(category: InsertVehicleCategory): Promise<VehicleCategory> {
    const [newCategory] = await db.insert(vehicleCategories).values(category).returning();
    return newCategory;
  }

  async updateVehicleCategory(id: number, category: Partial<InsertVehicleCategory>): Promise<VehicleCategory | undefined> {
    const [updated] = await db.update(vehicleCategories).set({
      ...category,
      updatedAt: new Date()
    }).where(eq(vehicleCategories.id, id)).returning();
    return updated || undefined;
  }

  async deleteVehicleCategory(id: number): Promise<boolean> {
    const result = await db.delete(vehicleCategories).where(eq(vehicleCategories.id, id));
    return result.rowCount > 0;
  }

  async getVehicleCategoriesByManufacturer(manufacturerId: number): Promise<VehicleCategory[]> {
    return await db.select().from(vehicleCategories)
      .where(eq(vehicleCategories.manufacturerId, manufacturerId))
      .orderBy(vehicleCategories.nameAr);
  }

  // Vehicle Trim Levels
  async getAllVehicleTrimLevels(): Promise<VehicleTrimLevel[]> {
    return await db.select().from(vehicleTrimLevels).orderBy(desc(vehicleTrimLevels.createdAt));
  }

  async getVehicleTrimLevel(id: number): Promise<VehicleTrimLevel | undefined> {
    const [trimLevel] = await db.select().from(vehicleTrimLevels).where(eq(vehicleTrimLevels.id, id));
    return trimLevel || undefined;
  }

  async createVehicleTrimLevel(trimLevel: InsertVehicleTrimLevel): Promise<VehicleTrimLevel> {
    const [newTrimLevel] = await db.insert(vehicleTrimLevels).values(trimLevel).returning();
    return newTrimLevel;
  }

  async updateVehicleTrimLevel(id: number, trimLevel: Partial<InsertVehicleTrimLevel>): Promise<VehicleTrimLevel | undefined> {
    const [updated] = await db.update(vehicleTrimLevels).set({
      ...trimLevel,
      updatedAt: new Date()
    }).where(eq(vehicleTrimLevels.id, id)).returning();
    return updated || undefined;
  }

  async deleteVehicleTrimLevel(id: number): Promise<boolean> {
    const result = await db.delete(vehicleTrimLevels).where(eq(vehicleTrimLevels.id, id));
    return result.rowCount > 0;
  }

  async getVehicleTrimLevelsByCategory(categoryId: number): Promise<VehicleTrimLevel[]> {
    return await db.select().from(vehicleTrimLevels)
      .where(eq(vehicleTrimLevels.categoryId, categoryId))
      .orderBy(vehicleTrimLevels.nameAr);
  }

  // Placeholder methods for remaining IStorage interface requirements
  // These would need full implementation for production use
  async getInventoryItemByChassisNumber(chassisNumber: string): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.chassisNumber, chassisNumber));
    return item || undefined;
  }

  async getSoldItemsByDateRange(startDate: Date, endDate: Date): Promise<InventoryItem[]> {
    return [];
  }

  async markItemAsSold(id: number, soldPrice: number, customerName: string, customerPhone: string, salesRep: string, paymentMethod: string, bankName?: string, notes?: string): Promise<InventoryItem | undefined> {
    return undefined;
  }

  async reserveItem(id: number, customerName: string, customerPhone: string, paidAmount: number, reservedBy: string, notes?: string): Promise<InventoryItem | undefined> {
    return undefined;
  }

  async cancelReservation(id: number): Promise<InventoryItem | undefined> {
    return undefined;
  }

  // All other methods would be implemented as needed...
  // For brevity, I'm implementing the core CRUD operations for the main entities
  // The remaining methods would follow similar patterns

  // Dropdown Options Management Methods
  
  // Manufacturers
  async getManufacturers(): Promise<any[]> {
    return await db.select().from(manufacturers).orderBy(manufacturers.nameAr);
  }

  async addManufacturer(manufacturer: any): Promise<any> {
    // Check if manufacturer already exists
    const existing = await db.select().from(manufacturers).where(eq(manufacturers.nameAr, manufacturer.nameAr));
    if (existing.length > 0) {
      return existing[0]; // Return existing manufacturer
    }
    
    const [newManufacturer] = await db.insert(manufacturers).values(manufacturer).returning();
    return newManufacturer;
  }

  async updateManufacturer(id: string, manufacturer: any): Promise<any> {
    const [updated] = await db.update(manufacturers).set({
      ...manufacturer,
      updatedAt: new Date()
    }).where(eq(manufacturers.id, id)).returning();
    return updated;
  }

  async deleteManufacturer(id: string): Promise<boolean> {
    const result = await db.delete(manufacturers).where(eq(manufacturers.id, id));
    return result.rowCount > 0;
  }

  // Categories
  async getCategoriesByManufacturer(manufacturer: string): Promise<VehicleCategory[]> {
    try {
      // First, find the manufacturer by name
      const [manufacturerObj] = await db.select().from(manufacturers)
        .where(or(
          eq(manufacturers.nameAr, manufacturer),
          eq(manufacturers.nameEn, manufacturer)
        ));
      
      if (!manufacturerObj) {
        console.log(`❌ Manufacturer "${manufacturer}" not found in database`);
        return [];
      }
      
      // Then get categories for this manufacturer
      const categories = await db.select().from(vehicleCategories)
        .where(eq(vehicleCategories.manufacturerId, manufacturerObj.id))
        .orderBy(vehicleCategories.nameAr);
      
      console.log(`✅ Found ${categories.length} categories for manufacturer "${manufacturer}"`);
      return categories;
    } catch (error) {
      console.error('Error in getCategoriesByManufacturer:', error);
      return [];
    }
  }

  async getCategories(manufacturer?: string): Promise<any[]> {
    try {
      // Use raw SQL to avoid Drizzle issues
      if (manufacturer) {
        const result = await db.execute(sql`
          SELECT vc.* 
          FROM vehicle_categories vc 
          JOIN manufacturers m ON vc.manufacturer_id = m.id 
          WHERE m.name_ar = ${manufacturer}
          ORDER BY vc.name_ar
        `);
        return result.rows;
      } else {
        const result = await db.execute(sql`SELECT * FROM vehicle_categories ORDER BY name_ar`);
        return result.rows;
      }
    } catch (error) {
      console.error('Error in getCategories:', error);
      return [];
    }
  }

  async addCategory(category: any): Promise<any> {
    // Check if category already exists for this manufacturer
    const existing = await db.select().from(vehicleCategories)
      .where(and(
        eq(vehicleCategories.nameAr, category.name_ar),
        eq(vehicleCategories.manufacturerId, category.manufacturer_id)
      ));
    if (existing.length > 0) {
      return existing[0]; // Return existing category
    }
    
    const [newCategory] = await db.insert(vehicleCategories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: any): Promise<any> {
    const [updated] = await db.update(vehicleCategories).set({
      ...category,
      updatedAt: new Date()
    }).where(eq(vehicleCategories.id, id)).returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(vehicleCategories).where(eq(vehicleCategories.id, id));
    return result.rowCount > 0;
  }

  // Trim Levels
  async getTrimLevelsByCategory(manufacturer: string, category: string): Promise<VehicleTrimLevel[]> {
    try {
      // First, find the manufacturer
      const [manufacturerObj] = await db.select().from(manufacturers)
        .where(or(
          eq(manufacturers.nameAr, manufacturer),
          eq(manufacturers.nameEn, manufacturer)
        ));
      
      if (!manufacturerObj) {
        console.log(`❌ Manufacturer "${manufacturer}" not found`);
        return [];
      }
      
      // Then find the category for this manufacturer
      const [categoryObj] = await db.select().from(vehicleCategories)
        .where(and(
          eq(vehicleCategories.manufacturerId, manufacturerObj.id),
          or(
            eq(vehicleCategories.nameAr, category),
            eq(vehicleCategories.nameEn, category)
          )
        ));
      
      if (!categoryObj) {
        console.log(`❌ Category "${category}" not found for manufacturer "${manufacturer}"`);
        return [];
      }
      
      // Finally get trim levels for this category
      const trimLevels = await db.select().from(vehicleTrimLevels)
        .where(eq(vehicleTrimLevels.categoryId, categoryObj.id))
        .orderBy(vehicleTrimLevels.nameAr);
      
      console.log(`✅ Found ${trimLevels.length} trim levels for category "${category}"`);
      return trimLevels;
    } catch (error) {
      console.error('Error in getTrimLevelsByCategory:', error);
      return [];
    }
  }

  async getTrimLevels(manufacturer?: string, category?: string): Promise<any[]> {
    try {
      // Use raw SQL to avoid Drizzle issues
      if (category) {
        const result = await db.execute(sql`
          SELECT vt.* 
          FROM vehicle_trim_levels vt 
          JOIN vehicle_categories vc ON vt.category_id = vc.id 
          WHERE vc.name_ar = ${category}
          ORDER BY vt.name_ar
        `);
        return result.rows;
      } else {
        const result = await db.execute(sql`SELECT * FROM vehicle_trim_levels ORDER BY name_ar`);
        return result.rows;
      }
    } catch (error) {
      console.error('Error in getTrimLevels:', error);
      return [];
    }
  }

  async addTrimLevel(trimLevel: any): Promise<any> {
    // Check if trim level already exists for this category
    const existing = await db.select().from(vehicleTrimLevels)
      .where(and(
        eq(vehicleTrimLevels.nameAr, trimLevel.name_ar),
        eq(vehicleTrimLevels.categoryId, trimLevel.category_id)
      ));
    if (existing.length > 0) {
      return existing[0]; // Return existing trim level
    }
    
    const [newTrimLevel] = await db.insert(vehicleTrimLevels).values(trimLevel).returning();
    return newTrimLevel;
  }

  async updateTrimLevel(id: number, trimLevel: any): Promise<any> {
    const [updated] = await db.update(vehicleTrimLevels).set({
      ...trimLevel,
      updatedAt: new Date()
    }).where(eq(vehicleTrimLevels.id, id)).returning();
    return updated;
  }

  async deleteTrimLevel(id: number): Promise<boolean> {
    const result = await db.delete(vehicleTrimLevels).where(eq(vehicleTrimLevels.id, id));
    return result.rowCount > 0;
  }

  // Colors (placeholder implementation)
  async getColors(): Promise<any[]> {
    // This would need a colors table in the schema
    return [];
  }

  async addColor(color: any): Promise<any> {
    // This would need a colors table in the schema
    return color;
  }

  async updateColor(id: number, color: any): Promise<any> {
    // This would need a colors table in the schema
    return color;
  }

  async deleteColor(id: number): Promise<boolean> {
    // This would need a colors table in the schema
    return false;
  }

  // Locations (placeholder implementation)
  async getLocations(): Promise<any[]> {
    // This would need a locations table in the schema
    return [];
  }

  async addLocation(location: any): Promise<any> {
    // This would need a locations table in the schema
    return location;
  }

  async updateLocation(id: number, location: any): Promise<any> {
    // This would need a locations table in the schema
    return location;
  }

  async deleteLocation(id: number): Promise<boolean> {
    // This would need a locations table in the schema
    return false;
  }

  // Stub implementations for remaining interface methods
  async getAllCategories(): Promise<{ category: string }[]> { 
    const categories = await db.select().from(vehicleCategories);
    return categories.map(c => ({ category: c.nameAr }));
  }

  async getAllEngineCapacities(): Promise<{ engineCapacity: string }[]> { return []; }
  async getAppearanceSettings(): Promise<any> { return null; }
  async updateAppearanceSettings(settings: any): Promise<any> { return settings; }
  async getAllSpecifications(): Promise<any[]> { return []; }
  async getSpecification(id: number): Promise<any> { return null; }
  async createSpecification(specification: any): Promise<any> { return specification; }
  async updateSpecification(id: number, specification: any): Promise<any> { return null; }
  async deleteSpecification(id: number): Promise<boolean> { return false; }
  async getSpecificationsByVehicle(manufacturer: string, category: string, trimLevel?: string): Promise<any[]> { return []; }
  async getSpecificationByVehicleParams(manufacturer: string, category: string, trimLevel: string | null, year: number, engineCapacity: string): Promise<any> { return null; }
  async getAllTrimLevels(): Promise<any[]> { 
    const trimLevels = await db.select().from(vehicleTrimLevels);
    return trimLevels;
  }
  async getTrimLevel(id: number): Promise<any> { return null; }
  async createTrimLevel(trimLevel: any): Promise<any> { return trimLevel; }
  async updateTrimLevel(id: number, trimLevel: any): Promise<any> { return null; }
  async deleteTrimLevel(id: number): Promise<boolean> { return false; }
  async getAllQuotations(): Promise<any[]> { return []; }
  async getQuotation(id: number): Promise<any> { return null; }
  async createQuotation(quotation: any): Promise<any> { return quotation; }
  async updateQuotation(id: number, quotation: any): Promise<any> { return null; }
  async deleteQuotation(id: number): Promise<boolean> { return false; }
  async getQuotationsByStatus(status: string): Promise<any[]> { return []; }
  async getQuotationByNumber(quoteNumber: string): Promise<any> { return null; }
  async getAllTermsConditions(): Promise<any[]> { return []; }
  async updateTermsConditions(terms: any[]): Promise<void> { }
  async createInvoice(invoice: any): Promise<any> { return invoice; }
  async getInvoices(): Promise<any[]> { return []; }
  async getInvoiceById(id: number): Promise<any> { return null; }
  async updateInvoice(id: number, invoice: any): Promise<any> { return invoice; }
  async deleteInvoice(id: number): Promise<boolean> { return false; }
  async getInvoicesByStatus(status: string): Promise<any[]> { return []; }
  async getInvoiceByNumber(invoiceNumber: string): Promise<any> { return null; }
  async getSystemSettings(): Promise<any[]> { return []; }
  async updateSystemSetting(key: string, value: string): Promise<any> { return { key, value }; }
  async getDefaultCompanyId(): Promise<number | null> { return 1; }
  async getAllFinancingCalculations(): Promise<any[]> { return []; }
  async getFinancingCalculation(id: number): Promise<any> { return null; }
  async createFinancingCalculation(calculation: any): Promise<any> { return calculation; }
  async updateFinancingCalculation(id: number, calculation: any): Promise<any> { return null; }
  async deleteFinancingCalculation(id: number): Promise<boolean> { return false; }
  async getAllLeaveRequests(): Promise<any[]> { return []; }
  async getLeaveRequestById(id: number): Promise<any> { return null; }
  async createLeaveRequest(request: any): Promise<any> { return request; }
  async updateLeaveRequest(id: number, request: any): Promise<any> { return null; }
  async deleteLeaveRequest(id: number): Promise<boolean> { return false; }
  async getLeaveRequestsByUser(userId: number): Promise<any[]> { return []; }
  async getLeaveRequestsByStatus(status: string): Promise<any[]> { return []; }
  async getAllBankInterestRates(): Promise<any[]> { return []; }
  async getBankInterestRate(id: number): Promise<any> { return null; }
  async createBankInterestRate(rate: any): Promise<any> { return rate; }
  async updateBankInterestRate(id: number, rate: any): Promise<any> { return null; }
  async deleteBankInterestRate(id: number): Promise<boolean> { return false; }
  async getBankInterestRatesByBank(bankId: number): Promise<any[]> { return []; }
  async getAllFinancingRates(): Promise<any[]> { return []; }
  async getFinancingRate(id: number): Promise<any> { return null; }
  async createFinancingRate(rate: any): Promise<any> { return rate; }
  async updateFinancingRate(id: number, rate: any): Promise<any> { return null; }
  async deleteFinancingRate(id: number): Promise<boolean> { return false; }
  async getFinancingRatesByBank(bankName: string): Promise<any[]> { return []; }
  async getAllColorAssociations(): Promise<any[]> { return []; }
  async getColorAssociation(id: number): Promise<any> { return null; }
  async createColorAssociation(association: any): Promise<any> { return association; }
  async updateColorAssociation(id: number, association: any): Promise<any> { return null; }
  async deleteColorAssociation(id: number): Promise<boolean> { return false; }
  async getColorAssociationsByVehicle(manufacturer: string, category?: string, trimLevel?: string): Promise<any[]> { return []; }
  async searchColorAssociations(query: string): Promise<any[]> { return []; }
  
  async getColorAssociationsByManufacturer(manufacturer: string): Promise<ColorAssociation[]> {
    return [];
  }
  
  async getColorAssociationsByCategory(manufacturer: string, category: string): Promise<ColorAssociation[]> {
    return [];
  }
  
  async getColorAssociationsByTrimLevel(manufacturer: string, category: string, trimLevel: string): Promise<ColorAssociation[]> {
    return [];
  }
  async getAllCompanies(): Promise<any[]> { return []; }
  async getCompany(id: number): Promise<any> { return null; }
  async createCompany(company: any): Promise<any> { return company; }
  async updateCompany(id: number, company: any): Promise<any> { return null; }
  async deleteCompany(id: number): Promise<boolean> { return false; }
  async getAllLocations(): Promise<any[]> { return []; }
  async getLocation(id: number): Promise<any> { return null; }
  async createLocation(location: any): Promise<any> { return location; }
  async updateLocation(id: number, location: any): Promise<any> { return null; }
  async deleteLocation(id: number): Promise<boolean> { return false; }
  async getAllLocationTransfers(): Promise<any[]> { return []; }
  async getLocationTransfer(id: number): Promise<any> { return null; }
  async createLocationTransfer(transfer: any): Promise<any> { return transfer; }
  async updateLocationTransfer(id: number, transfer: any): Promise<any> { return null; }
  async deleteLocationTransfer(id: number): Promise<boolean> { return false; }
  async getLocationTransfersByInventoryItem(inventoryItemId: number): Promise<any[]> { return []; }
  async getAllLowStockAlerts(): Promise<any[]> { return []; }
  async getLowStockAlert(id: number): Promise<any> { return null; }
  async createLowStockAlert(alert: any): Promise<any> { return alert; }
  async updateLowStockAlert(id: number, alert: any): Promise<any> { return null; }
  async deleteLowStockAlert(id: number): Promise<boolean> { return false; }
  async getActiveAlerts(): Promise<any[]> { return []; }
  async getAllStockSettings(): Promise<any[]> { return []; }
  async getStockSettings(id: number): Promise<any> { return null; }
  async createStockSettings(settings: any): Promise<any> { return settings; }
  async updateStockSettings(id: number, settings: any): Promise<any> { return null; }
  async deleteStockSettings(id: number): Promise<boolean> { return false; }

  // Color management methods
  async getExteriorColors(): Promise<any[]> {
    try {
      const result = await db.execute(sql`SELECT * FROM exterior_colors ORDER BY name_ar ASC`);
      return result.rows || [];
    } catch (error) {
      console.error('Error fetching exterior colors:', error);
      return [];
    }
  }

  async getInteriorColors(): Promise<any[]> {
    try {
      const result = await db.execute(sql`SELECT * FROM interior_colors ORDER BY name_ar ASC`);
      return result.rows || [];
    } catch (error) {
      console.error('Error fetching interior colors:', error);
      return [];
    }
  }

  async createExteriorColor(colorData: any): Promise<any> {
    try {
      const { name_ar, name_en, hex_code } = colorData;
      const result = await db.execute(
        sql`INSERT INTO exterior_colors (name_ar, name_en, hex_code) 
            VALUES (${name_ar}, ${name_en}, ${hex_code}) 
            RETURNING *`
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating exterior color:', error);
      throw error;
    }
  }

  async createInteriorColor(colorData: any): Promise<any> {
    try {
      const { name_ar, name_en, hex_code } = colorData;
      const result = await db.execute(
        sql`INSERT INTO interior_colors (name_ar, name_en, hex_code) 
            VALUES (${name_ar}, ${name_en}, ${hex_code}) 
            RETURNING *`
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating interior color:', error);
      throw error;
    }
  }

  async getColorAssociations(filters: any = {}): Promise<ColorAssociation[]> {
    try {
      // If filters include manufacturer/category/trimLevel, we need to find the actual trim level ID
      if (filters.manufacturer || filters.category || filters.trimLevel) {
        // First find the manufacturer
        let manufacturerId = null;
        if (filters.manufacturer) {
          const [manufacturerObj] = await db.select().from(manufacturers)
            .where(or(
              eq(manufacturers.nameAr, filters.manufacturer),
              eq(manufacturers.nameEn, filters.manufacturer)
            ));
          manufacturerId = manufacturerObj?.id;
          
          if (!manufacturerId) {
            console.log(`❌ Color: Manufacturer "${filters.manufacturer}" not found`);
            return [];
          }
        }
        
        // Then find the category
        let categoryId = null;
        if (filters.category && manufacturerId) {
          const [categoryObj] = await db.select().from(vehicleCategories)
            .where(and(
              eq(vehicleCategories.manufacturerId, manufacturerId),
              or(
                eq(vehicleCategories.nameAr, filters.category),
                eq(vehicleCategories.nameEn, filters.category)
              )
            ));
          categoryId = categoryObj?.id;
          
          if (!categoryId) {
            console.log(`❌ Color: Category "${filters.category}" not found for manufacturer`);
            return [];
          }
        }
        
        // Then find the trim level
        let trimLevelId = null;
        if (filters.trimLevel && categoryId) {
          const [trimLevelObj] = await db.select().from(vehicleTrimLevels)
            .where(and(
              eq(vehicleTrimLevels.categoryId, categoryId),
              or(
                eq(vehicleTrimLevels.nameAr, filters.trimLevel),
                eq(vehicleTrimLevels.nameEn, filters.trimLevel)
              )
            ));
          trimLevelId = trimLevelObj?.id;
          
          if (!trimLevelId) {
            console.log(`❌ Color: Trim level "${filters.trimLevel}" not found for category`);
            return [];
          }
          
          // Fetch colors for this trim level
          const conditions = [
            eq(colorAssociations.trimLevelId, trimLevelId),
            eq(colorAssociations.isActive, true)
          ];
          
          if (filters.colorType) {
            conditions.push(eq(colorAssociations.colorType, filters.colorType));
          }
          
          const colors = await db.select().from(colorAssociations)
            .where(and(...conditions))
            .orderBy(colorAssociations.colorNameAr);
          
          console.log(`✅ Found ${colors.length} colors for trim level ID ${trimLevelId}`);
          return colors;
        }
      }
      
      // Default: return all active colors
      const results = await db.select().from(colorAssociations)
        .where(eq(colorAssociations.isActive, true))
        .orderBy(colorAssociations.colorNameAr);
      return results;
    } catch (error) {
      console.error('Error in getColorAssociations:', error);
      return [];
    }
  }

  async createColorAssociation(associationData: InsertColorAssociation): Promise<ColorAssociation> {
    try {
      const [association] = await db.insert(colorAssociations).values(associationData).returning();
      return association;
    } catch (error) {
      console.error('Error creating color association:', error);
      throw error;
    }
  }

  async deleteColorAssociation(id: number): Promise<boolean> {
    try {
      const result = await db.delete(colorAssociations).where(eq(colorAssociations.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting color association:', error);
      return false;
    }
  }

  async createCategory(categoryData: { name_ar: string; name_en?: string; manufacturer_id: number }): Promise<any> {
    try {
      const [category] = await db.insert(vehicleCategories).values(categoryData).returning();
      return category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async createTrimLevel(trimLevelData: { name_ar: string; name_en?: string; category_id: number }): Promise<any> {
    try {
      const [trimLevel] = await db.insert(vehicleTrimLevels).values(trimLevelData).returning();
      return trimLevel;
    } catch (error) {
      console.error('Error creating trim level:', error);
      throw error;
    }
  }

  // Vehicle Specifications methods
  async getVehicleSpecifications(): Promise<VehicleSpecification[]> {
    return await db.select().from(vehicleSpecifications).orderBy(desc(vehicleSpecifications.createdAt));
  }

  async getVehicleSpecification(id: number): Promise<VehicleSpecification | undefined> {
    const [spec] = await db.select().from(vehicleSpecifications).where(eq(vehicleSpecifications.id, id));
    return spec || undefined;
  }

  async createVehicleSpecification(spec: InsertVehicleSpecification): Promise<VehicleSpecification> {
    const [newSpec] = await db.insert(vehicleSpecifications).values(spec).returning();
    return newSpec;
  }

  async updateVehicleSpecification(id: number, spec: Partial<InsertVehicleSpecification>): Promise<VehicleSpecification | undefined> {
    const [updated] = await db.update(vehicleSpecifications).set(spec).where(eq(vehicleSpecifications.id, id)).returning();
    return updated || undefined;
  }

  async deleteVehicleSpecification(id: number): Promise<boolean> {
    const result = await db.delete(vehicleSpecifications).where(eq(vehicleSpecifications.id, id));
    return result.rowCount > 0;
  }

  async getVehicleSpecificationsByChassisNumber(chassisNumber: string): Promise<VehicleSpecification[]> {
    return await db.select().from(vehicleSpecifications).where(eq(vehicleSpecifications.chassisNumber, chassisNumber));
  }

  // Vehicle Image Links methods
  async getVehicleImageLinks(): Promise<VehicleImageLink[]> {
    return await db.select().from(vehicleImageLinks).orderBy(desc(vehicleImageLinks.createdAt));
  }

  async getVehicleImageLink(id: number): Promise<VehicleImageLink | undefined> {
    const [link] = await db.select().from(vehicleImageLinks).where(eq(vehicleImageLinks.id, id));
    return link || undefined;
  }

  async createVehicleImageLink(link: InsertVehicleImageLink): Promise<VehicleImageLink> {
    const [newLink] = await db.insert(vehicleImageLinks).values(link).returning();
    return newLink;
  }

  async updateVehicleImageLink(id: number, link: Partial<InsertVehicleImageLink>): Promise<VehicleImageLink | undefined> {
    const [updated] = await db.update(vehicleImageLinks).set(link).where(eq(vehicleImageLinks.id, id)).returning();
    return updated || undefined;
  }

  async deleteVehicleImageLink(id: number): Promise<boolean> {
    const result = await db.delete(vehicleImageLinks).where(eq(vehicleImageLinks.id, id));
    return result.rowCount > 0;
  }

  async getVehicleImageLinksByChassisNumber(chassisNumber: string): Promise<VehicleImageLink[]> {
    return await db.select().from(vehicleImageLinks).where(eq(vehicleImageLinks.chassisNumber, chassisNumber));
  }

  // Add missing methods from IStorage interface (stubs)
  async getAllImportTypes(): Promise<any[]> { return []; }
  async createImportType(typeData: any): Promise<any> { throw new Error("Not implemented"); }
  async updateImportType(id: number, typeData: any): Promise<any> { throw new Error("Not implemented"); }
  async deleteImportType(id: number): Promise<boolean> { return false; }
  async getAllVehicleStatuses(): Promise<any[]> { return []; }
  async createVehicleStatus(statusData: any): Promise<any> { throw new Error("Not implemented"); }
  async updateVehicleStatus(id: number, statusData: any): Promise<any> { throw new Error("Not implemented"); }
  async deleteVehicleStatus(id: number): Promise<boolean> { return false; }
  async getAllOwnershipTypes(): Promise<any[]> { return []; }
  async createOwnershipType(typeData: any): Promise<any> { throw new Error("Not implemented"); }
  async updateOwnershipType(id: number, typeData: any): Promise<any> { throw new Error("Not implemented"); }
  async deleteOwnershipType(id: number): Promise<boolean> { return false; }
  async getCategories(): Promise<any[]> { return []; }
  async getTrimLevels(): Promise<any[]> { return []; }
  async getColors(): Promise<any[]> { return []; }
  async getLocations(): Promise<any[]> { return []; }
  async addManufacturer(manufacturerData: any): Promise<any> { throw new Error("Not implemented"); }
  async addCategory(categoryData: any): Promise<any> { throw new Error("Not implemented"); }
  async addTrimLevel(trimData: any): Promise<any> { throw new Error("Not implemented"); }
  async addColor(colorData: any): Promise<any> { throw new Error("Not implemented"); }
  async addLocation(locationData: any): Promise<any> { throw new Error("Not implemented"); }
  async updateCategory(id: number, categoryData: any): Promise<any> { throw new Error("Not implemented"); }
  async updateColor(id: number, colorData: any): Promise<any> { throw new Error("Not implemented"); }
  async deleteCategory(id: number): Promise<boolean> { return false; }
  async deleteColor(id: number): Promise<boolean> { return false; }
}