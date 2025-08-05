import "dotenv/config";
import { 
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
  type Bank, type InsertBank,
  type LeaveRequest, type InsertLeaveRequest,
  type BankInterestRate, type InsertBankInterestRate,
  type FinancingRate, type InsertFinancingRate,
  type ColorAssociation, type InsertColorAssociation,
  type VehicleCategory, type InsertVehicleCategory,
  type VehicleTrimLevel, type InsertVehicleTrimLevel
} from "@shared/schema";

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
  getReservedItems(): Promise<InventoryItem[]>;
  getSoldItems(): Promise<InventoryItem[]>;
  transferItem(id: number, newLocation: string, reason?: string, transferredBy?: string): Promise<boolean>;
  
  // Location management methods
  getAllLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;
  
  // Location transfer methods
  getAllLocationTransfers(): Promise<LocationTransfer[]>;
  getLocationTransfer(id: number): Promise<LocationTransfer | undefined>;
  createLocationTransfer(transfer: InsertLocationTransfer): Promise<LocationTransfer>;
  updateLocationTransfer(id: number, transfer: Partial<InsertLocationTransfer>): Promise<LocationTransfer | undefined>;
  deleteLocationTransfer(id: number): Promise<boolean>;
  getLocationTransfersByItem(itemId: number): Promise<LocationTransfer[]>;
  
  // Manufacturer methods
  getAllManufacturers(): Promise<Manufacturer[]>;
  getManufacturers(): Promise<any[]>;
  getManufacturer(id: number): Promise<Manufacturer | undefined>;
  createManufacturer(manufacturer: InsertManufacturer): Promise<Manufacturer>;
  updateManufacturer(id: number, manufacturer: Partial<InsertManufacturer>): Promise<Manufacturer | undefined>;
  deleteManufacturer(id: number): Promise<boolean>;
  getManufacturerByName(name: string): Promise<Manufacturer | undefined>;
  
  // Appearance settings methods
  getAppearanceSettings(): Promise<AppearanceSettings | undefined>;
  updateAppearanceSettings(settings: InsertAppearanceSettings): Promise<AppearanceSettings>;
  
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

  // Bank Interest Rate methods
  getBankInterestRates(bankId: number): Promise<BankInterestRate[]>;
  getBankInterestRate(id: number): Promise<BankInterestRate | undefined>;
  createBankInterestRate(rateData: InsertBankInterestRate): Promise<BankInterestRate>;
  updateBankInterestRate(id: number, rateData: Partial<InsertBankInterestRate>): Promise<BankInterestRate | undefined>;
  deleteBankInterestRate(id: number): Promise<boolean>;

  // Leave request methods
  getAllLeaveRequests(): Promise<LeaveRequest[]>;
  getLeaveRequestById(id: number): Promise<LeaveRequest | undefined>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequestStatus(id: number, status: string, approvedBy?: number, approvedByName?: string, rejectionReason?: string): Promise<LeaveRequest | undefined>;
  deleteLeaveRequest(id: number): Promise<boolean>;

  // Company methods
  getAllCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;
  
  // Financing rates
  getAllFinancingRates(): Promise<FinancingRate[]>;
  getFinancingRate(id: number): Promise<FinancingRate | undefined>;
  createFinancingRate(rate: InsertFinancingRate): Promise<FinancingRate>;
  updateFinancingRate(id: number, rate: Partial<InsertFinancingRate>): Promise<FinancingRate | undefined>;
  deleteFinancingRate(id: number): Promise<boolean>;
  getFinancingRatesByType(type: string): Promise<FinancingRate[]>;

  // Color association methods
  getAllColorAssociations(): Promise<ColorAssociation[]>;
  getColorAssociation(id: number): Promise<ColorAssociation | undefined>;
  createColorAssociation(association: InsertColorAssociation): Promise<ColorAssociation>;
  updateColorAssociation(id: number, association: Partial<InsertColorAssociation>): Promise<ColorAssociation | undefined>;
  deleteColorAssociation(id: number): Promise<boolean>;
  getColorAssociationsByManufacturer(manufacturer: string): Promise<ColorAssociation[]>;
  getColorAssociationsByCategory(manufacturer: string, category: string): Promise<ColorAssociation[]>;
  getColorAssociationsByTrimLevel(manufacturer: string, category: string, trimLevel: string): Promise<ColorAssociation[]>;
  
  // Image links methods
  getAllImageLinks(): Promise<string[]>;

  // Vehicle Categories methods
  getAllVehicleCategories(): Promise<VehicleCategory[]>;
  getVehicleCategory(id: number): Promise<VehicleCategory | undefined>;
  getVehicleCategoriesByManufacturer(manufacturerId: number): Promise<VehicleCategory[]>;
  createVehicleCategory(category: InsertVehicleCategory): Promise<VehicleCategory>;
  updateVehicleCategory(id: number, category: Partial<InsertVehicleCategory>): Promise<VehicleCategory | undefined>;
  deleteVehicleCategory(id: number): Promise<boolean>;

  // Vehicle Trim Levels methods
  getAllVehicleTrimLevels(): Promise<VehicleTrimLevel[]>;
  getVehicleTrimLevel(id: number): Promise<VehicleTrimLevel | undefined>;
  getVehicleTrimLevelsByCategory(categoryId: number): Promise<VehicleTrimLevel[]>;
  createVehicleTrimLevel(trimLevel: InsertVehicleTrimLevel): Promise<VehicleTrimLevel>;
  updateVehicleTrimLevel(id: number, trimLevel: Partial<InsertVehicleTrimLevel>): Promise<VehicleTrimLevel | undefined>;
  deleteVehicleTrimLevel(id: number): Promise<boolean>;

  // Cars.json migration utility
  migrateCarsJsonToDatabase(): Promise<{ 
    manufacturersCreated: number; 
    categoriesCreated: number; 
    trimLevelsCreated: number; 
  }>;

  // Theme management methods
  getCurrentTheme(): Promise<any>;
  saveTheme(theme: any): Promise<any>;

  // Additional methods referenced in routes
  markAsSold(id: number, saleData: any): Promise<InventoryItem | undefined>;
  reserveItem(id: number, reservationData: any): Promise<InventoryItem | undefined>;
  cancelReservation(id: number): Promise<InventoryItem | undefined>;
  createPriceCard(cardData: any): Promise<any>;
  createImageLink(linkData: any): Promise<any>;
  updateImageLink(id: number, linkData: any): Promise<any>;
  deleteImageLink(id: number): Promise<boolean>;
  updateManufacturerLogo(id: number, logo: string): Promise<Manufacturer | undefined>;
  getLocationTransfers(): Promise<LocationTransfer[]>;
  getExteriorColors(): Promise<any[]>;
  getInteriorColors(): Promise<any[]>;
  createExteriorColor(colorData: any): Promise<any>;
  createInteriorColor(colorData: any): Promise<any>;
  getColorAssociations(): Promise<ColorAssociation[]>;
  createCategory(categoryData: any): Promise<any>;
  getAllImportTypes(): Promise<any[]>;
  createImportType(typeData: any): Promise<any>;
  updateImportType(id: number, typeData: any): Promise<any>;
  deleteImportType(id: number): Promise<boolean>;
  getAllVehicleStatuses(): Promise<any[]>;
  createVehicleStatus(statusData: any): Promise<any>;
  updateVehicleStatus(id: number, statusData: any): Promise<any>;
  deleteVehicleStatus(id: number): Promise<boolean>;
  getAllOwnershipTypes(): Promise<any[]>;
  createOwnershipType(typeData: any): Promise<any>;
  updateOwnershipType(id: number, typeData: any): Promise<any>;
  deleteOwnershipType(id: number): Promise<boolean>;
  getCategories(): Promise<any[]>;
  getTrimLevels(): Promise<any[]>;
  getColors(): Promise<any[]>;
  getLocations(): Promise<any[]>;
  addManufacturer(manufacturerData: any): Promise<any>;
  addCategory(categoryData: any): Promise<any>;
  addTrimLevel(trimData: any): Promise<any>;
  addColor(colorData: any): Promise<any>;
  addLocation(locationData: any): Promise<any>;
  updateCategory(id: number, categoryData: any): Promise<any>;
  updateColor(id: number, colorData: any): Promise<any>;
  deleteCategory(id: number): Promise<boolean>;
  deleteColor(id: number): Promise<boolean>;
  getAllPriceCards(): Promise<any[]>;
  getPriceCard(id: number): Promise<any>;
  updatePriceCard(id: number, cardData: any): Promise<any>;
  deletePriceCard(id: number): Promise<boolean>;
  getPriceCardByVehicleId(vehicleId: number): Promise<any>;
  saveImageLink(linkData: any): Promise<any>;
  getLeaveRequest(id: number): Promise<LeaveRequest | undefined>;
  updateLeaveRequest(id: number, requestData: any): Promise<LeaveRequest | undefined>;
}

