import { 
  users, inventoryItems, manufacturers, companies, locations, locationTransfers, 
  lowStockAlerts, stockSettings, appearanceSettings, specifications, trimLevels, quotations, invoices,
  type User, type InsertUser, 
  type InventoryItem, type InsertInventoryItem, 
  type Manufacturer, type InsertManufacturer, 
  type Company, type InsertCompany,
  type Location, type InsertLocation, 
  type LocationTransfer, type InsertLocationTransfer,
  type LowStockAlert, type InsertLowStockAlert,
  type StockSettings, type InsertStockSettings,
  type AppearanceSettings, type InsertAppearanceSettings,
  type Specification, type InsertSpecification,
  type TrimLevel, type InsertTrimLevel,
  type Quotation, type InsertQuotation
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Inventory methods
  getAllInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  searchInventoryItems(query: string): Promise<InventoryItem[]>;
  filterInventoryItems(filters: { 
    category?: string; 
    status?: string; 
    year?: number; 
    manufacturer?: string;
    importType?: string;
    location?: string;
  }): Promise<InventoryItem[]>;
  getInventoryStats(): Promise<{ 
    total: number; 
    available: number; 
    inTransit: number; 
    maintenance: number;
    reserved: number;
    sold: number;
    personal: number;
    company: number;
    usedPersonal: number;
  }>;
  getManufacturerStats(): Promise<Array<{
    manufacturer: string;
    total: number;
    personal: number;
    company: number;
    usedPersonal: number;
    logo?: string | null;
  }>>;
  getLocationStats(): Promise<Array<{
    location: string;
    total: number;
    available: number;
    inTransit: number;
    maintenance: number;
    sold: number;
  }>>;
  transferItem(id: number, newLocation: string, reason?: string, transferredBy?: string): Promise<boolean>;
  
  // Location management methods
  getAllLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;
  
  // Location transfer methods
  getLocationTransfers(inventoryItemId?: number): Promise<LocationTransfer[]>;
  createLocationTransfer(transfer: InsertLocationTransfer): Promise<LocationTransfer>;
  markAsSold(id: number): Promise<boolean>;
  reserveItem(id: number, reservedBy: string, reservationNote?: string): Promise<boolean>;
  cancelReservation(id: number): Promise<boolean>;
  
  // Manufacturer methods
  getAllManufacturers(): Promise<Manufacturer[]>;
  getManufacturer(id: number): Promise<Manufacturer | undefined>;
  createManufacturer(manufacturer: InsertManufacturer): Promise<Manufacturer>;
  updateManufacturer(id: number, manufacturer: Partial<InsertManufacturer>): Promise<Manufacturer | undefined>;
  deleteManufacturer(id: number): Promise<boolean>;
  
  // Company methods
  getAllCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;
  
  // Low stock alerts methods
  getLowStockAlerts(): Promise<LowStockAlert[]>;
  getUnreadLowStockAlerts(): Promise<LowStockAlert[]>;
  createLowStockAlert(alert: InsertLowStockAlert): Promise<LowStockAlert>;
  markAlertAsRead(id: number): Promise<boolean>;
  deleteAlert(id: number): Promise<boolean>;
  checkStockLevels(): Promise<void>;
  
  // Stock settings methods
  getStockSettings(): Promise<StockSettings[]>;
  getStockSettingsByCategory(manufacturer: string, category: string): Promise<StockSettings | undefined>;
  createStockSettings(settings: InsertStockSettings): Promise<StockSettings>;
  updateStockSettings(id: number, settings: Partial<InsertStockSettings>): Promise<StockSettings | undefined>;
  deleteStockSettings(id: number): Promise<boolean>;
  
  // Appearance settings methods
  getAppearanceSettings(): Promise<AppearanceSettings | undefined>;
  updateAppearanceSettings(settings: Partial<InsertAppearanceSettings>): Promise<AppearanceSettings>;
  updateManufacturerLogo(id: number, logo: string): Promise<Manufacturer | undefined>;
  
  // Specifications methods
  getAllSpecifications(): Promise<Specification[]>;
  getSpecification(id: number): Promise<Specification | undefined>;
  createSpecification(specification: InsertSpecification): Promise<Specification>;
  updateSpecification(id: number, specification: Partial<InsertSpecification>): Promise<Specification | undefined>;
  deleteSpecification(id: number): Promise<boolean>;
  getSpecificationsByVehicle(manufacturer: string, category: string, trimLevel?: string): Promise<Specification[]>;
  getSpecificationByVehicleParams(manufacturer: string, category: string, trimLevel: string | null, year: number, engineCapacity: string): Promise<Specification | undefined>;
  
  // Trim levels methods
  getAllTrimLevels(): Promise<TrimLevel[]>;
  getTrimLevel(id: number): Promise<TrimLevel | undefined>;
  createTrimLevel(trimLevel: InsertTrimLevel): Promise<TrimLevel>;
  updateTrimLevel(id: number, trimLevel: Partial<InsertTrimLevel>): Promise<TrimLevel | undefined>;
  deleteTrimLevel(id: number): Promise<boolean>;
  getTrimLevelsByCategory(manufacturer: string, category: string): Promise<TrimLevel[]>;
  
  // Quotations methods
  getAllQuotations(): Promise<Quotation[]>;
  getQuotation(id: number): Promise<Quotation | undefined>;
  createQuotation(quotation: InsertQuotation): Promise<Quotation>;
  updateQuotation(id: number, quotation: Partial<InsertQuotation>): Promise<Quotation | undefined>;
  deleteQuotation(id: number): Promise<boolean>;
  getQuotationsByStatus(status: string): Promise<Quotation[]>;
  getQuotationByNumber(quoteNumber: string): Promise<Quotation | undefined>;
  
  // Terms and Conditions methods
  getAllTermsConditions(): Promise<Array<{ id: number; term_text: string; display_order: number }>>;
  updateTermsConditions(terms: Array<{ id: number; term_text: string; display_order: number }>): Promise<void>;
  
  // Invoice methods
  createInvoice(invoice: any): Promise<any>;
  getInvoices(): Promise<any[]>;
  getInvoiceById(id: number): Promise<any | undefined>;
  updateInvoice(id: number, invoice: any): Promise<any>;
  deleteInvoice(id: number): Promise<boolean>;
  getInvoicesByStatus(status: string): Promise<any[]>;
  getInvoiceByNumber(invoiceNumber: string): Promise<any | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private inventoryItems: Map<number, InventoryItem>;
  private manufacturers: Map<number, Manufacturer>;
  private locations: Map<number, Location>;
  private locationTransfers: Map<number, LocationTransfer>;
  private currentUserId: number;
  private currentInventoryId: number;
  private currentManufacturerId: number;
  private currentLocationId: number;
  private currentLocationTransferId: number;

  constructor() {
    this.users = new Map();
    this.inventoryItems = new Map();
    this.manufacturers = new Map();
    this.locations = new Map();
    this.locationTransfers = new Map();
    this.currentUserId = 1;
    this.currentInventoryId = 1;
    this.currentManufacturerId = 1;
    this.currentLocationId = 1;
    this.currentLocationTransferId = 1;
    
    // Initialize with some sample data
    this.initializeInventoryData();
  }

  // Add missing implementations for MemStorage (placeholder methods)
  async getLowStockAlerts(): Promise<any[]> { return []; }
  async getUnreadLowStockAlerts(): Promise<any[]> { return []; }
  async createLowStockAlert(alert: any): Promise<any> { return alert; }
  async markAlertAsRead(id: number): Promise<boolean> { return true; }
  async deleteAlert(id: number): Promise<boolean> { return true; }
  async checkStockLevels(): Promise<void> { }
  async getStockSettings(): Promise<any[]> { return []; }
  async getStockSettingsByCategory(manufacturer: string, category: string): Promise<any> { return undefined; }
  async createStockSettings(settings: any): Promise<any> { return settings; }
  async updateStockSettings(id: number, settings: any): Promise<any> { return settings; }
  async deleteStockSettings(id: number): Promise<boolean> { return true; }
  async getAppearanceSettings(): Promise<any> { return undefined; }
  async updateAppearanceSettings(settings: any): Promise<any> { return settings; }
  async updateManufacturerLogo(id: number, logo: string): Promise<any> { return undefined; }
  async getAllSpecifications(): Promise<any[]> { return []; }
  async getSpecification(id: number): Promise<any> { return undefined; }
  async createSpecification(spec: any): Promise<any> { return spec; }
  async updateSpecification(id: number, spec: any): Promise<any> { return spec; }
  async deleteSpecification(id: number): Promise<boolean> { return true; }
  async getSpecificationsByVehicle(manufacturer: string, category: string, trimLevel?: string): Promise<any[]> { return []; }
  async getAllTrimLevels(): Promise<any[]> { return []; }
  async getTrimLevel(id: number): Promise<any> { return undefined; }
  async createTrimLevel(trimLevel: any): Promise<any> { return trimLevel; }
  async updateTrimLevel(id: number, trimLevel: any): Promise<any> { return trimLevel; }
  async deleteTrimLevel(id: number): Promise<boolean> { return true; }
  async getTrimLevelsByCategory(manufacturer: string, category: string): Promise<any[]> { return []; }
  async getAllUsers(): Promise<any[]> { return []; }
  async updateUser(id: number, user: any): Promise<any> { return user; }
  async deleteUser(id: number): Promise<boolean> { return true; }
  
  // Quotation stub methods for MemStorage
  async getAllQuotations(): Promise<any[]> { return []; }
  async getQuotation(id: number): Promise<any> { return undefined; }
  async createQuotation(quotation: any): Promise<any> { return quotation; }
  async updateQuotation(id: number, quotation: any): Promise<any> { return quotation; }
  async deleteQuotation(id: number): Promise<boolean> { return true; }
  async getQuotationsByStatus(status: string): Promise<any[]> { return []; }
  async getQuotationByNumber(quoteNumber: string): Promise<any> { return undefined; }

  private initializeInventoryData() {
    const sampleItems: InsertInventoryItem[] = [
      {
        category: "لاتوبيغرافي",
        engineCapacity: "V6",
        year: 2025,
        exteriorColor: "أسود",
        interiorColor: "أبيض",
        status: "في الطريق",
        importType: "شخصي",
        manufacturer: "مرسيدس",
        location: "الميناء",
        chassisNumber: "WASSBER0056464",
        images: []
      },
      {
        category: "لاتوبيغرافي",
        engineCapacity: "V6",
        year: 2024,
        exteriorColor: "أسود",
        interiorColor: "أبيض",
        status: "في الطريق",
        importType: "شركة",
        manufacturer: "لاند روفر",
        location: "المعرض",
        chassisNumber: "WASSBER0056465",
        images: []
      },
      {
        category: "لاتوبيغرافي",
        engineCapacity: "V8",
        year: 2025,
        exteriorColor: "أسود",
        interiorColor: "أبيض",
        status: "متوفر",
        importType: "مستعمل شخصي",
        manufacturer: "مرسيدس",
        location: "الورشة",
        chassisNumber: "WASSBER0056466",
        images: []
      },
      {
        category: "أوتوماتيكي",
        engineCapacity: "V6",
        year: 2024,
        exteriorColor: "أسود",
        interiorColor: "رمادي",
        status: "قيد الصيانة",
        importType: "شخصي",
        manufacturer: "لاند روفر",
        location: "مستودع فرعي",
        chassisNumber: "WASSBER0087523",
        images: []
      },
      {
        category: "يدوي",
        engineCapacity: "V8",
        year: 2025,
        exteriorColor: "أبيض",
        interiorColor: "أسود",
        status: "متوفر",
        importType: "شركة",
        manufacturer: "مرسيدس",
        location: "المستودع الرئيسي",
        chassisNumber: "WASSBER0098765",
        images: []
      },
      {
        category: "E200",
        engineCapacity: "2.0L",
        year: 2023,
        exteriorColor: "أحمر",
        interiorColor: "بيج",
        status: "مباع",
        importType: "شخصي",
        manufacturer: "مرسيدس",
        location: "المعرض",
        chassisNumber: "WDB4566001234",
        images: [],
        isSold: true,
        soldDate: new Date("2024-12-15")
      },
      {
        category: "320i",
        engineCapacity: "2.0L",
        year: 2022,
        exteriorColor: "أزرق",
        interiorColor: "أسود",
        status: "مباع",
        importType: "شركة",
        manufacturer: "بي ام دبليو",
        location: "المعرض",
        chassisNumber: "WBA5566005678",
        images: [],
        isSold: true,
        soldDate: new Date("2024-11-20")
      }
    ];

    sampleItems.forEach(item => {
      this.createInventoryItem(item);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values());
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.currentInventoryId++;
    const item: InventoryItem = { 
      ...insertItem, 
      id, 
      entryDate: new Date(),
      isSold: insertItem.isSold || false,
      images: insertItem.images || [],
      logo: insertItem.logo || null,
      notes: insertItem.notes || null
    };
    this.inventoryItems.set(id, item);
    return item;
  }

  async updateInventoryItem(id: number, updateData: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const existingItem = this.inventoryItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem: InventoryItem = { ...existingItem, ...updateData };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }

  async searchInventoryItems(query: string): Promise<InventoryItem[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.inventoryItems.values()).filter(item =>
      item.category.toLowerCase().includes(lowerQuery) ||
      item.engineCapacity.toLowerCase().includes(lowerQuery) ||
      item.exteriorColor.toLowerCase().includes(lowerQuery) ||
      item.interiorColor.toLowerCase().includes(lowerQuery) ||
      item.status.toLowerCase().includes(lowerQuery) ||
      item.importType.toLowerCase().includes(lowerQuery) ||
      item.manufacturer.toLowerCase().includes(lowerQuery) ||
      item.chassisNumber.toLowerCase().includes(lowerQuery)
    );
  }

  async filterInventoryItems(filters: { 
    category?: string; 
    status?: string; 
    year?: number; 
    manufacturer?: string;
    importType?: string;
  }): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(item => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.year && item.year !== filters.year) return false;
      if (filters.manufacturer && item.manufacturer !== filters.manufacturer) return false;
      if (filters.importType && item.importType !== filters.importType) return false;
      return true;
    });
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
    const items = Array.from(this.inventoryItems.values());
    return {
      total: items.length,
      available: items.filter(item => item.status === "متوفر").length,
      inTransit: items.filter(item => item.status === "في الطريق").length,
      maintenance: items.filter(item => item.status === "قيد الصيانة").length,
      reserved: items.filter(item => item.status === "محجوز").length,
      sold: items.filter(item => item.isSold).length,
      personal: items.filter(item => item.importType === "شخصي").length,
      company: items.filter(item => item.importType === "شركة").length,
      usedPersonal: items.filter(item => item.importType === "مستعمل شخصي").length,
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
    const items = Array.from(this.inventoryItems.values());
    
    // استبعاد السيارات المباعة
    const availableItems = items.filter(item => item.status !== "مباع");
    const manufacturerSet = new Set(availableItems.map(item => item.manufacturer));
    const manufacturerNames = Array.from(manufacturerSet);
    
    return manufacturerNames.map(manufacturerName => {
      const manufacturerItems = availableItems.filter(item => item.manufacturer === manufacturerName);
      const manufacturerEntity = Array.from(this.manufacturers.values()).find(m => m.name === manufacturerName);
      
      return {
        manufacturer: manufacturerName,
        total: manufacturerItems.length,
        personal: manufacturerItems.filter(item => item.importType === "شخصي").length,
        company: manufacturerItems.filter(item => item.importType === "شركة").length,
        usedPersonal: manufacturerItems.filter(item => item.importType === "مستعمل شخصي").length,
        logo: manufacturerEntity?.logo || null,
      };
    });
  }

  async markAsSold(id: number): Promise<boolean> {
    const item = this.inventoryItems.get(id);
    if (!item) return false;
    
    const updatedItem = { ...item, isSold: true, soldDate: new Date() };
    this.inventoryItems.set(id, updatedItem);
    return true;
  }

  async reserveItem(id: number): Promise<boolean> {
    const item = this.inventoryItems.get(id);
    if (!item) return false;
    
    const updatedItem = { ...item, status: "محجوز", reservationDate: new Date() };
    this.inventoryItems.set(id, updatedItem);
    return true;
  }

  async getLocationStats(): Promise<Array<{
    location: string;
    total: number;
    available: number;
    inTransit: number;
    maintenance: number;
    sold: number;
  }>> {
    const items = Array.from(this.inventoryItems.values());
    const locationSet = new Set(items.map(item => item.location));
    const locations = Array.from(locationSet);
    
    return locations.map(location => {
      const locationItems = items.filter(item => item.location === location);
      return {
        location,
        total: locationItems.length,
        available: locationItems.filter(item => item.status === "متوفر").length,
        inTransit: locationItems.filter(item => item.status === "في الطريق").length,
        maintenance: locationItems.filter(item => item.status === "صيانة").length,
        sold: locationItems.filter(item => item.isSold).length,
      };
    });
  }

  async transferItem(id: number, newLocation: string, reason?: string, transferredBy?: string): Promise<boolean> {
    const item = this.inventoryItems.get(id);
    if (!item) return false;
    
    const updatedItem = { ...item, location: newLocation };
    this.inventoryItems.set(id, updatedItem);
    return true;
  }

  // Location management methods (stub implementations for memory storage)
  async getAllLocations(): Promise<Location[]> {
    const items = Array.from(this.inventoryItems.values());
    const locationNames = [...new Set(items.map(item => item.location))];
    
    return locationNames.map((name, index) => ({
      id: index + 1,
      name,
      description: null,
      address: null,
      manager: null,
      phone: null,
      capacity: null,
      isActive: true,
      createdAt: new Date(),
    }));
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const locations = await this.getAllLocations();
    return locations.find(loc => loc.id === id);
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const locations = await this.getAllLocations();
    const newLocation: Location = {
      id: locations.length + 1,
      ...location,
      createdAt: new Date(),
    };
    return newLocation;
  }

  async updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined> {
    const existing = await this.getLocation(id);
    if (!existing) return undefined;
    
    return { ...existing, ...location };
  }

  async deleteLocation(id: number): Promise<boolean> {
    return true; // Stub implementation
  }

  async getLocationTransfers(inventoryItemId?: number): Promise<LocationTransfer[]> {
    return []; // Stub implementation for memory storage
  }

  async createLocationTransfer(transfer: InsertLocationTransfer): Promise<LocationTransfer> {
    return {
      id: 1,
      ...transfer,
      transferDate: new Date(),
    };
  }

  // Manufacturer methods
  async getAllManufacturers(): Promise<Manufacturer[]> {
    return Array.from(this.manufacturers.values());
  }

  async getManufacturer(id: number): Promise<Manufacturer | undefined> {
    return this.manufacturers.get(id);
  }

  async createManufacturer(manufacturer: InsertManufacturer): Promise<Manufacturer> {
    const id = this.currentManufacturerId++;
    const newManufacturer: Manufacturer = {
      ...manufacturer,
      id,
      createdAt: new Date()
    };
    this.manufacturers.set(id, newManufacturer);
    return newManufacturer;
  }

  async updateManufacturer(id: number, manufacturerData: Partial<InsertManufacturer>): Promise<Manufacturer | undefined> {
    const manufacturer = this.manufacturers.get(id);
    if (!manufacturer) return undefined;

    const updatedManufacturer: Manufacturer = { ...manufacturer, ...manufacturerData };
    this.manufacturers.set(id, updatedManufacturer);
    return updatedManufacturer;
  }

  async deleteManufacturer(id: number): Promise<boolean> {
    return this.manufacturers.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllInventoryItems(): Promise<InventoryItem[]> {
    // إرسال جميع المركبات بما في ذلك المباعة - الواجهة الأمامية ستتحكم في العرض
    const items = await db.select().from(inventoryItems);
    return items;
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item || undefined;
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db
      .insert(inventoryItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateInventoryItem(id: number, updateData: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [item] = await db
      .update(inventoryItems)
      .set(updateData)
      .where(eq(inventoryItems.id, id))
      .returning();
    return item || undefined;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    const result = await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchInventoryItems(query: string): Promise<InventoryItem[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const items = await db.select().from(inventoryItems);
    // إرجاع جميع العناصر بما في ذلك المباعة - الواجهة الأمامية ستتحكم في العرض
    return items.filter(item =>
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.engineCapacity.toLowerCase().includes(query.toLowerCase()) ||
      item.exteriorColor.toLowerCase().includes(query.toLowerCase()) ||
      item.interiorColor.toLowerCase().includes(query.toLowerCase()) ||
      item.status.toLowerCase().includes(query.toLowerCase()) ||
      item.importType.toLowerCase().includes(query.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(query.toLowerCase()) ||
      item.chassisNumber.toLowerCase().includes(query.toLowerCase()) ||
      item.location.toLowerCase().includes(query.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(query.toLowerCase())) ||
      item.year.toString().includes(query)
    );
  }

  async filterInventoryItems(filters: { 
    category?: string; 
    status?: string; 
    year?: number; 
    manufacturer?: string;
    importType?: string;
  }): Promise<InventoryItem[]> {
    const items = await db.select().from(inventoryItems);
    // إرجاع جميع العناصر بما في ذلك المباعة - الواجهة الأمامية ستتحكم في العرض
    return items.filter(item => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.year && item.year !== filters.year) return false;
      if (filters.manufacturer && item.manufacturer !== filters.manufacturer) return false;
      if (filters.importType && item.importType !== filters.importType) return false;
      return true;
    });
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
    // استبعاد المركبات المباعة من الإحصائيات الأساسية
    const activeItems = items.filter(item => !item.isSold);
    
    return {
      total: activeItems.length,
      available: activeItems.filter(item => item.status === "متوفر").length,
      inTransit: activeItems.filter(item => item.status === "في الطريق").length,
      maintenance: activeItems.filter(item => item.status === "قيد الصيانة").length,
      reserved: activeItems.filter(item => item.status === "محجوز").length,
      sold: items.filter(item => item.isSold).length,
      personal: activeItems.filter(item => item.importType === "شخصي").length,
      company: activeItems.filter(item => item.importType === "شركة").length,
      usedPersonal: activeItems.filter(item => item.importType === "مستعمل شخصي").length,
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
    const manufacturerEntities = await db.select().from(manufacturers);
    
    // استبعاد السيارات المباعة من الإحصائيات
    const availableItems = items.filter(item => !item.isSold);
    const manufacturerSet = new Set(availableItems.map(item => item.manufacturer));
    const manufacturerNames = Array.from(manufacturerSet);
    
    return manufacturerNames.map(manufacturerName => {
      const manufacturerItems = availableItems.filter(item => item.manufacturer === manufacturerName);
      const manufacturerEntity = manufacturerEntities.find(m => m.name === manufacturerName);
      
      return {
        manufacturer: manufacturerName,
        total: manufacturerItems.length,
        personal: manufacturerItems.filter(item => item.importType === "شخصي").length,
        company: manufacturerItems.filter(item => item.importType === "شركة").length,
        usedPersonal: manufacturerItems.filter(item => item.importType === "مستعمل شخصي").length,
        logo: manufacturerEntity?.logo || null,
      };
    });
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
    const locationMap = new Map<string, {
      total: number;
      available: number;
      inTransit: number;
      maintenance: number;
      sold: number;
    }>();

    items.forEach(item => {
      if (!locationMap.has(item.location)) {
        locationMap.set(item.location, {
          total: 0,
          available: 0,
          inTransit: 0,
          maintenance: 0,
          sold: 0
        });
      }
      
      const stats = locationMap.get(item.location)!;
      stats.total++;
      
      if (item.isSold) {
        stats.sold++;
      } else if (item.status === "متوفر") {
        stats.available++;
      } else if (item.status === "في الطريق") {
        stats.inTransit++;
      } else if (item.status === "قيد الصيانة") {
        stats.maintenance++;
      }
    });

    return Array.from(locationMap.entries()).map(([location, stats]) => ({
      location,
      ...stats
    }));
  }

  async transferItem(id: number, newLocation: string, reason?: string, transferredBy?: string): Promise<boolean> {
    // First, get the current item to record the transfer
    const [currentItem] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    if (!currentItem) return false;

    // Create transfer record
    if (currentItem.location !== newLocation) {
      await db.insert(locationTransfers).values({
        inventoryItemId: id,
        fromLocation: currentItem.location,
        toLocation: newLocation,
        reason: reason || null,
        transferredBy: transferredBy || null,
        notes: null,
      });
    }

    // Update item location
    const result = await db
      .update(inventoryItems)
      .set({ location: newLocation })
      .where(eq(inventoryItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async markAsSold(id: number): Promise<boolean> {
    const result = await db
      .update(inventoryItems)
      .set({ isSold: true, soldDate: new Date() })
      .where(eq(inventoryItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async reserveItem(id: number, reservedBy: string, reservationNote?: string): Promise<boolean> {
    const result = await db
      .update(inventoryItems)
      .set({ 
        status: "محجوز", 
        reservationDate: new Date(),
        reservedBy: reservedBy,
        reservationNote: reservationNote || null
      })
      .where(eq(inventoryItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async cancelReservation(id: number): Promise<boolean> {
    const result = await db
      .update(inventoryItems)
      .set({ 
        status: "متوفر", 
        reservationDate: null,
        reservedBy: null,
        reservationNote: null
      })
      .where(eq(inventoryItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Location management methods
  async getAllLocations(): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.isActive, true));
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location || undefined;
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db
      .insert(locations)
      .values(location)
      .returning();
    return newLocation;
  }

  async updateLocation(id: number, locationData: Partial<InsertLocation>): Promise<Location | undefined> {
    const [updatedLocation] = await db
      .update(locations)
      .set(locationData)
      .where(eq(locations.id, id))
      .returning();
    return updatedLocation || undefined;
  }

  async deleteLocation(id: number): Promise<boolean> {
    // Check if location has inventory items
    const itemsInLocation = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.location, 
        await db.select({ name: locations.name }).from(locations).where(eq(locations.id, id)).then(res => res[0]?.name || '')
      ));
    
    if (itemsInLocation.length > 0) {
      return false; // Cannot delete location with items
    }

    const result = await db
      .update(locations)
      .set({ isActive: false })
      .where(eq(locations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getLocationTransfers(inventoryItemId?: number): Promise<LocationTransfer[]> {
    if (inventoryItemId) {
      return await db
        .select()
        .from(locationTransfers)
        .where(eq(locationTransfers.inventoryItemId, inventoryItemId));
    }
    return await db.select().from(locationTransfers);
  }

  async createLocationTransfer(transfer: InsertLocationTransfer): Promise<LocationTransfer> {
    const [newTransfer] = await db
      .insert(locationTransfers)
      .values(transfer)
      .returning();
    return newTransfer;
  }

  // Manufacturer methods
  async getAllManufacturers(): Promise<Manufacturer[]> {
    return await db.select().from(manufacturers);
  }

  async getManufacturer(id: number): Promise<Manufacturer | undefined> {
    const [manufacturer] = await db.select().from(manufacturers).where(eq(manufacturers.id, id));
    return manufacturer || undefined;
  }

  async createManufacturer(manufacturer: InsertManufacturer): Promise<Manufacturer> {
    const [newManufacturer] = await db
      .insert(manufacturers)
      .values(manufacturer)
      .returning();
    return newManufacturer;
  }

  async updateManufacturer(id: number, manufacturerData: Partial<InsertManufacturer>): Promise<Manufacturer | undefined> {
    const [updatedManufacturer] = await db
      .update(manufacturers)
      .set(manufacturerData)
      .where(eq(manufacturers.id, id))
      .returning();
    return updatedManufacturer || undefined;
  }

  async deleteManufacturer(id: number): Promise<boolean> {
    const result = await db.delete(manufacturers).where(eq(manufacturers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Low stock alerts methods
  async getLowStockAlerts(): Promise<LowStockAlert[]> {
    const alerts = await db.select().from(lowStockAlerts).orderBy(lowStockAlerts.createdAt);
    return alerts;
  }

  async getUnreadLowStockAlerts(): Promise<LowStockAlert[]> {
    const alerts = await db.select().from(lowStockAlerts)
      .where(eq(lowStockAlerts.isRead, false))
      .orderBy(lowStockAlerts.createdAt);
    return alerts;
  }

  async createLowStockAlert(alertData: InsertLowStockAlert): Promise<LowStockAlert> {
    const [alert] = await db.insert(lowStockAlerts).values(alertData).returning();
    return alert;
  }

  async markAlertAsRead(id: number): Promise<boolean> {
    try {
      await db.update(lowStockAlerts)
        .set({ isRead: true, updatedAt: new Date() })
        .where(eq(lowStockAlerts.id, id));
      return true;
    } catch (error) {
      console.error('Mark alert as read error:', error);
      return false;
    }
  }

  async deleteAlert(id: number): Promise<boolean> {
    try {
      await db.delete(lowStockAlerts).where(eq(lowStockAlerts.id, id));
      return true;
    } catch (error) {
      console.error('Delete alert error:', error);
      return false;
    }
  }

  async checkStockLevels(): Promise<void> {
    try {
      const items = await this.getAllInventoryItems();
      const stockCounts = new Map<string, number>();

      // Count items by manufacturer + category
      items.forEach(item => {
        if (!item.isSold) {
          const key = `${item.manufacturer}-${item.category}`;
          stockCounts.set(key, (stockCounts.get(key) || 0) + 1);
        }
      });

      // Get stock settings
      const settings = await this.getStockSettings();
      
      for (const setting of settings) {
        const key = `${setting.manufacturer}-${setting.category}`;
        const currentStock = stockCounts.get(key) || 0;
        
        let alertLevel = '';
        if (currentStock === 0) {
          alertLevel = 'out_of_stock';
        } else if (currentStock <= setting.criticalStockThreshold) {
          alertLevel = 'critical';
        } else if (currentStock <= setting.lowStockThreshold) {
          alertLevel = 'low';
        }

        if (alertLevel) {
          // Check if alert already exists
          const existingAlerts = await db.select().from(lowStockAlerts)
            .where(eq(lowStockAlerts.manufacturer, setting.manufacturer))
            .where(eq(lowStockAlerts.category, setting.category))
            .where(eq(lowStockAlerts.isRead, false));

          if (existingAlerts.length === 0) {
            await this.createLowStockAlert({
              manufacturer: setting.manufacturer,
              category: setting.category,
              currentStock,
              minStockLevel: setting.minStockLevel,
              alertLevel,
              isRead: false,
            });
          }
        }
      }
    } catch (error) {
      console.error('Check stock levels error:', error);
    }
  }

  // Stock settings methods
  async getStockSettings(): Promise<StockSettings[]> {
    const settings = await db.select().from(stockSettings).orderBy(stockSettings.manufacturer, stockSettings.category);
    return settings;
  }

  async getStockSettingsByCategory(manufacturer: string, category: string): Promise<StockSettings | undefined> {
    const [setting] = await db.select().from(stockSettings)
      .where(eq(stockSettings.manufacturer, manufacturer))
      .where(eq(stockSettings.category, category));
    return setting;
  }

  async createStockSettings(settingsData: InsertStockSettings): Promise<StockSettings> {
    const [setting] = await db.insert(stockSettings).values(settingsData).returning();
    return setting;
  }

  async updateStockSettings(id: number, settingsData: Partial<InsertStockSettings>): Promise<StockSettings | undefined> {
    try {
      const [setting] = await db.update(stockSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(stockSettings.id, id))
        .returning();
      return setting;
    } catch (error) {
      console.error('Update stock settings error:', error);
      return undefined;
    }
  }

  async deleteStockSettings(id: number): Promise<boolean> {
    try {
      await db.delete(stockSettings).where(eq(stockSettings.id, id));
      return true;
    } catch (error) {
      console.error('Delete stock settings error:', error);
      return false;
    }
  }

  // Appearance settings methods
  async getAppearanceSettings(): Promise<AppearanceSettings | undefined> {
    try {
      const [settings] = await db.select().from(appearanceSettings).limit(1);
      return settings;
    } catch (error) {
      console.error('Get appearance settings error:', error);
      return undefined;
    }
  }

  async updateAppearanceSettings(settingsData: Partial<InsertAppearanceSettings>): Promise<AppearanceSettings> {
    try {
      // Check if settings exist
      const [existingSettings] = await db.select().from(appearanceSettings).limit(1);
      
      if (existingSettings) {
        // Update existing settings
        const [updated] = await db.update(appearanceSettings)
          .set({ ...settingsData, updatedAt: new Date() })
          .where(eq(appearanceSettings.id, existingSettings.id))
          .returning();
        return updated;
      } else {
        // Create new settings
        const [created] = await db.insert(appearanceSettings)
          .values({ ...settingsData, createdAt: new Date(), updatedAt: new Date() })
          .returning();
        return created;
      }
    } catch (error) {
      console.error('Update appearance settings error:', error);
      throw error;
    }
  }

  async updateManufacturerLogo(id: number, logo: string): Promise<Manufacturer | undefined> {
    try {
      console.log(`Storage: Updating manufacturer ${id} with logo length: ${logo?.length || 0}`);
      
      // First check if manufacturer exists
      const existingManufacturer = await db.select().from(manufacturers).where(eq(manufacturers.id, id));
      if (existingManufacturer.length === 0) {
        console.error(`Storage: Manufacturer with ID ${id} not found`);
        return undefined;
      }
      
      console.log(`Storage: Found manufacturer: ${existingManufacturer[0].name}`);
      
      const [manufacturer] = await db.update(manufacturers)
        .set({ logo })
        .where(eq(manufacturers.id, id))
        .returning();
        
      console.log(`Storage: Successfully updated manufacturer logo for ${manufacturer.name}`);
      return manufacturer;
    } catch (error) {
      console.error('Storage: Update manufacturer logo error:', error);
      return undefined;
    }
  }

  // User management methods
  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const [user] = await db.update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      console.error('Update user error:', error);
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  }

  // Specifications methods
  async getAllSpecifications(): Promise<Specification[]> {
    try {
      return await db.select().from(specifications).orderBy(specifications.manufacturer, specifications.category);
    } catch (error) {
      console.error('Get all specifications error:', error);
      return [];
    }
  }

  async getSpecification(id: number): Promise<Specification | undefined> {
    try {
      const [specification] = await db.select().from(specifications).where(eq(specifications.id, id));
      return specification;
    } catch (error) {
      console.error('Get specification error:', error);
      return undefined;
    }
  }

  async createSpecification(specificationData: InsertSpecification): Promise<Specification> {
    try {
      const [specification] = await db.insert(specifications).values({
        ...specificationData,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      return specification;
    } catch (error) {
      console.error('Create specification error:', error);
      throw error;
    }
  }

  async updateSpecification(id: number, specificationData: Partial<InsertSpecification>): Promise<Specification | undefined> {
    try {
      const [specification] = await db.update(specifications)
        .set({ ...specificationData, updatedAt: new Date() })
        .where(eq(specifications.id, id))
        .returning();
      return specification;
    } catch (error) {
      console.error('Update specification error:', error);
      return undefined;
    }
  }

  async deleteSpecification(id: number): Promise<boolean> {
    try {
      await db.delete(specifications).where(eq(specifications.id, id));
      return true;
    } catch (error) {
      console.error('Delete specification error:', error);
      return false;
    }
  }

  async getSpecificationsByVehicle(manufacturer: string, category: string, trimLevel?: string): Promise<Specification[]> {
    try {
      let query = db.select().from(specifications)
        .where(eq(specifications.manufacturer, manufacturer))
        .where(eq(specifications.category, category));
      
      if (trimLevel) {
        query = query.where(eq(specifications.trimLevel, trimLevel));
      }
      
      return await query;
    } catch (error) {
      console.error('Get specifications by vehicle error:', error);
      return [];
    }
  }

  // Trim levels methods
  async getAllTrimLevels(): Promise<TrimLevel[]> {
    try {
      return await db.select().from(trimLevels);
    } catch (error) {
      console.error('Get all trim levels error:', error);
      return [];
    }
  }

  async getTrimLevel(id: number): Promise<TrimLevel | undefined> {
    try {
      const results = await db.select().from(trimLevels).where(eq(trimLevels.id, id));
      return results[0];
    } catch (error) {
      console.error('Get trim level error:', error);
      return undefined;
    }
  }

  async createTrimLevel(trimLevelData: InsertTrimLevel): Promise<TrimLevel> {
    try {
      const results = await db.insert(trimLevels).values(trimLevelData).returning();
      return results[0];
    } catch (error) {
      console.error('Create trim level error:', error);
      throw error;
    }
  }

  async updateTrimLevel(id: number, trimLevelData: Partial<InsertTrimLevel>): Promise<TrimLevel | undefined> {
    try {
      const results = await db.update(trimLevels)
        .set(trimLevelData)
        .where(eq(trimLevels.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Update trim level error:', error);
      return undefined;
    }
  }

  async deleteTrimLevel(id: number): Promise<boolean> {
    try {
      const results = await db.delete(trimLevels).where(eq(trimLevels.id, id)).returning();
      return results.length > 0;
    } catch (error) {
      console.error('Delete trim level error:', error);
      return false;
    }
  }

  async getTrimLevelsByCategory(manufacturer: string, category: string): Promise<TrimLevel[]> {
    try {
      return await db.select().from(trimLevels)
        .where(eq(trimLevels.manufacturer, manufacturer))
        .where(eq(trimLevels.category, category));
    } catch (error) {
      console.error('Get trim levels by category error:', error);
      return [];
    }
  }

  // Categories methods
  async getAllCategories(): Promise<{ category: string }[]> {
    try {
      const result = await db.selectDistinct({ category: inventoryItems.category }).from(inventoryItems);
      return result;
    } catch (error) {
      console.error('Get all categories error:', error);
      return [];
    }
  }

  async getCategoriesByManufacturer(manufacturer: string): Promise<{ category: string }[]> {
    try {
      const result = await db.selectDistinct({ category: inventoryItems.category })
        .from(inventoryItems)
        .where(eq(inventoryItems.manufacturer, manufacturer));
      return result;
    } catch (error) {
      console.error('Get categories by manufacturer error:', error);
      return [];
    }
  }

  // Engine capacities methods
  async getAllEngineCapacities(): Promise<{ engineCapacity: string }[]> {
    try {
      const result = await db.selectDistinct({ engineCapacity: inventoryItems.engineCapacity }).from(inventoryItems);
      return result;
    } catch (error) {
      console.error('Get all engine capacities error:', error);
      return [];
    }
  }

  // Quotations methods
  async getAllQuotations(): Promise<Quotation[]> {
    try {
      return await db.select().from(quotations).orderBy(quotations.createdAt);
    } catch (error) {
      console.error('Get all quotations error:', error);
      return [];
    }
  }

  async getQuotation(id: number): Promise<Quotation | undefined> {
    try {
      const [quotation] = await db.select().from(quotations).where(eq(quotations.id, id));
      return quotation;
    } catch (error) {
      console.error('Get quotation error:', error);
      return undefined;
    }
  }

  async createQuotation(quotationData: any): Promise<any> {
    try {
      // Remove validation - save without any conditions
      const simpleQuotation = {
        quoteNumber: quotationData.quoteNumber || `Q-${Date.now()}`,
        inventoryItemId: quotationData.inventoryItemId || 0,
        manufacturer: quotationData.manufacturer || 'غير محدد',
        category: quotationData.category || 'غير محدد',
        trimLevel: quotationData.trimLevel || '',
        year: quotationData.year || new Date().getFullYear(),
        exteriorColor: quotationData.exteriorColor || '',
        interiorColor: quotationData.interiorColor || '',
        chassisNumber: quotationData.chassisNumber || '',
        engineCapacity: quotationData.engineCapacity || '',
        specifications: quotationData.specifications || '',
        basePrice: quotationData.basePrice || '0',
        finalPrice: quotationData.finalPrice || '0',
        customerName: quotationData.customerName || 'عميل غير محدد',
        customerPhone: quotationData.customerPhone || '',
        customerEmail: quotationData.customerEmail || '',
        notes: quotationData.notes || '',
        status: quotationData.status || 'مسودة',
        validityDays: quotationData.validityDays || 30,
        createdBy: quotationData.createdBy || 'system',
        companyData: quotationData.companyData || '{}',
        representativeData: quotationData.representativeData || '{}',
        pricingDetails: quotationData.pricingDetails || '{}',
        qrCodeData: quotationData.qrCodeData || '{}',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [quotation] = await db.insert(quotations).values(simpleQuotation).returning();
      return quotation;
    } catch (error) {
      console.error('Create quotation error:', error);
      throw error;
    }
  }

  async updateQuotation(id: number, quotationData: Partial<InsertQuotation>): Promise<Quotation | undefined> {
    try {
      const [quotation] = await db.update(quotations)
        .set({ ...quotationData, updatedAt: new Date() })
        .where(eq(quotations.id, id))
        .returning();
      return quotation;
    } catch (error) {
      console.error('Update quotation error:', error);
      return undefined;
    }
  }

  async deleteQuotation(id: number): Promise<boolean> {
    try {
      await db.delete(quotations).where(eq(quotations.id, id));
      return true;
    } catch (error) {
      console.error('Delete quotation error:', error);
      return false;
    }
  }

  async getQuotationsByStatus(status: string): Promise<Quotation[]> {
    try {
      return await db.select().from(quotations)
        .where(eq(quotations.status, status))
        .orderBy(quotations.createdAt);
    } catch (error) {
      console.error('Get quotations by status error:', error);
      return [];
    }
  }

  async getQuotationByNumber(quoteNumber: string): Promise<Quotation | undefined> {
    try {
      const [quotation] = await db.select().from(quotations)
        .where(eq(quotations.quoteNumber, quoteNumber));
      return quotation;
    } catch (error) {
      console.error('Get quotation by number error:', error);
      return undefined;
    }
  }

  // Company methods
  async getAllCompanies(): Promise<Company[]> {
    try {
      return await db.select().from(companies).orderBy(companies.name);
    } catch (error) {
      console.error('Get all companies error:', error);
      return [];
    }
  }

  async getCompany(id: number): Promise<Company | undefined> {
    try {
      const results = await db.select().from(companies).where(eq(companies.id, id));
      return results[0];
    } catch (error) {
      console.error('Get company error:', error);
      return undefined;
    }
  }

  async createCompany(companyData: InsertCompany): Promise<Company> {
    try {
      const results = await db.insert(companies).values({
        ...companyData,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      return results[0];
    } catch (error) {
      console.error('Create company error:', error);
      throw error;
    }
  }

  async updateCompany(id: number, companyData: Partial<InsertCompany>): Promise<Company | undefined> {
    try {
      const results = await db.update(companies)
        .set({
          ...companyData,
          updatedAt: new Date()
        })
        .where(eq(companies.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Update company error:', error);
      throw error;
    }
  }

  async deleteCompany(id: number): Promise<boolean> {
    try {
      const results = await db.delete(companies)
        .where(eq(companies.id, id))
        .returning();
      return results.length > 0;
    } catch (error) {
      console.error('Delete company error:', error);
      return false;
    }
  }

  // Specifications methods
  async getAllSpecifications(): Promise<Specification[]> {
    try {
      return await db.select().from(specifications);
    } catch (error) {
      console.error('Get all specifications error:', error);
      return [];
    }
  }

  async getSpecification(id: number): Promise<Specification | undefined> {
    try {
      const results = await db.select().from(specifications).where(eq(specifications.id, id));
      return results[0];
    } catch (error) {
      console.error('Get specification error:', error);
      return undefined;
    }
  }

  async createSpecification(specificationData: InsertSpecification): Promise<Specification> {
    try {
      const results = await db.insert(specifications).values({
        ...specificationData,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      return results[0];
    } catch (error) {
      console.error('Create specification error:', error);
      throw error;
    }
  }

  async updateSpecification(id: number, specificationData: Partial<InsertSpecification>): Promise<Specification | undefined> {
    try {
      const results = await db.update(specifications)
        .set({
          ...specificationData,
          updatedAt: new Date()
        })
        .where(eq(specifications.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Update specification error:', error);
      return undefined;
    }
  }

  async deleteSpecification(id: number): Promise<boolean> {
    try {
      const results = await db.delete(specifications).where(eq(specifications.id, id)).returning();
      return results.length > 0;
    } catch (error) {
      console.error('Delete specification error:', error);
      return false;
    }
  }

  async getSpecificationsByVehicle(manufacturer: string, category: string, trimLevel?: string): Promise<Specification[]> {
    try {
      let query = db.select().from(specifications)
        .where(eq(specifications.manufacturer, manufacturer))
        .where(eq(specifications.category, category));
      
      if (trimLevel) {
        query = query.where(eq(specifications.trimLevel, trimLevel));
      }
      
      return await query;
    } catch (error) {
      console.error('Get specifications by vehicle error:', error);
      return [];
    }
  }

  async getSpecificationByVehicleParams(
    manufacturer: string, 
    category: string, 
    trimLevel: string | null, 
    year: number, 
    engineCapacity: string
  ): Promise<Specification | undefined> {
    try {
      let query = db.select().from(specifications)
        .where(eq(specifications.manufacturer, manufacturer))
        .where(eq(specifications.category, category))
        .where(eq(specifications.year, year))
        .where(eq(specifications.engineCapacity, engineCapacity));
      
      if (trimLevel) {
        query = query.where(eq(specifications.trimLevel, trimLevel));
      }
      
      const results = await query;
      return results[0];
    } catch (error) {
      console.error('Get specification by vehicle params error:', error);
      return undefined;
    }
  }

  async getCompanyById(id: number): Promise<Company | undefined> {
    try {
      const [company] = await db.select().from(companies).where(eq(companies.id, id));
      return company;
    } catch (error) {
      console.error('Get company by ID error:', error);
      return undefined;
    }
  }

  // Terms and conditions methods
  async getTermsByCompanyId(companyId: number): Promise<TermsAndConditions | undefined> {
    try {
      const [terms] = await db
        .select()
        .from(termsAndConditions)
        .where(eq(termsAndConditions.companyId, companyId))
        .where(eq(termsAndConditions.isActive, true));
      return terms;
    } catch (error) {
      console.error('Get terms by company ID error:', error);
      return undefined;
    }
  }

  async createTerms(data: InsertTermsAndConditions): Promise<TermsAndConditions> {
    try {
      const [newTerms] = await db.insert(termsAndConditions).values(data).returning();
      return newTerms;
    } catch (error) {
      console.error('Create terms error:', error);
      throw error;
    }
  }

  async updateTerms(id: number, data: InsertTermsAndConditions): Promise<TermsAndConditions | undefined> {
    try {
      const [updatedTerms] = await db
        .update(termsAndConditions)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(termsAndConditions.id, id))
        .returning();
      return updatedTerms;
    } catch (error) {
      console.error('Update terms error:', error);
      return undefined;
    }
  }

  // Terms and conditions storage
  private storedTermsConditions: Array<{ id: number; term_text: string; display_order: number }> = [
    { id: 1, term_text: "التسليم بمستودعاتنا", display_order: 1 },
    { id: 2, term_text: "السيارة مضمونة لدى الوكيل العام بالمملكة العربية السعودية", display_order: 2 },
    { id: 3, term_text: "السعر يشمل ضريبة القيمة المضافة واللوحات والاستمارة", display_order: 3 },
    { id: 4, term_text: "الدفع عند الاستلام أو حسب الاتفاق", display_order: 4 },
    { id: 5, term_text: "العرض قابل للتغيير دون إشعار مسبق", display_order: 5 },
    { id: 6, term_text: "يسري العرض حسب التاريخ المحدد", display_order: 6 }
  ];

  // Terms and conditions methods  
  async getAllTermsConditions(): Promise<Array<{ id: number; term_text: string; display_order: number }>> {
    try {
      return this.storedTermsConditions;
    } catch (error) {
      console.error('Get all terms conditions error:', error);
      return [];
    }
  }

  async updateTermsConditions(terms: Array<{ id: number; term_text: string; display_order: number }>): Promise<void> {
    try {
      this.storedTermsConditions = terms;
    } catch (error) {
      console.error('Update terms conditions error:', error);
    }
  }

  // Invoice methods
  async createInvoice(invoice: any): Promise<any> {
    try {
      // Remove validation - save without any conditions
      const simpleInvoice = {
        invoiceNumber: invoice.invoiceNumber || `INV-${Date.now()}`,
        quoteNumber: invoice.quoteNumber || '',
        inventoryItemId: invoice.inventoryItemId || 0,
        manufacturer: invoice.manufacturer || 'غير محدد',
        category: invoice.category || 'غير محدد',
        trimLevel: invoice.trimLevel || '',
        year: invoice.year || new Date().getFullYear(),
        exteriorColor: invoice.exteriorColor || '',
        interiorColor: invoice.interiorColor || '',
        chassisNumber: invoice.chassisNumber || '',
        engineCapacity: invoice.engineCapacity || '',
        specifications: invoice.specifications || '',
        basePrice: invoice.basePrice || '0',
        finalPrice: invoice.finalPrice || '0',
        customerName: invoice.customerName || 'عميل غير محدد',
        customerPhone: invoice.customerPhone || '',
        customerEmail: invoice.customerEmail || '',
        notes: invoice.notes || '',
        status: invoice.status || 'مسودة',
        paymentStatus: invoice.paymentStatus || 'غير مدفوع',
        paymentMethod: invoice.paymentMethod || '',
        paidAmount: invoice.paidAmount || '0',
        remainingAmount: invoice.remainingAmount || '0',
        dueDate: invoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: invoice.createdBy || 'system',
        companyData: invoice.companyData || '{}',
        representativeData: invoice.representativeData || '{}',
        pricingDetails: invoice.pricingDetails || '{}',
        qrCodeData: invoice.qrCodeData || '{}'
      };
      
      const [createdInvoice] = await this.db.insert(invoices).values(simpleInvoice).returning();
      return createdInvoice;
    } catch (error) {
      console.error('Create invoice error:', error);
      throw error;
    }
  }

  async getInvoices(): Promise<any[]> {
    try {
      return await this.db.select().from(invoices).orderBy(invoices.createdAt);
    } catch (error) {
      console.error('Get invoices error:', error);
      return [];
    }
  }

  async getInvoiceById(id: number): Promise<any | undefined> {
    try {
      const [invoice] = await this.db.select().from(invoices).where(eq(invoices.id, id));
      return invoice;
    } catch (error) {
      console.error('Get invoice by ID error:', error);
      return undefined;
    }
  }

  async updateInvoice(id: number, invoice: any): Promise<any> {
    try {
      const [updatedInvoice] = await this.db.update(invoices).set(invoice).where(eq(invoices.id, id)).returning();
      return updatedInvoice;
    } catch (error) {
      console.error('Update invoice error:', error);
      throw error;
    }
  }

  async deleteInvoice(id: number): Promise<boolean> {
    try {
      const result = await this.db.delete(invoices).where(eq(invoices.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Delete invoice error:', error);
      return false;
    }
  }

  async getInvoicesByStatus(status: string): Promise<any[]> {
    try {
      return await this.db.select().from(invoices).where(eq(invoices.status, status));
    } catch (error) {
      console.error('Get invoices by status error:', error);
      return [];
    }
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<any | undefined> {
    try {
      const [invoice] = await this.db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber));
      return invoice;
    } catch (error) {
      console.error('Get invoice by number error:', error);
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage();
