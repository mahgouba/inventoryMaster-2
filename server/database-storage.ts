import { 
  users, inventoryItems, banks, manufacturers, companies, quotations,
  type User, type InsertUser, 
  type InventoryItem, type InsertInventoryItem,
  type Bank, type InsertBank,
  type Manufacturer, type InsertManufacturer,
  type Company, type InsertCompany,
  type Quotation, type InsertQuotation
} from "@shared/schema";
import { db } from "./db";

// Check if database is available
const isDatabaseAvailable = () => db !== null;

// Throw error if database operations are attempted without database
const requireDatabase = () => {
  if (!isDatabaseAvailable()) {
    throw new Error("Database not available - DATABASE_URL not configured");
  }
};
import { eq, like, or, and, sql, desc } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  // Inventory methods
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

  async updateInventoryItem(id: number, itemData: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [item] = await db.update(inventoryItems).set(itemData).where(eq(inventoryItems.id, id)).returning();
    return item || undefined;
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
        like(inventoryItems.manufacturer, `%${query}%`),
        like(inventoryItems.category, `%${query}%`),
        like(inventoryItems.chassisNumber, `%${query}%`),
        like(inventoryItems.notes, `%${query}%`)
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

    if (filters.category) conditions.push(eq(inventoryItems.category, filters.category));
    if (filters.status) conditions.push(eq(inventoryItems.status, filters.status));
    if (filters.year) conditions.push(eq(inventoryItems.year, filters.year));
    if (filters.manufacturer) conditions.push(eq(inventoryItems.manufacturer, filters.manufacturer));
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
    const items = await db.select().from(inventoryItems);
    const nonSoldItems = items.filter(item => !item.isSold && item.status !== "مباع");
    
    return {
      total: nonSoldItems.length,
      available: nonSoldItems.filter(item => item.status === "متوفر").length,
      inTransit: nonSoldItems.filter(item => item.status === "في الطريق").length,
      maintenance: nonSoldItems.filter(item => item.status === "في الصيانة").length,
      reserved: nonSoldItems.filter(item => item.status === "محجوز").length,
      sold: items.filter(item => item.isSold || item.status === "مباع").length,
      personal: nonSoldItems.filter(item => item.importType === "شخصي").length,
      company: nonSoldItems.filter(item => item.importType === "شركة").length,
      usedPersonal: nonSoldItems.filter(item => item.importType === "مستعمل شخصي").length,
    };
  }

  async getManufacturerStats(): Promise<Array<{
    manufacturer: string;
    total: number;
    personal: number;
    company: number;
    usedPersonal: number;
    logo?: string | null;
  }>> {
    const items = await db.select().from(inventoryItems);
    const nonSoldItems = items.filter(item => !item.isSold && item.status !== "مباع");
    const manufacturerLogos = await db.select().from(manufacturers);
    
    const manufacturerStats = new Map();
    
    nonSoldItems.forEach(item => {
      if (!manufacturerStats.has(item.manufacturer)) {
        manufacturerStats.set(item.manufacturer, {
          manufacturer: item.manufacturer,
          total: 0,
          personal: 0,
          company: 0,
          usedPersonal: 0,
          logo: manufacturerLogos.find(m => m.name === item.manufacturer)?.logo || null
        });
      }
      
      const stats = manufacturerStats.get(item.manufacturer);
      stats.total++;
      
      if (item.importType === "شخصي") stats.personal++;
      else if (item.importType === "شركة") stats.company++;
      else if (item.importType === "مستعمل شخصي") stats.usedPersonal++;
    });
    
    return Array.from(manufacturerStats.values());
  }

  async getLocationStats(): Promise<Array<{
    location: string;
    total: number;
    available: number;
    inTransit: number;
    maintenance: number;
    sold: number;
  }>> {
    const items = await db.select().from(inventoryItems);
    const locationStats = new Map();
    
    items.forEach(item => {
      if (!locationStats.has(item.location)) {
        locationStats.set(item.location, {
          location: item.location,
          total: 0,
          available: 0,
          inTransit: 0,
          maintenance: 0,
          sold: 0
        });
      }
      
      const stats = locationStats.get(item.location);
      stats.total++;
      
      if (item.isSold || item.status === "مباع") stats.sold++;
      else if (item.status === "متوفر") stats.available++;
      else if (item.status === "في الطريق") stats.inTransit++;
      else if (item.status === "في الصيانة") stats.maintenance++;
    });
    
    return Array.from(locationStats.values());
  }

  async transferItem(id: number, newLocation: string, reason?: string, transferredBy?: string): Promise<boolean> {
    const item = await this.updateInventoryItem(id, { location: newLocation });
    return !!item;
  }

  // Bank methods
  async getAllBanks(): Promise<Bank[]> {
    return await db.select().from(banks).orderBy(banks.bankName);
  }

  async getBank(id: number): Promise<Bank | undefined> {
    const [bank] = await db.select().from(banks).where(eq(banks.id, id));
    return bank || undefined;
  }

  async getBanksByType(type: string): Promise<Bank[]> {
    return await db.select().from(banks).where(eq(banks.type, type));
  }

  async createBank(bank: InsertBank): Promise<Bank> {
    const [newBank] = await db.insert(banks).values(bank).returning();
    return newBank;
  }

  async updateBank(id: number, bankData: Partial<InsertBank>): Promise<Bank | undefined> {
    const [bank] = await db.update(banks).set(bankData).where(eq(banks.id, id)).returning();
    return bank || undefined;
  }

  async deleteBank(id: number): Promise<boolean> {
    const result = await db.delete(banks).where(eq(banks.id, id));
    return result.rowCount > 0;
  }

  // Manufacturer methods
  async getAllManufacturers(): Promise<Manufacturer[]> {
    return await db.select().from(manufacturers).orderBy(manufacturers.name);
  }

  async getManufacturer(id: number): Promise<Manufacturer | undefined> {
    const [manufacturer] = await db.select().from(manufacturers).where(eq(manufacturers.id, id));
    return manufacturer || undefined;
  }

  async createManufacturer(manufacturer: InsertManufacturer): Promise<Manufacturer> {
    const [newManufacturer] = await db.insert(manufacturers).values(manufacturer).returning();
    return newManufacturer;
  }

  async updateManufacturer(id: number, manufacturerData: Partial<InsertManufacturer>): Promise<Manufacturer | undefined> {
    const [manufacturer] = await db.update(manufacturers).set(manufacturerData).where(eq(manufacturers.id, id)).returning();
    return manufacturer || undefined;
  }

  async deleteManufacturer(id: number): Promise<boolean> {
    const result = await db.delete(manufacturers).where(eq(manufacturers.id, id));
    return result.rowCount > 0;
  }

  // Company methods  
  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(companies.name);
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: number, companyData: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db.update(companies).set(companyData).where(eq(companies.id, id)).returning();
    return company || undefined;
  }

  async deleteCompany(id: number): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id));
    return result.rowCount > 0;
  }

  // Quotation methods
  async getAllQuotations(): Promise<Quotation[]> {
    return await db.select().from(quotations).orderBy(desc(quotations.createdAt));
  }

  async getQuotation(id: number): Promise<Quotation | undefined> {
    const [quotation] = await db.select().from(quotations).where(eq(quotations.id, id));
    return quotation || undefined;
  }

  async createQuotation(quotation: InsertQuotation): Promise<Quotation> {
    const [newQuotation] = await db.insert(quotations).values(quotation).returning();
    return newQuotation;
  }

  async updateQuotation(id: number, quotationData: Partial<InsertQuotation>): Promise<Quotation | undefined> {
    const [quotation] = await db.update(quotations).set(quotationData).where(eq(quotations.id, id)).returning();
    return quotation || undefined;
  }

  async deleteQuotation(id: number): Promise<boolean> {
    const result = await db.delete(quotations).where(eq(quotations.id, id));
    return result.rowCount > 0;
  }

  // Placeholder methods for other required interface methods
  async getReservedItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).where(eq(inventoryItems.status, "محجوز"));
  }

  // Stub implementations for other interface methods
  async getAllTermsConditions(): Promise<any[]> { return []; }
  async getTermsConditions(id: number): Promise<any> { return undefined; }
  async createTermsConditions(data: any): Promise<any> { return data; }
  async updateTermsConditions(id: number, data: any): Promise<any> { return data; }
  async deleteTermsConditions(id: number): Promise<boolean> { return true; }
  
  async getAllSpecifications(): Promise<any[]> { return []; }
  async getSpecification(id: number): Promise<any> { return undefined; }
  async createSpecification(data: any): Promise<any> { return data; }
  async updateSpecification(id: number, data: any): Promise<any> { return data; }
  async deleteSpecification(id: number): Promise<boolean> { return true; }
  async searchSpecifications(manufacturer: string, category: string, year: number): Promise<any[]> { return []; }

  async getAllTrimLevels(): Promise<any[]> { return []; }
  async getTrimLevel(id: number): Promise<any> { return undefined; }
  async createTrimLevel(data: any): Promise<any> { return data; }
  async updateTrimLevel(id: number, data: any): Promise<any> { return data; }
  async deleteTrimLevel(id: number): Promise<boolean> { return true; }

  async getAllAppearanceSettings(): Promise<any[]> { return []; }
  async getAppearanceSettings(): Promise<any> { return null; }
  async updateAppearanceSettings(data: any): Promise<any> { return data; }

  async getAllSystemSettings(): Promise<any[]> { return []; }
  async getSystemSettings(): Promise<any> { return null; }
  async updateSystemSettings(data: any): Promise<any> { return data; }

  async getAllFinancingCalculations(): Promise<any[]> { return []; }
  async getFinancingCalculation(id: number): Promise<any> { return undefined; }
  async createFinancingCalculation(data: any): Promise<any> { return data; }
  async deleteFinancingCalculation(id: number): Promise<boolean> { return true; }

  async getAllLocations(): Promise<any[]> { return []; }
  async getLocation(id: number): Promise<any> { return undefined; }
  async createLocation(data: any): Promise<any> { return data; }
  async updateLocation(id: number, data: any): Promise<any> { return data; }
  async deleteLocation(id: number): Promise<boolean> { return true; }

  async getAllLocationTransfers(): Promise<any[]> { return []; }
  async createLocationTransfer(data: any): Promise<any> { return data; }
  async getLocationTransfer(id: number): Promise<any> { return undefined; }
  async updateLocationTransfer(id: number, data: any): Promise<any> { return data; }
  async deleteLocationTransfer(id: number): Promise<boolean> { return true; }
  async getLocationTransfersByItem(itemId: number): Promise<any[]> { return []; }

  // Additional missing methods
  async getSoldItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).where(
      or(eq(inventoryItems.status, "مباع"), eq(inventoryItems.isSold, true))
    );
  }

  async clearAllInventoryItems(): Promise<boolean> {
    const result = await db.delete(inventoryItems);
    return true;
  }

  async searchInventoryItems(query: string): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).where(
      or(
        like(inventoryItems.manufacturer, `%${query}%`),
        like(inventoryItems.category, `%${query}%`),
        like(inventoryItems.chassisNumber, `%${query}%`),
        like(inventoryItems.notes, `%${query}%`)
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

    if (filters.manufacturer) {
      conditions.push(eq(inventoryItems.manufacturer, filters.manufacturer));
    }
    if (filters.category) {
      conditions.push(eq(inventoryItems.category, filters.category));
    }
    if (filters.status) {
      conditions.push(eq(inventoryItems.status, filters.status));
    }
    if (filters.year) {
      conditions.push(eq(inventoryItems.year, filters.year));
    }
    if (filters.importType) {
      conditions.push(eq(inventoryItems.importType, filters.importType));
    }
    if (filters.location) {
      conditions.push(eq(inventoryItems.location, filters.location));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async getManufacturerByName(name: string): Promise<Manufacturer | undefined> {
    const [manufacturer] = await db.select().from(manufacturers).where(eq(manufacturers.name, name));
    return manufacturer || undefined;
  }

  async getSpecificationsByVehicle(manufacturer: string, category: string, trimLevel?: string): Promise<any[]> {
    return [];
  }

  async getSpecificationByVehicleParams(manufacturer: string, category: string, trimLevel: string | null, year: number, engineCapacity: string): Promise<any | undefined> {
    return undefined;
  }

  async getTrimLevelsByCategory(manufacturer: string, category: string): Promise<any[]> {
    return [];
  }

  async getAllCategories(): Promise<{ category: string }[]> {
    const items = await db.select().from(inventoryItems);
    const categories = [...new Set(items.map(item => item.category))];
    return categories.map(category => ({ category }));
  }

  async getCategoriesByManufacturer(manufacturer: string): Promise<{ category: string }[]> {
    const items = await db.select().from(inventoryItems).where(eq(inventoryItems.manufacturer, manufacturer));
    const categories = [...new Set(items.map(item => item.category))];
    return categories.map(category => ({ category }));
  }

  async getAllEngineCapacities(): Promise<{ engineCapacity: string }[]> {
    const items = await db.select().from(inventoryItems);
    const capacities = [...new Set(items.map(item => item.engineCapacity))];
    return capacities.map(engineCapacity => ({ engineCapacity }));
  }

  async getQuotationsByStatus(status: string): Promise<Quotation[]> {
    return await db.select().from(quotations).where(eq(quotations.status, status));
  }

  async getQuotationByNumber(quoteNumber: string): Promise<Quotation | undefined> {
    const [quotation] = await db.select().from(quotations).where(eq(quotations.quoteNumber, quoteNumber));
    return quotation || undefined;
  }

  async updateTermsConditions(terms: Array<{ id: number; term_text: string; display_order: number }>): Promise<void> {
    // Implementation for terms and conditions
  }

  async createInvoice(invoice: any): Promise<any> {
    return invoice;
  }

  async getInvoices(): Promise<any[]> {
    return [];
  }

  async getInvoiceById(id: number): Promise<any | undefined> {
    return undefined;
  }

  async updateInvoice(id: number, invoice: any): Promise<any> {
    return invoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    return true;
  }

  async getInvoicesByStatus(status: string): Promise<any[]> {
    return [];
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<any | undefined> {
    return undefined;
  }

  async getSystemSettings(): Promise<Array<{key: string, value: string}>> {
    return [];
  }

  async updateSystemSetting(key: string, value: string): Promise<{key: string, value: string}> {
    return { key, value };
  }

  async getDefaultCompanyId(): Promise<number | null> {
    return null;
  }

  async updateFinancingCalculation(id: number, calculation: any): Promise<any | undefined> {
    return calculation;
  }

  async getBankInterestRates(bankId: number): Promise<any[]> {
    return [];
  }

  async getBankInterestRate(id: number): Promise<any | undefined> {
    return undefined;
  }

  async createBankInterestRate(rateData: any): Promise<any> {
    return rateData;
  }

  async updateBankInterestRate(id: number, rateData: any): Promise<any | undefined> {
    return rateData;
  }

  async deleteBankInterestRate(id: number): Promise<boolean> {
    return true;
  }

  async getAllLeaveRequests(): Promise<any[]> {
    return [];
  }

  async getLeaveRequestById(id: number): Promise<any | undefined> {
    return undefined;
  }

  async createLeaveRequest(request: any): Promise<any> {
    return request;
  }

  async updateLeaveRequestStatus(id: number, status: string, approvedBy?: number, approvedByName?: string, rejectionReason?: string): Promise<any | undefined> {
    return undefined;
  }

  async deleteLeaveRequest(id: number): Promise<boolean> {
    return true;
  }

  async getAllFinancingRates(): Promise<any[]> {
    return [];
  }

  async getFinancingRate(id: number): Promise<any | undefined> {
    return undefined;
  }

  async createFinancingRate(rate: any): Promise<any> {
    return rate;
  }

  async updateFinancingRate(id: number, rate: any): Promise<any | undefined> {
    return rate;
  }

  async deleteFinancingRate(id: number): Promise<boolean> {
    return true;
  }

  async getFinancingRatesByType(type: string): Promise<any[]> {
    return [];
  }

  async getAllColorAssociations(): Promise<any[]> {
    return [];
  }

  async getColorAssociation(id: number): Promise<any | undefined> {
    return undefined;
  }

  async createColorAssociation(association: any): Promise<any> {
    return association;
  }

  async updateColorAssociation(id: number, association: any): Promise<any | undefined> {
    return association;
  }

  async deleteColorAssociation(id: number): Promise<boolean> {
    return true;
  }

  async getColorAssociationsByManufacturer(manufacturer: string): Promise<any[]> {
    return [];
  }

  async getColorAssociationsByCategory(manufacturer: string, category: string): Promise<any[]> {
    return [];
  }

  async getColorAssociationsByTrimLevel(manufacturer: string, category: string, trimLevel: string): Promise<any[]> {
    return [];
  }

  async getAllImageLinks(): Promise<string[]> {
    const imageLinks: string[] = [];
    
    // Collect images from inventory items
    const items = await db.select().from(inventoryItems);
    items.forEach(item => {
      if (item.images && Array.isArray(item.images)) {
        imageLinks.push(...item.images);
      }
    });
    
    // Collect images from manufacturers
    const manufacturersList = await db.select().from(manufacturers);
    manufacturersList.forEach(manufacturer => {
      if (manufacturer.logo) {
        imageLinks.push(manufacturer.logo);
      }
    });
    
    // Remove duplicates and return
    return [...new Set(imageLinks)];
  }

  async getAllLowStockAlerts(): Promise<any[]> { return []; }
  async createLowStockAlert(data: any): Promise<any> { return data; }
  async deleteLowStockAlert(id: number): Promise<boolean> { return true; }

  async getAllStockSettings(): Promise<any[]> { return []; }
  async getStockSettings(): Promise<any> { return null; }
  async updateStockSettings(data: any): Promise<any> { return data; }
}