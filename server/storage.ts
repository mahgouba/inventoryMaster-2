import { 
  users, inventoryItems, manufacturers, companies, locations, locationTransfers, 
  lowStockAlerts, stockSettings, appearanceSettings, specifications, trimLevels, quotations, invoices, pdfAppearanceSettings,
  importTypes, vehicleStatuses, ownershipTypes, financingCalculations, banks,
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
  type Quotation, type InsertQuotation,
  type FinancingCalculation, type InsertFinancingCalculation,
  type Bank, type InsertBank
} from "@shared/schema";
import { db, pool } from "./db";
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
  clearAllInventoryItems(): Promise<boolean>;
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
  reserveItem(id: number, data: {
    reservedBy?: string;
    salesRepresentative?: string;
    customerName?: string;
    customerPhone?: string;
    paidAmount?: string;
    reservationNote?: string;
  }): Promise<boolean>;
  cancelReservation(id: number): Promise<boolean>;
  getReservedItems(): Promise<InventoryItem[]>;
  
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
  
  // PDF Appearance settings methods
  getPdfAppearanceSettings(): Promise<any>;
  savePdfAppearanceSettings(settings: any): Promise<any>;
  updatePdfAppearanceSettings(id: number, settings: any): Promise<any>;
  
  // Import Types methods
  getAllImportTypes(): Promise<any[]>;
  createImportType(importType: any): Promise<any>;
  updateImportType(id: number, importType: any): Promise<any>;
  deleteImportType(id: number): Promise<boolean>;
  
  // Vehicle Status methods
  getAllVehicleStatuses(): Promise<any[]>;
  createVehicleStatus(status: any): Promise<any>;
  updateVehicleStatus(id: number, status: any): Promise<any>;
  deleteVehicleStatus(id: number): Promise<boolean>;
  
  // Ownership Type methods
  getAllOwnershipTypes(): Promise<any[]>;
  createOwnershipType(ownershipType: any): Promise<any>;
  updateOwnershipType(id: number, ownershipType: any): Promise<any>;
  deleteOwnershipType(id: number): Promise<boolean>;
  
  // Image Links methods (placeholder methods for missing functionality)
  getAllImageLinks(): Promise<any[]>;
  createImageLink(imageLink: any): Promise<any>;
  updateImageLink(id: number, imageLink: any): Promise<any>;
  deleteImageLink(id: number): Promise<boolean>;
  
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
  
  // Categories and engine capacities methods
  getAllCategories(): Promise<{ category: string }[]>;
  getCategoriesByManufacturer(manufacturer: string): Promise<{ category: string }[]>;
  getAllEngineCapacities(): Promise<{ engineCapacity: string }[]>;
  
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

  // System Settings methods
  getSystemSettings(): Promise<Array<{key: string, value: string}>>;
  updateSystemSetting(key: string, value: string): Promise<{key: string, value: string}>;
  getDefaultCompanyId(): Promise<number | null>;
  
  // Financing calculations methods
  getAllFinancingCalculations(): Promise<FinancingCalculation[]>;
  getFinancingCalculation(id: number): Promise<FinancingCalculation | undefined>;
  createFinancingCalculation(calculation: InsertFinancingCalculation): Promise<FinancingCalculation>;
  updateFinancingCalculation(id: number, calculation: Partial<InsertFinancingCalculation>): Promise<FinancingCalculation | undefined>;
  deleteFinancingCalculation(id: number): Promise<boolean>;

  // Bank management methods
  getAllBanks(): Promise<Bank[]>;
  getBank(id: number): Promise<Bank | undefined>;
  getBanksByType(type: "شخصي" | "شركة"): Promise<Bank[]>;
  createBank(bank: InsertBank): Promise<Bank>;
  updateBank(id: number, bank: Partial<InsertBank>): Promise<Bank | undefined>;
  deleteBank(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private inventoryItems: Map<number, InventoryItem>;
  private manufacturers: Map<number, Manufacturer>;
  private locations: Map<number, Location>;
  private locationTransfers: Map<number, LocationTransfer>;
  private specifications: Map<number, Specification>;
  private trimLevels: Map<number, TrimLevel>;
  private quotations: Map<number, Quotation>;
  private invoices: Map<number, any> = new Map();
  private financingCalculations: Map<number, FinancingCalculation> = new Map();
  private banks: Map<number, Bank> = new Map();
  private currentUserId: number;
  private currentInventoryId: number;
  private currentManufacturerId: number;
  private currentLocationId: number;
  private currentLocationTransferId: number;
  private currentSpecificationId: number;
  private currentTrimLevelId: number;
  private currentQuotationId: number;
  private currentInvoiceId: number = 1;
  private currentFinancingCalculationId: number = 1;
  private currentBankId: number = 1;
  private storedTermsConditions: Array<{ id: number; term_text: string; display_order: number }> = [];
  private systemSettings: Map<string, string> = new Map();
  private companies: Map<number, Company> = new Map();
  private currentCompanyId: number = 1;

  constructor() {
    this.users = new Map();
    this.inventoryItems = new Map();
    this.manufacturers = new Map();
    this.locations = new Map();
    this.locationTransfers = new Map();
    this.specifications = new Map();
    this.trimLevels = new Map();
    this.quotations = new Map();
    this.invoices = new Map();
    this.financingCalculations = new Map();
    this.banks = new Map();
    this.currentUserId = 1;
    this.currentInventoryId = 1;
    this.currentManufacturerId = 1;
    this.currentLocationId = 1;
    this.currentLocationTransferId = 1;
    this.currentSpecificationId = 1;
    this.currentTrimLevelId = 1;
    this.currentQuotationId = 1;
    this.currentInvoiceId = 1;
    this.currentFinancingCalculationId = 1;
    this.currentBankId = 1;
    this.storedTermsConditions = [];
    this.systemSettings = new Map();
    this.companies = new Map();
    this.currentCompanyId = 1;
    
    // Initialize with some sample data
    this.initializeInventoryData();
    this.initializeBankData();
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
  async getAllUsers(): Promise<any[]> { return []; }
  async updateUser(id: number, user: any): Promise<any> { return user; }
  async deleteUser(id: number): Promise<boolean> { return true; }
  
  // Comprehensive List Management placeholder methods
  async getAllImportTypes(): Promise<any[]> { return []; }
  async createImportType(importType: any): Promise<any> { return importType; }
  async updateImportType(id: number, importType: any): Promise<any> { return importType; }
  async deleteImportType(id: number): Promise<boolean> { return true; }
  
  async getAllVehicleStatuses(): Promise<any[]> { return []; }
  async createVehicleStatus(status: any): Promise<any> { return status; }
  async updateVehicleStatus(id: number, status: any): Promise<any> { return status; }
  async deleteVehicleStatus(id: number): Promise<boolean> { return true; }
  
  async getAllOwnershipTypes(): Promise<any[]> { return []; }
  async createOwnershipType(ownershipType: any): Promise<any> { return ownershipType; }
  async updateOwnershipType(id: number, ownershipType: any): Promise<any> { return ownershipType; }
  async deleteOwnershipType(id: number): Promise<boolean> { return true; }
  
  // Image Links placeholder methods
  async getAllImageLinks(): Promise<any[]> { return []; }
  async createImageLink(imageLink: any): Promise<any> { return imageLink; }
  async updateImageLink(id: number, imageLink: any): Promise<any> { return imageLink; }
  async deleteImageLink(id: number): Promise<boolean> { return true; }
  
  // Specifications methods for MemStorage
  async getAllSpecifications(): Promise<Specification[]> {
    return Array.from(this.specifications.values());
  }

  async getSpecification(id: number): Promise<Specification | undefined> {
    return this.specifications.get(id);
  }

  async createSpecification(specificationData: InsertSpecification): Promise<Specification> {
    const id = this.currentSpecificationId++;
    const specification: Specification = {
      id,
      manufacturer: specificationData.manufacturer,
      category: specificationData.category,
      trimLevel: specificationData.trimLevel,
      year: specificationData.year,
      engineCapacity: specificationData.engineCapacity,
      chassisNumber: specificationData.chassisNumber,
      detailedDescription: specificationData.detailedDescription,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.specifications.set(id, specification);
    return specification;
  }

  async updateSpecification(id: number, specificationData: Partial<InsertSpecification>): Promise<Specification | undefined> {
    const existing = this.specifications.get(id);
    if (!existing) return undefined;
    
    const updated: Specification = {
      ...existing,
      ...specificationData,
      ...specificationData,
      updatedAt: new Date()
    };
    this.specifications.set(id, updated);
    return updated;
  }

  async deleteSpecification(id: number): Promise<boolean> {
    return this.specifications.delete(id);
  }

  async getSpecificationsByVehicle(manufacturer: string, category: string, trimLevel?: string): Promise<Specification[]> {
    return Array.from(this.specifications.values()).filter(spec => 
      spec.manufacturer === manufacturer && 
      spec.category === category &&
      (!trimLevel || spec.trimLevel === trimLevel)
    );
  }

  async getSpecificationByVehicleParams(manufacturer: string, category: string, trimLevel: string | null, year: number, engineCapacity: string): Promise<Specification | undefined> {
    return Array.from(this.specifications.values()).find(spec => 
      spec.manufacturer === manufacturer && 
      spec.category === category &&
      spec.trimLevel === trimLevel &&
      spec.year === year &&
      spec.engineCapacity === engineCapacity
    );
  }

  // Trim levels methods for MemStorage
  async getAllTrimLevels(): Promise<TrimLevel[]> {
    return Array.from(this.trimLevels.values());
  }

  async getTrimLevel(id: number): Promise<TrimLevel | undefined> {
    return this.trimLevels.get(id);
  }

  async createTrimLevel(trimLevelData: InsertTrimLevel): Promise<TrimLevel> {
    const id = this.currentTrimLevelId++;
    const trimLevel: TrimLevel = {
      id,
      manufacturer: trimLevelData.manufacturer,
      category: trimLevelData.category,
      trimLevel: trimLevelData.trimLevel,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.trimLevels.set(id, trimLevel);
    return trimLevel;
  }

  async updateTrimLevel(id: number, trimLevelData: Partial<InsertTrimLevel>): Promise<TrimLevel | undefined> {
    const existing = this.trimLevels.get(id);
    if (!existing) return undefined;
    
    const updated: TrimLevel = {
      ...existing,
      ...trimLevelData,
      updatedAt: new Date()
    };
    this.trimLevels.set(id, updated);
    return updated;
  }

  async deleteTrimLevel(id: number): Promise<boolean> {
    return this.trimLevels.delete(id);
  }

  async getTrimLevelsByCategory(manufacturer: string, category: string): Promise<TrimLevel[]> {
    return Array.from(this.trimLevels.values()).filter(tl => 
      tl.manufacturer === manufacturer && tl.category === category
    );
  }

  // Quotation stub methods for MemStorage
  async getAllQuotations(): Promise<any[]> { 
    return Array.from(this.quotations.values()); 
  }
  async getQuotation(id: number): Promise<any> { 
    return this.quotations.get(id); 
  }
  async createQuotation(quotation: any): Promise<any> { 
    const id = this.currentQuotationId++;
    const newQuotation = { ...quotation, id };
    this.quotations.set(id, newQuotation);
    return newQuotation; 
  }
  async updateQuotation(id: number, quotation: any): Promise<any> { 
    const existing = this.quotations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...quotation };
    this.quotations.set(id, updated);
    return updated; 
  }
  async deleteQuotation(id: number): Promise<boolean> { 
    return this.quotations.delete(id); 
  }
  async getQuotationsByStatus(status: string): Promise<any[]> { 
    return Array.from(this.quotations.values()).filter(q => q.status === status); 
  }
  async getQuotationByNumber(quoteNumber: string): Promise<any> { 
    return Array.from(this.quotations.values()).find(q => q.quoteNumber === quoteNumber); 
  }

  // Terms and Conditions methods
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

  // System Settings methods
  async getSystemSettings(): Promise<Array<{key: string, value: string}>> {
    const settings = [];
    for (const [key, value] of this.systemSettings.entries()) {
      settings.push({ key, value });
    }
    return settings;
  }

  async updateSystemSetting(key: string, value: string): Promise<{key: string, value: string}> {
    this.systemSettings.set(key, value);
    return { key, value };
  }

  async getDefaultCompanyId(): Promise<number | null> {
    const defaultCompanyId = this.systemSettings.get('default_company_id');
    return defaultCompanyId ? parseInt(defaultCompanyId) : null;
  }

  // Financing calculations methods
  async getAllFinancingCalculations(): Promise<FinancingCalculation[]> {
    return Array.from(this.financingCalculations.values());
  }

  async getFinancingCalculation(id: number): Promise<FinancingCalculation | undefined> {
    return this.financingCalculations.get(id);
  }

  async createFinancingCalculation(calculationData: InsertFinancingCalculation): Promise<FinancingCalculation> {
    const id = this.currentFinancingCalculationId++;
    const calculation: FinancingCalculation = {
      id,
      ...calculationData,
      createdAt: new Date()
    };
    this.financingCalculations.set(id, calculation);
    return calculation;
  }

  async updateFinancingCalculation(id: number, calculationData: Partial<InsertFinancingCalculation>): Promise<FinancingCalculation | undefined> {
    const existing = this.financingCalculations.get(id);
    if (existing) {
      const updated = { ...existing, ...calculationData };
      this.financingCalculations.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteFinancingCalculation(id: number): Promise<boolean> {
    return this.financingCalculations.delete(id);
  }

  // Company methods
  async getAllCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const newCompany: Company = {
      id: this.currentCompanyId++,
      ...company
    };
    this.companies.set(newCompany.id, newCompany);
    return newCompany;
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const existing = this.companies.get(id);
    if (existing) {
      const updated = { ...existing, ...company };
      this.companies.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteCompany(id: number): Promise<boolean> {
    return this.companies.delete(id);
  }

  // Additional missing methods
  async getAllCategories(): Promise<{ category: string }[]> { return []; }
  async getCategoriesByManufacturer(manufacturer: string): Promise<{ category: string }[]> { return []; }
  async getAllEngineCapacities(): Promise<{ engineCapacity: string }[]> { return []; }
  async getSpecificationByVehicleParams(manufacturer: string, category: string, trimLevel: string | null, year: number, engineCapacity: string): Promise<any> { return undefined; }
  async getPdfAppearanceSettings(): Promise<any> { return {}; }
  async savePdfAppearanceSettings(settings: any): Promise<any> { return settings; }
  async updatePdfAppearanceSettings(id: number, settings: any): Promise<any> { return settings; }
  async createInvoice(invoice: any): Promise<any> { return invoice; }
  async getInvoices(): Promise<any[]> { return []; }
  async getInvoiceById(id: number): Promise<any> { return undefined; }
  async updateInvoice(id: number, invoice: any): Promise<any> { return invoice; }
  async deleteInvoice(id: number): Promise<boolean> { return true; }
  async getInvoicesByStatus(status: string): Promise<any[]> { return []; }
  async getInvoiceByNumber(invoiceNumber: string): Promise<any> { return undefined; }

  // Image Links methods - placeholder implementations for development
  async getAllImageLinks(): Promise<any[]> { return []; }
  async getImageLink(id: number): Promise<any> { return undefined; }
  async createImageLink(imageLink: any): Promise<any> { 
    const newLink = { id: Date.now(), ...imageLink, createdAt: new Date() };
    return newLink;
  }
  async updateImageLink(id: number, imageLink: any): Promise<any> { return imageLink; }
  async deleteImageLink(id: number): Promise<boolean> { return true; }

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
        images: [],
        detailedSpecifications: null
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
        images: [],
        detailedSpecifications: null
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
        images: [],
        detailedSpecifications: null
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
        images: [],
        detailedSpecifications: null
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
        images: [],
        detailedSpecifications: null
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
        detailedSpecifications: null,
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
        detailedSpecifications: null,
        isSold: true,
        soldDate: new Date("2024-11-20")
      }
    ];

    sampleItems.forEach(item => {
      this.createInventoryItem(item);
    });
  }

  private initializeBankData() {
    const sampleBanks: InsertBank[] = [
      {
        name: 'مصرف الراجحي',
        nameEn: 'Al Rajhi Bank',
        accountName: 'شركة البريمي للسيارات',
        accountNumber: '575608010000904',
        iban: 'SA8080000575608010000904',
        type: 'شركة',
        isActive: true,
        logo: '/public/alrajhi-logo.svg'
      },
      {
        name: 'البنك الأهلي السعودي',
        nameEn: 'Saudi National Bank',
        accountName: 'شركة البريمي للسيارات',
        accountNumber: '25268400000102',
        iban: 'SA5110000025268400000102',
        type: 'شركة',
        isActive: true,
        logo: '/public/snb-logo.svg'
      },
      {
        name: 'بنك الجزيرة',
        nameEn: 'Bank Al Jazira',
        accountName: 'شركة البريمي للسيارات',
        accountNumber: '030495028555001',
        iban: 'SA7060100030495028555001',
        type: 'شركة',
        isActive: true,
        logo: '/public/aljazira-logo.svg'
      },
      {
        name: 'بنك البلاد',
        nameEn: 'Banque Saudi Fransi',
        accountName: 'شركة البريمي للسيارات',
        accountNumber: '448888888780008',
        iban: 'SA1315000448888888780008',
        type: 'شركة',
        isActive: true,
        logo: '/public/albilad-logo.svg'
      },
      {
        name: 'البنك العربي الوطني',
        nameEn: 'Arab National Bank',
        accountName: 'شركة البريمي للسيارات',
        accountNumber: '0108095322110019',
        iban: '',
        type: 'شركة',
        isActive: true,
        logo: '/public/anb-logo.svg'
      },
      {
        name: 'بنك الإمارات دبي الوطني',
        nameEn: 'Emirates NBD Bank',
        accountName: 'شركة البريمي للسيارات',
        accountNumber: '1016050175301',
        iban: 'SA4095000001016050175301',
        type: 'شركة',
        isActive: true,
        logo: '/public/emiratesnbd-logo.svg'
      },
      {
        name: 'بنك الرياض',
        nameEn: 'Riyad Bank',
        accountName: 'شركة البريمي للسيارات',
        accountNumber: '2383212779940',
        iban: 'SA1420000002383212779940',
        type: 'شركة',
        isActive: true,
        logo: '/public/riyadbank-logo.svg'
      },
      {
        name: 'مصرف الإنماء',
        nameEn: 'Alinma Bank',
        accountName: 'شركة البريمي للسيارات',
        accountNumber: '68201863704000',
        iban: 'SA9605000068201863704000',
        type: 'شركة',
        isActive: true,
        logo: '/public/alinma-logo.svg'
      },
      {
        name: 'البنك السعودي الأول',
        nameEn: 'The Saudi Investment Bank',
        accountName: 'شركة معرض البريمي للسيارات',
        accountNumber: '822173787001',
        iban: 'SA6445000000822173787001',
        type: 'شركة',
        isActive: true,
        logo: '/public/saib-logo.svg'
      },
      {
        name: 'البنك السعودي الفرنسي',
        nameEn: 'Banque Saudi Fransi',
        accountName: 'شركة البريمي للسيارات',
        accountNumber: '97844900167',
        iban: 'SA5655000000097844900167',
        type: 'شركة',
        isActive: true,
        logo: '/public/bsf-logo.svg'
      }
    ];

    sampleBanks.forEach(bankData => {
      const id = this.currentBankId++;
      const bank = {
        id,
        ...bankData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.banks.set(id, bank);
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
      notes: insertItem.notes || null,
      detailedSpecifications: insertItem.detailedSpecifications || null
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

  async clearAllInventoryItems(): Promise<boolean> {
    this.inventoryItems.clear();
    this.currentInventoryId = 1;
    return true;
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
    // استبعاد المركبات المباعة من الإحصائيات الأساسية - التحقق من كل من isSold والحالة
    const activeItems = items.filter(item => !item.isSold && item.status !== "مباع");
    
    return {
      total: activeItems.length,
      available: activeItems.filter(item => item.status === "متوفر").length,
      inTransit: activeItems.filter(item => item.status === "في الطريق").length,
      maintenance: activeItems.filter(item => item.status === "قيد الصيانة").length,
      reserved: activeItems.filter(item => item.status === "محجوز").length,
      sold: items.filter(item => item.isSold || item.status === "مباع").length,
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

  async reserveItem(id: number, data: {
    reservedBy?: string;
    salesRepresentative?: string;
    customerName?: string;
    customerPhone?: string;
    paidAmount?: string;
    reservationNote?: string;
  }): Promise<boolean> {
    const item = this.inventoryItems.get(id);
    if (!item) return false;
    
    const updatedItem = { 
      ...item, 
      status: "محجوز", 
      reservationDate: new Date(),
      reservedBy: data.reservedBy || null,
      salesRepresentative: data.salesRepresentative || null,
      customerName: data.customerName || null,
      customerPhone: data.customerPhone || null,
      paidAmount: data.paidAmount || null,
      reservationNote: data.reservationNote || null
    };
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

  // Quotations methods for MemStorage
  async getAllQuotations(): Promise<Quotation[]> {
    return Array.from(this.quotations.values());
  }

  async getQuotation(id: number): Promise<Quotation | undefined> {
    return this.quotations.get(id);
  }

  async createQuotation(quotationData: any): Promise<any> {
    const id = this.currentQuotationId++;
    const quotation: any = {
      ...quotationData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.quotations.set(id, quotation);
    return quotation;
  }

  async updateQuotation(id: number, quotationData: any): Promise<any> {
    const existing = this.quotations.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...quotationData,
      updatedAt: new Date()
    };
    this.quotations.set(id, updated);
    return updated;
  }

  async deleteQuotation(id: number): Promise<boolean> {
    return this.quotations.delete(id);
  }

  async getQuotationsByStatus(status: string): Promise<any[]> {
    return Array.from(this.quotations.values()).filter(q => q.status === status);
  }

  async getQuotationByNumber(quoteNumber: string): Promise<any | undefined> {
    return Array.from(this.quotations.values()).find(q => q.quoteNumber === quoteNumber);
  }

  // Invoice methods for MemStorage
  async createInvoice(invoiceData: any): Promise<any> {
    const id = this.currentInvoiceId++;
    const invoice: any = {
      ...invoiceData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async getInvoices(): Promise<any[]> {
    return Array.from(this.invoices.values());
  }

  async getInvoiceById(id: number): Promise<any | undefined> {
    return this.invoices.get(id);
  }

  async updateInvoice(id: number, invoiceData: any): Promise<any> {
    const existing = this.invoices.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...invoiceData,
      updatedAt: new Date()
    };
    this.invoices.set(id, updated);
    return updated;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    return this.invoices.delete(id);
  }

  async getInvoicesByStatus(status: string): Promise<any[]> {
    return Array.from(this.invoices.values()).filter(i => i.status === status);
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<any | undefined> {
    return Array.from(this.invoices.values()).find(i => i.invoiceNumber === invoiceNumber);
  }

  // Missing method - cancelReservation
  async cancelReservation(id: number): Promise<boolean> {
    const item = this.inventoryItems.get(id);
    if (!item) return false;
    
    const updated: InventoryItem = {
      ...item,
      status: "متوفر",
      reservationDate: null,
      reservedBy: null,
      salesRepresentative: null,
      reservationNote: null,
      customerName: null,
      customerPhone: null,
      paidAmount: null
    };
    this.inventoryItems.set(id, updated);
    return true;
  }

  async getSoldItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(item => 
      item.isSold === true && item.status === "مباع"
    );
  }

  async getReservedItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(item => 
      item.status === "محجوز"
    );
  }

  // Terms and conditions methods for MemStorage  
  async getAllTermsConditions(): Promise<Array<{ id: number; term_text: string; display_order: number }>> {
    return this.storedTermsConditions;
  }

  async updateTermsConditions(terms: Array<{ id: number; term_text: string; display_order: number }>): Promise<void> {
    this.storedTermsConditions = terms;
  }

  // System Settings methods for MemStorage
  async getSystemSettings(): Promise<Array<{key: string, value: string}>> {
    return Array.from(this.systemSettings.entries()).map(([key, value]) => ({ key, value }));
  }

  async updateSystemSetting(key: string, value: string): Promise<{key: string, value: string}> {
    this.systemSettings.set(key, value);
    return { key, value };
  }

  async getDefaultCompanyId(): Promise<number | null> {
    const defaultId = this.systemSettings.get('defaultCompanyId');
    return defaultId ? parseInt(defaultId) : null;
  }

  // Company methods for MemStorage
  async getAllCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async createCompany(companyData: InsertCompany): Promise<Company> {
    const id = this.currentCompanyId++;
    const company: Company = {
      ...companyData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.companies.set(id, company);
    return company;
  }

  async updateCompany(id: number, companyData: Partial<InsertCompany>): Promise<Company | undefined> {
    const existing = this.companies.get(id);
    if (!existing) return undefined;
    
    const updated: Company = {
      ...existing,
      ...companyData,
      updatedAt: new Date()
    };
    this.companies.set(id, updated);
    return updated;
  }

  async deleteCompany(id: number): Promise<boolean> {
    return this.companies.delete(id);
  }

  // Other missing methods with simple implementations
  async getAllSpecifications(): Promise<Specification[]> {
    return Array.from(this.specifications.values());
  }

  async getSpecification(id: number): Promise<Specification | undefined> {
    return this.specifications.get(id);
  }

  async createSpecification(specData: InsertSpecification): Promise<Specification> {
    const id = this.currentSpecificationId++;
    const spec: Specification = {
      ...specData,
      id,
      createdAt: new Date()
    };
    this.specifications.set(id, spec);
    return spec;
  }

  async updateSpecification(id: number, specData: Partial<InsertSpecification>): Promise<Specification | undefined> {
    const existing = this.specifications.get(id);
    if (!existing) return undefined;
    
    const updated: Specification = {
      ...existing,
      ...specData
    };
    this.specifications.set(id, updated);
    return updated;
  }

  async deleteSpecification(id: number): Promise<boolean> {
    return this.specifications.delete(id);
  }

  async getSpecificationsByVehicle(manufacturer: string, category: string, trimLevel?: string): Promise<Specification[]> {
    return Array.from(this.specifications.values()).filter(spec => 
      spec.manufacturer === manufacturer && 
      spec.category === category &&
      (!trimLevel || spec.trimLevel === trimLevel)
    );
  }

  async getSpecificationByVehicleParams(manufacturer: string, category: string, trimLevel: string | null, year: number, engineCapacity: string): Promise<Specification | undefined> {
    return Array.from(this.specifications.values()).find(spec => 
      spec.manufacturer === manufacturer &&
      spec.category === category &&
      spec.trimLevel === trimLevel &&
      spec.year === year &&
      spec.engineCapacity === engineCapacity
    );
  }

  // Trim levels methods for MemStorage
  async getAllTrimLevels(): Promise<TrimLevel[]> {
    return Array.from(this.trimLevels.values());
  }

  async getTrimLevel(id: number): Promise<TrimLevel | undefined> {
    return this.trimLevels.get(id);
  }

  async createTrimLevel(trimData: InsertTrimLevel): Promise<TrimLevel> {
    const id = this.currentTrimLevelId++;
    const trim: TrimLevel = {
      ...trimData,
      id,
      createdAt: new Date()
    };
    this.trimLevels.set(id, trim);
    return trim;
  }

  async updateTrimLevel(id: number, trimData: Partial<InsertTrimLevel>): Promise<TrimLevel | undefined> {
    const existing = this.trimLevels.get(id);
    if (!existing) return undefined;
    
    const updated: TrimLevel = {
      ...existing,
      ...trimData
    };
    this.trimLevels.set(id, updated);
    return updated;
  }

  async deleteTrimLevel(id: number): Promise<boolean> {
    return this.trimLevels.delete(id);
  }

  async getTrimLevelsByCategory(manufacturer: string, category: string): Promise<TrimLevel[]> {
    return Array.from(this.trimLevels.values()).filter(trim => 
      trim.manufacturer === manufacturer && trim.category === category
    );
  }

  // Categories and engine capacities methods for MemStorage
  async getAllCategories(): Promise<{ category: string }[]> {
    const categories = new Set(Array.from(this.inventoryItems.values()).map(item => item.category));
    return Array.from(categories).map(category => ({ category }));
  }

  async getCategoriesByManufacturer(manufacturer: string): Promise<{ category: string }[]> {
    const categories = new Set(
      Array.from(this.inventoryItems.values())
        .filter(item => item.manufacturer === manufacturer)
        .map(item => item.category)
    );
    return Array.from(categories).map(category => ({ category }));
  }

  async getAllEngineCapacities(): Promise<{ engineCapacity: string }[]> {
    const capacities = new Set(Array.from(this.inventoryItems.values()).map(item => item.engineCapacity));
    return Array.from(capacities).map(engineCapacity => ({ engineCapacity }));
  }

  // Additional missing methods with placeholders
  async getLowStockAlerts(): Promise<any[]> { return []; }
  async getUnreadLowStockAlerts(): Promise<any[]> { return []; }
  async createLowStockAlert(alert: any): Promise<any> { return alert; }
  async markAlertAsRead(id: number): Promise<boolean> { return true; }
  async deleteAlert(id: number): Promise<boolean> { return true; }
  async checkStockLevels(): Promise<void> {}
  async getStockSettings(): Promise<any[]> { return []; }
  async getStockSettingsByCategory(manufacturer: string, category: string): Promise<any> { return undefined; }
  async createStockSettings(settings: any): Promise<any> { return settings; }
  async updateStockSettings(id: number, settings: any): Promise<any> { return settings; }
  async deleteStockSettings(id: number): Promise<boolean> { return true; }
  async getAppearanceSettings(): Promise<any> { return undefined; }
  async updateAppearanceSettings(settings: any): Promise<any> { return settings; }
  async updateManufacturerLogo(id: number, logo: string): Promise<Manufacturer | undefined> { 
    const manufacturer = this.manufacturers.get(id);
    if (!manufacturer) return undefined;
    const updated = { ...manufacturer, logo };
    this.manufacturers.set(id, updated);
    return updated;
  }
  async getPdfAppearanceSettings(): Promise<any> { return {}; }
  async savePdfAppearanceSettings(settings: any): Promise<any> { return settings; }
  async updatePdfAppearanceSettings(id: number, settings: any): Promise<any> { return settings; }
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
    // استبعاد المركبات المباعة من الإحصائيات الأساسية - التحقق من كل من isSold والحالة
    const activeItems = items.filter(item => !item.isSold && item.status !== "مباع");
    
    return {
      total: activeItems.length,
      available: activeItems.filter(item => item.status === "متوفر").length,
      inTransit: activeItems.filter(item => item.status === "في الطريق").length,
      maintenance: activeItems.filter(item => item.status === "قيد الصيانة").length,
      reserved: activeItems.filter(item => item.status === "محجوز").length,
      sold: items.filter(item => item.isSold || item.status === "مباع").length,
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
    
    // استبعاد السيارات المباعة من الإحصائيات - التحقق من كل من isSold والحالة
    const availableItems = items.filter(item => !item.isSold && item.status !== "مباع");
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

  async reserveItem(id: number, data: {
    reservedBy?: string;
    salesRepresentative?: string;
    customerName?: string;
    customerPhone?: string;
    paidAmount?: string;
    reservationNote?: string;
  }): Promise<boolean> {
    const result = await db
      .update(inventoryItems)
      .set({ 
        status: "محجوز", 
        reservationDate: new Date(),
        reservedBy: data.reservedBy || null,
        salesRepresentative: data.salesRepresentative || null,
        customerName: data.customerName || null,
        customerPhone: data.customerPhone || null,
        paidAmount: data.paidAmount || null,
        reservationNote: data.reservationNote || null
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
        salesRepresentative: null,
        customerName: null,
        customerPhone: null,
        paidAmount: null,
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
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);
      
      // Generate unique quote number with additional randomness
      const generateUniqueQuoteNumber = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `Q-${timestamp}-${random}`;
      };

      const simpleQuotation = {
        quoteNumber: quotationData.quoteNumber || generateUniqueQuoteNumber(),
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
        validUntil: validUntil,
        status: quotationData.status || 'مسودة',
        createdBy: quotationData.createdBy || 'system',
        companyData: quotationData.companyData || '{}',
        representativeData: quotationData.representativeData || '{}',
        pricingDetails: quotationData.pricingDetails || '{}',
        qrCodeData: quotationData.qrCodeData || '{}'
      };
      
      const [quotation] = await db.insert(quotations).values(simpleQuotation).returning();
      return quotation;
    } catch (error) {
      console.error('Create quotation error:', error);
      throw error;
    }
  }

  async updateQuotation(id: number, quotationData: any): Promise<any> {
    try {
      const updatedQuotation = {
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
        companyData: quotationData.companyData || '{}',
        representativeData: quotationData.representativeData || '{}',
        pricingDetails: quotationData.pricingDetails || '{}',
        qrCodeData: quotationData.qrCodeData || '{}',
        updatedAt: new Date()
      };
      
      const [quotation] = await db.update(quotations)
        .set(updatedQuotation)
        .where(eq(quotations.id, id))
        .returning();
      return quotation;
    } catch (error) {
      console.error('Update quotation error:', error);
      throw error;
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
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: invoice.createdBy || 'system',
        companyData: invoice.companyData || '{}',
        representativeData: invoice.representativeData || '{}',
        pricingDetails: invoice.pricingDetails || '{}',
        qrCodeData: invoice.qrCodeData || '{}',
        authorizationNumber: invoice.authorizationNumber || ''
      };
      
      const [createdInvoice] = await db.insert(invoices).values(simpleInvoice).returning();
      return createdInvoice;
    } catch (error) {
      console.error('Create invoice error:', error);
      throw error;
    }
  }

  async getInvoices(): Promise<any[]> {
    try {
      return await db.select().from(invoices).orderBy(invoices.createdAt);
    } catch (error) {
      console.error('Get invoices error:', error);
      return [];
    }
  }

  async getInvoiceById(id: number): Promise<any | undefined> {
    try {
      const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
      return invoice;
    } catch (error) {
      console.error('Get invoice by ID error:', error);
      return undefined;
    }
  }

  async updateInvoice(id: number, invoice: any): Promise<any> {
    try {
      const [updatedInvoice] = await db.update(invoices).set(invoice).where(eq(invoices.id, id)).returning();
      return updatedInvoice;
    } catch (error) {
      console.error('Update invoice error:', error);
      throw error;
    }
  }

  async deleteInvoice(id: number): Promise<boolean> {
    try {
      const result = await db.delete(invoices).where(eq(invoices.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Delete invoice error:', error);
      return false;
    }
  }

  async getInvoicesByStatus(status: string): Promise<any[]> {
    try {
      return await db.select().from(invoices).where(eq(invoices.status, status));
    } catch (error) {
      console.error('Get invoices by status error:', error);
      return [];
    }
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<any | undefined> {
    try {
      const [invoice] = await db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber));
      return invoice;
    } catch (error) {
      console.error('Get invoice by number error:', error);
      return undefined;
    }
  }

  // System Settings methods (using raw SQL for simplicity)
  async getSystemSettings(): Promise<Array<{key: string, value: string}>> {
    try {
      const result = await pool.query(`SELECT setting_key as key, setting_value as value FROM system_settings`);
      return result.rows.map(row => ({
        key: row.key as string,
        value: row.value as string
      }));
    } catch (error) {
      console.error('Get system settings error:', error);
      return [];
    }
  }

  async updateSystemSetting(key: string, value: string): Promise<{key: string, value: string}> {
    try {
      // Use raw SQL for upsert operation
      await pool.query(`
        INSERT INTO system_settings (setting_key, setting_value, updated_at) 
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP
      `, [key, value]);
      
      return { key, value };
    } catch (error) {
      console.error('Update system setting error:', error);
      throw error;
    }
  }

  async getDefaultCompanyId(): Promise<number | null> {
    try {
      const result = await pool.query(`SELECT setting_value FROM system_settings WHERE setting_key = 'default_company_id'`);
      if (result.rows.length > 0) {
        return parseInt(result.rows[0].setting_value as string);
      }
      return null;
    } catch (error) {
      console.error('Get default company ID error:', error);
      return null;
    }
  }

  // PDF Appearance Settings methods
  async getPdfAppearanceSettings(): Promise<any> {
    try {
      const [settings] = await db.select().from(pdfAppearanceSettings).limit(1);
      return settings || {
        headerBackgroundColor: "#0f766e",
        headerTextColor: "#ffffff",
        logoBackgroundColor: "#ffffff",
        tableHeaderBackgroundColor: "#f8fafc",
        tableHeaderTextColor: "#1e293b",
        tableRowBackgroundColor: "#ffffff",
        tableRowTextColor: "#1e293b",
        tableAlternateRowBackgroundColor: "#f8fafc",
        tableBorderColor: "#e2e8f0",
        primaryTextColor: "#1e293b",
        secondaryTextColor: "#64748b",
        priceTextColor: "#059669",
        totalTextColor: "#dc2626",
        borderColor: "#e2e8f0",
        backgroundColor: "#ffffff",
        sectionBackgroundColor: "#f8fafc",
        companyStamp: null,
        watermarkOpacity: 0.1,
        footerBackgroundColor: "#f8fafc",
        footerTextColor: "#64748b",
        qrCodeBackgroundColor: "#ffffff",
        qrCodeForegroundColor: "#000000"
      };
    } catch (error) {
      console.error('Get PDF appearance settings error:', error);
      return {};
    }
  }

  async savePdfAppearanceSettings(settings: any): Promise<any> {
    try {
      // Check if settings exist
      const existingSettings = await db.select().from(pdfAppearanceSettings).limit(1);
      
      if (existingSettings.length > 0) {
        // Update existing settings
        const [updatedSettings] = await db
          .update(pdfAppearanceSettings)
          .set({ ...settings, updatedAt: new Date() })
          .where(eq(pdfAppearanceSettings.id, existingSettings[0].id))
          .returning();
        return updatedSettings;
      } else {
        // Create new settings
        const [newSettings] = await db
          .insert(pdfAppearanceSettings)
          .values(settings)
          .returning();
        return newSettings;
      }
    } catch (error) {
      console.error('Save PDF appearance settings error:', error);
      throw error;
    }
  }

  async updatePdfAppearanceSettings(id: number, settings: any): Promise<any> {
    try {
      const [updatedSettings] = await db
        .update(pdfAppearanceSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(pdfAppearanceSettings.id, id))
        .returning();
      return updatedSettings;
    } catch (error) {
      console.error('Update PDF appearance settings error:', error);
      return null;
    }
  }

  // Comprehensive List Management methods for DatabaseStorage
  
  // Import Types methods
  async getAllImportTypes(): Promise<any[]> {
    try {
      return await db.select().from(importTypes).where(eq(importTypes.isActive, true));
    } catch (error) {
      console.error('Get all import types error:', error);
      return [];
    }
  }

  async createImportType(importTypeData: any): Promise<any> {
    try {
      const [importType] = await db.insert(importTypes).values(importTypeData).returning();
      return importType;
    } catch (error) {
      console.error('Create import type error:', error);
      throw error;
    }
  }

  async updateImportType(id: number, importTypeData: any): Promise<any> {
    try {
      const [importType] = await db.update(importTypes)
        .set(importTypeData)
        .where(eq(importTypes.id, id))
        .returning();
      return importType;
    } catch (error) {
      console.error('Update import type error:', error);
      throw error;
    }
  }

  async deleteImportType(id: number): Promise<boolean> {
    try {
      await db.update(importTypes)
        .set({ isActive: false })
        .where(eq(importTypes.id, id));
      return true;
    } catch (error) {
      console.error('Delete import type error:', error);
      return false;
    }
  }

  // Vehicle Status methods
  async getAllVehicleStatuses(): Promise<any[]> {
    try {
      return await db.select().from(vehicleStatuses).where(eq(vehicleStatuses.isActive, true));
    } catch (error) {
      console.error('Get all vehicle statuses error:', error);
      return [];
    }
  }

  async createVehicleStatus(statusData: any): Promise<any> {
    try {
      const [status] = await db.insert(vehicleStatuses).values(statusData).returning();
      return status;
    } catch (error) {
      console.error('Create vehicle status error:', error);
      throw error;
    }
  }

  async updateVehicleStatus(id: number, statusData: any): Promise<any> {
    try {
      const [status] = await db.update(vehicleStatuses)
        .set(statusData)
        .where(eq(vehicleStatuses.id, id))
        .returning();
      return status;
    } catch (error) {
      console.error('Update vehicle status error:', error);
      throw error;
    }
  }

  async deleteVehicleStatus(id: number): Promise<boolean> {
    try {
      await db.update(vehicleStatuses)
        .set({ isActive: false })
        .where(eq(vehicleStatuses.id, id));
      return true;
    } catch (error) {
      console.error('Delete vehicle status error:', error);
      return false;
    }
  }

  // Ownership Type methods
  async getAllOwnershipTypes(): Promise<any[]> {
    try {
      return await db.select().from(ownershipTypes).where(eq(ownershipTypes.isActive, true));
    } catch (error) {
      console.error('Get all ownership types error:', error);
      return [];
    }
  }

  async createOwnershipType(ownershipTypeData: any): Promise<any> {
    try {
      const [ownershipType] = await db.insert(ownershipTypes).values(ownershipTypeData).returning();
      return ownershipType;
    } catch (error) {
      console.error('Create ownership type error:', error);
      throw error;
    }
  }

  async updateOwnershipType(id: number, ownershipTypeData: any): Promise<any> {
    try {
      const [ownershipType] = await db.update(ownershipTypes)
        .set(ownershipTypeData)
        .where(eq(ownershipTypes.id, id))
        .returning();
      return ownershipType;
    } catch (error) {
      console.error('Update ownership type error:', error);
      throw error;
    }
  }

  async deleteOwnershipType(id: number): Promise<boolean> {
    try {
      await db.update(ownershipTypes)
        .set({ isActive: false })
        .where(eq(ownershipTypes.id, id));
      return true;
    } catch (error) {
      console.error('Delete ownership type error:', error);
      return false;
    }
  }

  // Image Links methods for DatabaseStorage (placeholder implementation)
  async getAllImageLinks(): Promise<any[]> {
    try {
      // Placeholder - could be implemented if imageLinks table exists
      return [];
    } catch (error) {
      console.error('Get all image links error:', error);
      return [];
    }
  }

  async createImageLink(imageLinkData: any): Promise<any> {
    try {
      // Placeholder - could be implemented if imageLinks table exists
      return imageLinkData;
    } catch (error) {
      console.error('Create image link error:', error);
      throw error;
    }
  }

  async updateImageLink(id: number, imageLinkData: any): Promise<any> {
    try {
      // Placeholder - could be implemented if imageLinks table exists
      return imageLinkData;
    } catch (error) {
      console.error('Update image link error:', error);
      throw error;
    }
  }

  async deleteImageLink(id: number): Promise<boolean> {
    try {
      // Placeholder - could be implemented if imageLinks table exists
      return true;
    } catch (error) {
      console.error('Delete image link error:', error);
      return false;
    }
  }

  // Bank management implementations
  async getAllBanks(): Promise<Bank[]> {
    return Array.from(this.banks.values());
  }

  async getBank(id: number): Promise<Bank | undefined> {
    return this.banks.get(id);
  }

  async getBanksByType(type: "شخصي" | "شركة"): Promise<Bank[]> {
    return Array.from(this.banks.values()).filter(bank => bank.type === type && bank.isActive);
  }

  async createBank(bankData: InsertBank): Promise<Bank> {
    const id = this.currentBankId++;
    const bank: Bank = {
      id,
      ...bankData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.banks.set(id, bank);
    return bank;
  }

  async updateBank(id: number, bankData: Partial<InsertBank>): Promise<Bank | undefined> {
    const existingBank = this.banks.get(id);
    if (!existingBank) return undefined;

    const updatedBank: Bank = {
      ...existingBank,
      ...bankData,
      updatedAt: new Date(),
    };
    this.banks.set(id, updatedBank);
    return updatedBank;
  }

  async deleteBank(id: number): Promise<boolean> {
    return this.banks.delete(id);
  }
}

// Use MemStorage for development compatibility without database setup requirements
export const storage = new MemStorage();