export class MemStorage implements IStorage {
  private users = new Map<number, User>();
  private inventoryItems = new Map<number, InventoryItem>();
  private manufacturers = new Map<number, Manufacturer>();
  private locations = new Map<number, Location>();
  private locationTransfers = new Map<number, LocationTransfer>();
  private specifications = new Map<number, Specification>();
  private trimLevels = new Map<number, TrimLevel>();
  private quotations = new Map<number, Quotation>();
  private invoices = new Map<number, any>();
  private financingCalculations = new Map<number, FinancingCalculation>();
  private banks = new Map<number, Bank>();
  private bankInterestRates = new Map<number, BankInterestRate>();
  private leaveRequests = new Map<number, LeaveRequest>();
  private financingRates = new Map<number, FinancingRate>();
  private colorAssociations = new Map<number, ColorAssociation>();
  private vehicleCategories = new Map<number, VehicleCategory>();
  private vehicleTrimLevels = new Map<number, VehicleTrimLevel>();
  
  private currentUserId = 1;
  private currentInventoryId = 1;
  private currentManufacturerId = 1;
  private currentLocationId = 1;
  private currentLocationTransferId = 1;
  private currentSpecificationId = 1;
  private currentTrimLevelId = 1;
  private currentQuotationId = 1;
  private currentInvoiceId = 1;
  private currentFinancingCalculationId = 1;
  private currentBankId = 1;
  private currentBankInterestRateId = 1;
  private currentLeaveRequestId = 1;
  private currentFinancingRateId = 1;
  private currentColorAssociationId = 1;
  private currentVehicleCategoryId = 1;
  private currentVehicleTrimLevelId = 1;
  
  private storedTermsConditions: Array<{ id: number; term_text: string; display_order: number }> = [];
  private systemSettings = new Map<string, string>();
  private companies = new Map<number, Company>();
  private currentTheme: any = null;
  private currentCompanyId = 1;
  private appearanceSettings: AppearanceSettings | undefined;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize users
    const adminUser: User = {
      id: this.currentUserId++,
      name: "مدير النظام",
      jobTitle: "مدير",
      phoneNumber: "966555000001",
      username: "admin",
      password: "admin123",
      role: "admin",
      createdAt: new Date()
    };
    this.users.set(1, adminUser);

    // Initialize sample inventory items
    const sampleItems = [
      {
        status: "متوفر",
        manufacturer: "تويوتا",
        category: "كامري",
        trimLevel: "GLE",
        engineCapacity: "2.5L",
        year: 2023,
        exteriorColor: "أبيض",
        interiorColor: "بيج",
        importType: "شركة",
        ownershipType: "ملك الشركة",
        location: "المعرض",
        chassisNumber: "JTDBE32K123456789",
        images: [],
        isSold: false
      },
      {
        status: "في الطريق",
        manufacturer: "تويوتا",
        category: "كامري",
        trimLevel: "GLX",
        engineCapacity: "2.5L",
        year: 2023,
        exteriorColor: "أسود",
        interiorColor: "أسود",
        importType: "شخصي",
        ownershipType: "ملك الشركة",
        location: "الميناء",
        chassisNumber: "JTDBE32K987654321",
        images: [],
        isSold: false
      }
    ];

    sampleItems.forEach(item => {
      this.createInventoryItem(item);
    });

    // Initialize banks
    this.initializeBanks();
    
    // Initialize sample bank interest rates
    this.initializeBankInterestRates();
  }

  private initializeBanks() {
    const sampleBanks = [
      {
        bankName: 'مصرف الراجحي',
        nameEn: 'Al Rajhi Bank',
        accountName: 'شركة البريمي للسيارات',
        accountNumber: '575608010000904',
        iban: 'SA8080000575608010000904',
        type: 'شركة' as const,
        isActive: true,
        logo: '/rajhi.png'
      },
      {
        bankName: 'البنك الأهلي السعودي',
        nameEn: 'Saudi National Bank',
        accountName: 'شركة البريمي للسيارات',
        accountNumber: '25268400000102',
        iban: 'SA5110000025268400000102',
        type: 'شركة' as const,
        isActive: true,
        logo: '/snb.png'
      }
    ];

    sampleBanks.forEach(bankData => {
      const id = this.currentBankId++;
      const bank: Bank = {
        id,
        ...bankData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.banks.set(id, bank);
    });
  }

  private initializeBankInterestRates() {
    // Sample interest rates for bank ID 1 (Al Rajhi Bank)
    const sampleRates = [
      {
        bankId: 1,
        categoryName: "موظف حكومي",
        interestRate: "6.5",
        years: 5,
        isActive: true
      },
      {
        bankId: 1,
        categoryName: "موظف قطاع خاص",
        interestRate: "7.2",
        years: 5,
        isActive: true
      },
      {
        bankId: 1,
        categoryName: "عسكري",
        interestRate: "6.0",
        years: 7,
        isActive: true
      },
      // Sample rates for bank ID 2 (SNB)
      {
        bankId: 2,
        categoryName: "موظف حكومي",
        interestRate: "6.8",
        years: 5,
        isActive: true
      },
      {
        bankId: 2,
        categoryName: "موظف قطاع خاص",
        interestRate: "7.5",
        years: 5,
        isActive: true
      }
    ];

    sampleRates.forEach(rateData => {
      const id = this.currentBankInterestRateId++;
      const rate: BankInterestRate = {
        id,
        ...rateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.bankInterestRates.set(id, rate);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Inventory methods
  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values());
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async createInventoryItem(itemData: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.currentInventoryId++;
    const item: InventoryItem = {
      id,
      ...itemData,
      trimLevel: itemData.trimLevel || null,
      price: itemData.price || null,
      notes: itemData.notes || null,
      detailedSpecifications: itemData.detailedSpecifications || null,
      logo: itemData.logo || null,
      images: itemData.images || [],
      isSold: itemData.isSold || false,
      soldDate: itemData.soldDate || null,
      reservationDate: itemData.reservationDate || null,
      reservedBy: itemData.reservedBy || null,
      reservationNote: itemData.reservationNote || null,
      entryDate: itemData.entryDate || new Date(),
      mileage: itemData.mileage || null
    };
    this.inventoryItems.set(id, item);
    return item;
  }

  async updateInventoryItem(id: number, itemData: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const existingItem = this.inventoryItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem: InventoryItem = { ...existingItem, ...itemData };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }

  async clearAllInventoryItems(): Promise<boolean> {
    this.inventoryItems.clear();
    return true;
  }

  async searchInventoryItems(query: string): Promise<InventoryItem[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.inventoryItems.values()).filter(item =>
      item.manufacturer.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      (item.trimLevel && item.trimLevel.toLowerCase().includes(lowerQuery)) ||
      item.chassisNumber.toLowerCase().includes(lowerQuery)
    );
  }

  async filterInventoryItems(filters: any): Promise<InventoryItem[]> {
    let items = Array.from(this.inventoryItems.values());
    
    if (filters.category) {
      items = items.filter(item => item.category === filters.category);
    }
    if (filters.status) {
      items = items.filter(item => item.status === filters.status);
    }
    if (filters.year) {
      items = items.filter(item => item.year === filters.year);
    }
    if (filters.manufacturer) {
      items = items.filter(item => item.manufacturer === filters.manufacturer);
    }
    if (filters.importType) {
      items = items.filter(item => item.importType === filters.importType);
    }
    if (filters.location) {
      items = items.filter(item => item.location === filters.location);
    }
    
    return items;
  }

  async getInventoryStats(): Promise<any> {
    const items = Array.from(this.inventoryItems.values());
    const availableItems = items.filter(item => !item.isSold && item.status !== "مباع");
    
    return {
      total: availableItems.length,
      available: availableItems.filter(item => item.status === "متوفر").length,
      inTransit: availableItems.filter(item => item.status === "في الطريق").length,
      maintenance: availableItems.filter(item => item.status === "في الصيانة").length,
      reserved: availableItems.filter(item => item.status === "محجوز").length,
      sold: items.filter(item => item.isSold || item.status === "مباع").length,
      personal: availableItems.filter(item => item.importType === "شخصي").length,
      company: availableItems.filter(item => item.importType === "شركة").length,
      usedPersonal: availableItems.filter(item => item.importType === "شخصي مستعمل").length
    };
  }

  async getManufacturerStats(): Promise<any[]> {
    const items = Array.from(this.inventoryItems.values());
    const manufacturers = [...new Set(items.map(item => item.manufacturer))];
    
    return manufacturers.map(manufacturer => {
      const manufacturerItems = items.filter(item => item.manufacturer === manufacturer);
      return {
        manufacturer,
        total: manufacturerItems.length,
        personal: manufacturerItems.filter(item => item.importType === "شخصي").length,
        company: manufacturerItems.filter(item => item.importType === "شركة").length,
        usedPersonal: manufacturerItems.filter(item => item.importType === "شخصي مستعمل").length,
        logo: null
      };
    });
  }

  async getLocationStats(): Promise<any[]> {
    return [];
  }

  async getReservedItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(item => item.status === "محجوز");
  }

  async getSoldItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(item => 
      item.isSold === true || item.status === "مباع"
    );
  }

  async transferItem(id: number, newLocation: string, reason?: string, transferredBy?: string): Promise<boolean> {
    const item = this.inventoryItems.get(id);
    if (!item) return false;
    
    item.location = newLocation;
    this.inventoryItems.set(id, item);
    return true;
  }

  // Bank methods
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

  // Bank Interest Rate methods implementation
  async getBankInterestRates(bankId: number): Promise<BankInterestRate[]> {
    return Array.from(this.bankInterestRates.values())
      .filter(rate => rate.bankId === bankId);
  }

  async getBankInterestRate(id: number): Promise<BankInterestRate | undefined> {
    return this.bankInterestRates.get(id);
  }

  async createBankInterestRate(rateData: InsertBankInterestRate): Promise<BankInterestRate> {
    const id = this.currentBankInterestRateId++;
    const rate: BankInterestRate = {
      id,
      ...rateData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bankInterestRates.set(id, rate);
    return rate;
  }

  async updateBankInterestRate(id: number, rateData: Partial<InsertBankInterestRate>): Promise<BankInterestRate | undefined> {
    const existingRate = this.bankInterestRates.get(id);
    if (!existingRate) return undefined;

    const updatedRate: BankInterestRate = {
      ...existingRate,
      ...rateData,
      updatedAt: new Date(),
    };
    this.bankInterestRates.set(id, updatedRate);
    return updatedRate;
  }

  async deleteBankInterestRate(id: number): Promise<boolean> {
    return this.bankInterestRates.delete(id);
  }

  // Placeholder methods for other interfaces
  async getAllLocations(): Promise<Location[]> { return []; }
  async getLocation(id: number): Promise<Location | undefined> { return undefined; }
  async createLocation(location: InsertLocation): Promise<Location> { throw new Error("Not implemented"); }
  async updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined> { return undefined; }
  async deleteLocation(id: number): Promise<boolean> { return false; }
  
  async getAllLocationTransfers(): Promise<LocationTransfer[]> { return []; }
  async getLocationTransfer(id: number): Promise<LocationTransfer | undefined> { return undefined; }
  async createLocationTransfer(transfer: InsertLocationTransfer): Promise<LocationTransfer> { throw new Error("Not implemented"); }
  async updateLocationTransfer(id: number, transfer: Partial<InsertLocationTransfer>): Promise<LocationTransfer | undefined> { return undefined; }
  async deleteLocationTransfer(id: number): Promise<boolean> { return false; }
  async getLocationTransfersByItem(itemId: number): Promise<LocationTransfer[]> { return []; }
  
  async getAllManufacturers(): Promise<Manufacturer[]> { 
    return Array.from(this.manufacturers.values()); 
  }

  async getManufacturers(): Promise<any[]> { 
    return Array.from(this.manufacturers.values()); 
  }
  
  async getManufacturer(id: number): Promise<Manufacturer | undefined> { 
    return this.manufacturers.get(id); 
  }
  
  async createManufacturer(manufacturer: InsertManufacturer): Promise<Manufacturer> { 
    const newManufacturer: Manufacturer = {
      id: this.currentManufacturerId++,
      ...manufacturer,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.manufacturers.set(newManufacturer.id, newManufacturer);
    return newManufacturer;
  }
  
  async updateManufacturer(id: number, manufacturer: Partial<InsertManufacturer>): Promise<Manufacturer | undefined> { 
    const existing = this.manufacturers.get(id);
    if (!existing) return undefined;

    const updated: Manufacturer = {
      ...existing,
      ...manufacturer,
      updatedAt: new Date(),
    };
    this.manufacturers.set(id, updated);
    return updated;
  }
  
  async deleteManufacturer(id: number): Promise<boolean> { 
    return this.manufacturers.delete(id); 
  }
  
  async getManufacturerByName(name: string): Promise<Manufacturer | undefined> { 
    return Array.from(this.manufacturers.values()).find(m => m.nameAr === name || m.nameEn === name); 
  }
  
  async getAppearanceSettings(): Promise<AppearanceSettings | undefined> { return this.appearanceSettings; }
  async updateAppearanceSettings(settings: InsertAppearanceSettings): Promise<AppearanceSettings> {
    const appearance: AppearanceSettings = {
      id: 1,
      ...settings,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.appearanceSettings = appearance;
    return appearance;
  }
  
  async getAllSpecifications(): Promise<Specification[]> { return []; }
  async getSpecification(id: number): Promise<Specification | undefined> { return undefined; }
  async createSpecification(specification: InsertSpecification): Promise<Specification> { throw new Error("Not implemented"); }
  async updateSpecification(id: number, specification: Partial<InsertSpecification>): Promise<Specification | undefined> { return undefined; }
  async deleteSpecification(id: number): Promise<boolean> { return false; }
  async getSpecificationsByVehicle(manufacturer: string, category: string, trimLevel?: string): Promise<Specification[]> { return []; }
  async getSpecificationByVehicleParams(manufacturer: string, category: string, trimLevel: string | null, year: number, engineCapacity: string): Promise<Specification | undefined> { return undefined; }
  
  async getAllTrimLevels(): Promise<TrimLevel[]> { 
    return Array.from(this.trimLevels.values()); 
  }
  
  async getTrimLevel(id: number): Promise<TrimLevel | undefined> { 
    return this.trimLevels.get(id); 
  }
  
  async createTrimLevel(trimLevel: InsertTrimLevel): Promise<TrimLevel> { 
    const newTrimLevel: TrimLevel = {
      id: this.currentTrimLevelId++,
      ...trimLevel,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.trimLevels.set(newTrimLevel.id, newTrimLevel);
    return newTrimLevel;
  }
  
  async updateTrimLevel(id: number, trimLevel: Partial<InsertTrimLevel>): Promise<TrimLevel | undefined> { 
    const existing = this.trimLevels.get(id);
    if (!existing) return undefined;

    const updated: TrimLevel = {
      ...existing,
      ...trimLevel,
      updatedAt: new Date(),
    };
    this.trimLevels.set(id, updated);
    return updated;
  }
  
  async deleteTrimLevel(id: number): Promise<boolean> { 
    return this.trimLevels.delete(id); 
  }
  
  async getTrimLevelsByCategory(manufacturer: string, category: string): Promise<TrimLevel[]> { 
    return Array.from(this.trimLevels.values()).filter(t => 
      t.manufacturer === manufacturer && t.category === category
    ); 
  }
  
  async getAllCategories(): Promise<{ category: string }[]> { return []; }
  async getCategoriesByManufacturer(manufacturer: string): Promise<{ category: string }[]> { return []; }
  async getAllEngineCapacities(): Promise<{ engineCapacity: string }[]> { return []; }
  
  async getAllQuotations(): Promise<Quotation[]> { return []; }
  async getQuotation(id: number): Promise<Quotation | undefined> { return undefined; }
  async createQuotation(quotation: InsertQuotation): Promise<Quotation> { throw new Error("Not implemented"); }
  async updateQuotation(id: number, quotation: Partial<InsertQuotation>): Promise<Quotation | undefined> { return undefined; }
  async deleteQuotation(id: number): Promise<boolean> { return false; }
  async getQuotationsByStatus(status: string): Promise<Quotation[]> { return []; }
  async getQuotationByNumber(quoteNumber: string): Promise<Quotation | undefined> { return undefined; }
  
  async getAllTermsConditions(): Promise<Array<{ id: number; term_text: string; display_order: number }>> {
    return this.storedTermsConditions;
  }
  
  async updateTermsConditions(terms: Array<{ id: number; term_text: string; display_order: number }>): Promise<void> {
    this.storedTermsConditions = terms;
  }
  
  async createInvoice(invoice: any): Promise<any> { return invoice; }
  async getInvoices(): Promise<any[]> { return []; }
  async getInvoiceById(id: number): Promise<any | undefined> { return undefined; }
  async updateInvoice(id: number, invoice: any): Promise<any> { return invoice; }
  async deleteInvoice(id: number): Promise<boolean> { return false; }
  async getInvoicesByStatus(status: string): Promise<any[]> { return []; }
  async getInvoiceByNumber(invoiceNumber: string): Promise<any | undefined> { return undefined; }
  
  async getSystemSettings(): Promise<Array<{key: string, value: string}>> { 
    return Array.from(this.systemSettings.entries()).map(([key, value]) => ({ key, value }));
  }
  
  async updateSystemSetting(key: string, value: string): Promise<{key: string, value: string}> {
    this.systemSettings.set(key, value);
    return { key, value };
  }
  
  async getDefaultCompanyId(): Promise<number | null> { return 1; }
  
  async getAllFinancingCalculations(): Promise<FinancingCalculation[]> { return []; }
  async getFinancingCalculation(id: number): Promise<FinancingCalculation | undefined> { return undefined; }
  async createFinancingCalculation(calculation: InsertFinancingCalculation): Promise<FinancingCalculation> { throw new Error("Not implemented"); }
  async updateFinancingCalculation(id: number, calculation: Partial<InsertFinancingCalculation>): Promise<FinancingCalculation | undefined> { return undefined; }
  async deleteFinancingCalculation(id: number): Promise<boolean> { return false; }
  
  async getAllLeaveRequests(): Promise<LeaveRequest[]> { 
    return Array.from(this.leaveRequests.values());
  }
  
  async getLeaveRequestById(id: number): Promise<LeaveRequest | undefined> { 
    return this.leaveRequests.get(id);
  }
  
  async createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest> { 
    const newRequest: LeaveRequest = {
      id: this.currentLeaveRequestId++,
      ...request,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.leaveRequests.set(newRequest.id, newRequest);
    return newRequest;
  }
  
  async updateLeaveRequestStatus(id: number, status: string, approvedBy?: number, approvedByName?: string, rejectionReason?: string): Promise<LeaveRequest | undefined> { 
    const request = this.leaveRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = {
      ...request,
      status,
      approvedBy,
      approvedByName,
      approvedAt: status === 'approved' ? new Date() : undefined,
      rejectionReason,
      updatedAt: new Date()
    };
    
    this.leaveRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  async deleteLeaveRequest(id: number): Promise<boolean> { 
    return this.leaveRequests.delete(id);
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
      ...company,
      createdAt: new Date(),
      updatedAt: new Date(),
      logo: company.logo || null,
      isActive: company.isActive !== undefined ? company.isActive : true,
      phone: company.phone || null
    };
    this.companies.set(newCompany.id, newCompany);
    return newCompany;
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const existingCompany = this.companies.get(id);
    if (!existingCompany) {
      return undefined;
    }
    const updatedCompany = { ...existingCompany, ...company };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }

  async deleteCompany(id: number): Promise<boolean> {
    return this.companies.delete(id);
  }

  // Financing rates methods implementation
  async getAllFinancingRates(): Promise<FinancingRate[]> {
    return Array.from(this.financingRates.values());
  }

  async getFinancingRate(id: number): Promise<FinancingRate | undefined> {
    return this.financingRates.get(id);
  }

  async createFinancingRate(rate: InsertFinancingRate): Promise<FinancingRate> {
    const newRate: FinancingRate = {
      id: this.currentFinancingRateId++,
      ...rate,
      bankLogo: rate.bankLogo || null,
      rates: rate.rates || [],
      minAmount: String(rate.minAmount),
      maxAmount: String(rate.maxAmount),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUpdated: new Date(),
    };
    this.financingRates.set(newRate.id, newRate);
    return newRate;
  }

  async updateFinancingRate(id: number, rate: Partial<InsertFinancingRate>): Promise<FinancingRate | undefined> {
    const existingRate = this.financingRates.get(id);
    if (!existingRate) return undefined;

    const updatedRate: FinancingRate = {
      ...existingRate,
      ...rate,
      bankLogo: rate.bankLogo !== undefined ? rate.bankLogo : existingRate.bankLogo,
      rates: rate.rates !== undefined ? rate.rates : existingRate.rates,
      minAmount: rate.minAmount ? String(rate.minAmount) : existingRate.minAmount,
      maxAmount: rate.maxAmount ? String(rate.maxAmount) : existingRate.maxAmount,
      updatedAt: new Date(),
      lastUpdated: new Date(),
    };
    this.financingRates.set(id, updatedRate);
    return updatedRate;
  }

  async deleteFinancingRate(id: number): Promise<boolean> {
    return this.financingRates.delete(id);
  }

  async getFinancingRatesByType(type: string): Promise<FinancingRate[]> {
    return Array.from(this.financingRates.values()).filter(rate => rate.financingType === type);
  }

  // Color association methods implementation
  async getAllColorAssociations(): Promise<ColorAssociation[]> {
    return Array.from(this.colorAssociations.values());
  }

  async getColorAssociation(id: number): Promise<ColorAssociation | undefined> {
    return this.colorAssociations.get(id);
  }

  async createColorAssociation(association: InsertColorAssociation): Promise<ColorAssociation> {
    const newAssociation: ColorAssociation = {
      id: this.currentColorAssociationId++,
      ...association,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.colorAssociations.set(newAssociation.id, newAssociation);
    return newAssociation;
  }

  async updateColorAssociation(id: number, association: Partial<InsertColorAssociation>): Promise<ColorAssociation | undefined> {
    const existing = this.colorAssociations.get(id);
    if (!existing) return undefined;

    const updated: ColorAssociation = {
      ...existing,
      ...association,
      updatedAt: new Date(),
    };
    this.colorAssociations.set(id, updated);
    return updated;
  }

  async deleteColorAssociation(id: number): Promise<boolean> {
    return this.colorAssociations.delete(id);
  }

  async getColorAssociationsByManufacturer(manufacturer: string): Promise<ColorAssociation[]> {
    return Array.from(this.colorAssociations.values()).filter(
      association => association.manufacturer === manufacturer
    );
  }

  async getColorAssociationsByCategory(manufacturer: string, category: string): Promise<ColorAssociation[]> {
    return Array.from(this.colorAssociations.values()).filter(
      association => 
        association.manufacturer === manufacturer && 
        (association.category === category || !association.category)
    );
  }

  async getColorAssociationsByTrimLevel(manufacturer: string, category: string, trimLevel: string): Promise<ColorAssociation[]> {
    return Array.from(this.colorAssociations.values()).filter(
      association => 
        association.manufacturer === manufacturer && 
        (association.category === category || !association.category) &&
        (association.trimLevel === trimLevel || !association.trimLevel)
    );
  }

  // Add missing method to satisfy interface
  async getColorAssociations(): Promise<ColorAssociation[]> {
    return this.getAllColorAssociations();
  }

  async getAllImageLinks(): Promise<string[]> {
    const imageLinks: string[] = [];
    
    // Collect images from inventory items
    for (const item of this.inventoryItems.values()) {
      if (item.images && Array.isArray(item.images)) {
        imageLinks.push(...item.images);
      }
    }
    
    // Collect images from manufacturers
    for (const manufacturer of this.manufacturers.values()) {
      if (manufacturer.logo) {
        imageLinks.push(manufacturer.logo);
      }
    }
    
    // Collect images from appearance settings (if available)
    if (this.appearanceSettings?.companyLogo) {
      imageLinks.push(this.appearanceSettings.companyLogo);
    }
    
    // Remove duplicates and return
    return [...new Set(imageLinks)];
  }

  // Vehicle Categories methods implementation
  async getAllVehicleCategories(): Promise<VehicleCategory[]> {
    return Array.from(this.vehicleCategories.values());
  }

  async getVehicleCategory(id: number): Promise<VehicleCategory | undefined> {
    return this.vehicleCategories.get(id);
  }

  async getVehicleCategoriesByManufacturer(manufacturerId: number): Promise<VehicleCategory[]> {
    return Array.from(this.vehicleCategories.values()).filter(
      category => category.manufacturerId === manufacturerId
    );
  }

  async createVehicleCategory(category: InsertVehicleCategory): Promise<VehicleCategory> {
    const newCategory: VehicleCategory = {
      id: this.currentVehicleCategoryId++,
      ...category,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vehicleCategories.set(newCategory.id, newCategory);
    return newCategory;
  }

  async updateVehicleCategory(id: number, category: Partial<InsertVehicleCategory>): Promise<VehicleCategory | undefined> {
    const existing = this.vehicleCategories.get(id);
    if (!existing) return undefined;

    const updated: VehicleCategory = {
      ...existing,
      ...category,
      updatedAt: new Date(),
    };
    this.vehicleCategories.set(id, updated);
    return updated;
  }

  async deleteVehicleCategory(id: number): Promise<boolean> {
    return this.vehicleCategories.delete(id);
  }

  // Vehicle Trim Levels methods implementation
  async getAllVehicleTrimLevels(): Promise<VehicleTrimLevel[]> {
    return Array.from(this.vehicleTrimLevels.values());
  }

  async getVehicleTrimLevel(id: number): Promise<VehicleTrimLevel | undefined> {
    return this.vehicleTrimLevels.get(id);
  }

  async getVehicleTrimLevelsByCategory(categoryId: number): Promise<VehicleTrimLevel[]> {
    return Array.from(this.vehicleTrimLevels.values()).filter(
      trimLevel => trimLevel.categoryId === categoryId
    );
  }

  async createVehicleTrimLevel(trimLevel: InsertVehicleTrimLevel): Promise<VehicleTrimLevel> {
    const newTrimLevel: VehicleTrimLevel = {
      id: this.currentVehicleTrimLevelId++,
      ...trimLevel,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vehicleTrimLevels.set(newTrimLevel.id, newTrimLevel);
    return newTrimLevel;
  }

  async updateVehicleTrimLevel(id: number, trimLevel: Partial<InsertVehicleTrimLevel>): Promise<VehicleTrimLevel | undefined> {
    const existing = this.vehicleTrimLevels.get(id);
    if (!existing) return undefined;

    const updated: VehicleTrimLevel = {
      ...existing,
      ...trimLevel,
      updatedAt: new Date(),
    };
    this.vehicleTrimLevels.set(id, updated);
    return updated;
  }

  async deleteVehicleTrimLevel(id: number): Promise<boolean> {
    return this.vehicleTrimLevels.delete(id);
  }

  // Cars.json migration utility
  async migrateCarsJsonToDatabase(): Promise<{ 
    manufacturersCreated: number; 
    categoriesCreated: number; 
    trimLevelsCreated: number; 
  }> {
    try {
      // Read cars.json file
      const fs = await import('fs/promises');
      const path = await import('path');
      const carsData = JSON.parse(await fs.readFile(path.join(process.cwd(), 'cars.json'), 'utf-8'));
      
      let manufacturersCreated = 0;
      let categoriesCreated = 0;
      let trimLevelsCreated = 0;

      // Process each manufacturer
      for (const car of carsData) {
        // Create or update manufacturer
        let manufacturer = Array.from(this.manufacturers.values()).find(
          m => m.nameAr === car.brand_ar
        );
        
        if (!manufacturer) {
          manufacturer = await this.createManufacturer({
            nameAr: car.brand_ar,
            nameEn: car.brand_en,
            logo: `/logos/${car.brand_en.toLowerCase()}.svg`
          });
          manufacturersCreated++;
        }

        // Process each model (category)
        for (const model of car.models) {
          let category = Array.from(this.vehicleCategories.values()).find(
            c => c.manufacturerId === manufacturer!.id && c.nameAr === model.model_ar
          );

          if (!category) {
            category = await this.createVehicleCategory({
              manufacturerId: manufacturer.id,
              nameAr: model.model_ar,
              nameEn: model.model_en,
              isActive: true
            });
            categoriesCreated++;
          }

          // Process each trim level
          for (const trim of model.trims) {
            const existingTrim = Array.from(this.vehicleTrimLevels.values()).find(
              t => t.categoryId === category!.id && t.nameAr === trim.trim_ar
            );

            if (!existingTrim) {
              await this.createVehicleTrimLevel({
                categoryId: category.id,
                nameAr: trim.trim_ar,
                nameEn: trim.trim_en,
                isActive: true
              });
              trimLevelsCreated++;
            }
          }
        }
      }

      // Delete cars.json file after successful migration
      await fs.unlink(path.join(process.cwd(), 'cars.json'));
      
      return { manufacturersCreated, categoriesCreated, trimLevelsCreated };
    } catch (error) {
      console.error('Migration error:', error);
      throw new Error(`فشل في تحويل البيانات: ${error}`);
    }
  }

  // Theme management methods
  async getCurrentTheme(): Promise<any> {
    return this.currentTheme || {
      id: 'monochrome-gradient',
      name: 'Monochrome Gradient',
      nameAr: 'التدرج الأحادي',
      gradient: 'linear-gradient(90deg, #00627F 0%, #00A3CC 100%)',
      variables: {
        primary: '#00627F',
        secondary: '#00A3CC',
        accent: '#0081A3',
        background: '#f8fafc',
        foreground: '#1e293b'
      }
    };
  }

  async saveTheme(theme: any): Promise<any> {
    this.currentTheme = { ...theme };
    return this.currentTheme;
  }

  // Additional methods implementation
  async markAsSold(id: number, saleData: any): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;
    
    const updated = {
      ...item,
      isSold: true,
      soldDate: new Date(),
      status: "مباع",
      ...saleData
    };
    this.inventoryItems.set(id, updated);
    return updated;
  }

  async reserveItem(id: number, reservationData: any): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;
    
    const updated = {
      ...item,
      status: "محجوز",
      reservationDate: new Date(),
      ...reservationData
    };
    this.inventoryItems.set(id, updated);
    return updated;
  }

  async cancelReservation(id: number): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;
    
    const updated = {
      ...item,
      status: "متوفر",
      reservationDate: null,
      reservedBy: null,
      reservationNote: null,
      customerName: null,
      customerPhone: null
    };
    this.inventoryItems.set(id, updated);
    return updated;
  }

  async createPriceCard(cardData: any): Promise<any> {
    return { id: 1, ...cardData };
  }

  async createImageLink(linkData: any): Promise<any> {
    return { id: 1, ...linkData };
  }

  async updateImageLink(id: number, linkData: any): Promise<any> {
    return { id, ...linkData };
  }

  async deleteImageLink(id: number): Promise<boolean> {
    return true;
  }

  async updateManufacturerLogo(id: number, logo: string): Promise<Manufacturer | undefined> {
    const manufacturer = this.manufacturers.get(id);
    if (!manufacturer) return undefined;
    
    const updated = { ...manufacturer, logo };
    this.manufacturers.set(id, updated);
    return updated;
  }

  async getLocationTransfers(): Promise<LocationTransfer[]> {
    return Array.from(this.locationTransfers.values());
  }

  async getExteriorColors(): Promise<any[]> {
    return Array.from(this.colorAssociations.values())
      .filter(color => color.colorType === 'exterior')
      .map(color => ({ name: color.colorName, code: color.colorCode }));
  }

  async getInteriorColors(): Promise<any[]> {
    return Array.from(this.colorAssociations.values())
      .filter(color => color.colorType === 'interior')
      .map(color => ({ name: color.colorName, code: color.colorCode }));
  }

  async createExteriorColor(colorData: any): Promise<any> {
    const color = await this.createColorAssociation({
      ...colorData,
      colorType: 'exterior'
    });
    return { name: color.colorName, code: color.colorCode };
  }

  async createInteriorColor(colorData: any): Promise<any> {
    const color = await this.createColorAssociation({
      ...colorData,
      colorType: 'interior'
    });
    return { name: color.colorName, code: color.colorCode };
  }

  async createCategory(categoryData: any): Promise<any> {
    return { id: 1, ...categoryData };
  }

  async getAllImportTypes(): Promise<any[]> {
    return [
      { id: 1, name: 'شخصي' },
      { id: 2, name: 'شركة' },
      { id: 3, name: 'مستعمل شخصي' }
    ];
  }

  async createImportType(typeData: any): Promise<any> {
    return { id: Date.now(), ...typeData };
  }

  async updateImportType(id: number, typeData: any): Promise<any> {
    return { id, ...typeData };
  }

  async deleteImportType(id: number): Promise<boolean> {
    return true;
  }

  async getAllVehicleStatuses(): Promise<any[]> {
    return [
      { id: 1, name: 'متوفر' },
      { id: 2, name: 'محجوز' },
      { id: 3, name: 'مباع' },
      { id: 4, name: 'في الطريق' },
      { id: 5, name: 'صيانة' }
    ];
  }

  async createVehicleStatus(statusData: any): Promise<any> {
    return { id: Date.now(), ...statusData };
  }

  async updateVehicleStatus(id: number, statusData: any): Promise<any> {
    return { id, ...statusData };
  }

  async deleteVehicleStatus(id: number): Promise<boolean> {
    return true;
  }

  async getAllOwnershipTypes(): Promise<any[]> {
    return [
      { id: 1, name: 'ملك الشركة' },
      { id: 2, name: 'وسيط' }
    ];
  }

  async createOwnershipType(typeData: any): Promise<any> {
    return { id: Date.now(), ...typeData };
  }

  async updateOwnershipType(id: number, typeData: any): Promise<any> {
    return { id, ...typeData };
  }

  async deleteOwnershipType(id: number): Promise<boolean> {
    return true;
  }

  async getCategories(): Promise<any[]> {
    return Array.from(this.getAllCategories());
  }

  async getTrimLevels(): Promise<any[]> {
    return Array.from(this.trimLevels.values());
  }

  async getColors(): Promise<any[]> {
    return Array.from(this.colorAssociations.values());
  }

  async getLocations(): Promise<any[]> {
    return Array.from(this.locations.values());
  }

  async addManufacturer(manufacturerData: any): Promise<any> {
    return this.createManufacturer(manufacturerData);
  }

  async addCategory(categoryData: any): Promise<any> {
    return { id: Date.now(), ...categoryData };
  }

  async addTrimLevel(trimData: any): Promise<any> {
    return this.createTrimLevel(trimData);
  }

  async addColor(colorData: any): Promise<any> {
    return this.createColorAssociation(colorData);
  }

  async addLocation(locationData: any): Promise<any> {
    return this.createLocation(locationData);
  }

  async updateCategory(id: number, categoryData: any): Promise<any> {
    return { id, ...categoryData };
  }

  async updateColor(id: number, colorData: any): Promise<any> {
    return this.updateColorAssociation(id, colorData);
  }

  async deleteCategory(id: number): Promise<boolean> {
    return true;
  }

  async deleteColor(id: number): Promise<boolean> {
    return this.deleteColorAssociation(id);
  }

  async getAllPriceCards(): Promise<any[]> {
    return [];
  }

  async getPriceCard(id: number): Promise<any> {
    return { id };
  }

  async updatePriceCard(id: number, cardData: any): Promise<any> {
    return { id, ...cardData };
  }

  async deletePriceCard(id: number): Promise<boolean> {
    return true;
  }

  async getPriceCardByVehicleId(vehicleId: number): Promise<any> {
    return { id: 1, vehicleId };
  }

  async saveImageLink(linkData: any): Promise<any> {
    return this.createImageLink(linkData);
  }

  async getLeaveRequest(id: number): Promise<LeaveRequest | undefined> {
    return this.getLeaveRequestById(id);
  }

  async updateLeaveRequest(id: number, requestData: any): Promise<LeaveRequest | undefined> {
    const existing = this.leaveRequests.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...requestData,
      updatedAt: new Date()
    };
    this.leaveRequests.set(id, updated);
    return updated;
  }
}

// Use createStorageInstance to automatically choose between DatabaseStorage and MemStorage
import { createStorageInstance } from "./storage-init";

// Create storage instance based on database availability
let storageInstance: IStorage | null = null;

// Initialize storage asynchronously
(async () => {
  try {
    console.log('🚀 Initializing storage system...');
    storageInstance = await createStorageInstance();
    console.log('✅ Storage initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize storage, using MemStorage:', error);
    storageInstance = new MemStorage();
  }
})();

// Export a function to get the storage instance
export function getStorage(): IStorage {
  if (storageInstance) {
    console.log('📦 Using initialized storage instance');
    return storageInstance;
  } else {
    console.log('📦 Using fallback MemStorage');
    return new MemStorage();
  }
}

// For backward compatibility, export a default instance
export const storage = new MemStorage(); // Fallback for immediate use

// Log the current storage configuration
console.log('🔧 Storage configuration loaded');
console.log('📋 DATABASE_URL:', process.env.DATABASE_URL ? 'Available' : 'Not available');