import { pgTable, text, serial, integer, timestamp, boolean, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("seller"), // 'admin' or 'seller'
});

export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  manufacturer: text("manufacturer").notNull(), // الصانع (مرسيدس، بي ام دبليو، اودي)
  category: text("category").notNull(), // الفئة (E200, C200, C300, X5, A4)
  trimLevel: text("trim_level"), // درجة التجهيز (فل كامل، ستاندرد، خاص)
  engineCapacity: text("engine_capacity").notNull(), // سعة المحرك
  year: integer("year").notNull(), // السنة
  exteriorColor: text("exterior_color").notNull(), // اللون الخارجي
  interiorColor: text("interior_color").notNull(), // اللون الداخلي
  status: text("status").notNull(), // الحالة
  importType: text("import_type").notNull(), // الاستيراد (شخصي/شركة/مستعمل شخصي)
  location: text("location").notNull(), // الموقع (المستودع الرئيسي، المعرض، الورشة، الميناء)
  chassisNumber: text("chassis_number").notNull().unique(), // رقم الهيكل
  images: text("images").array().default([]), // الصور
  logo: text("logo"), // اللوجو
  notes: text("notes"), // الملاحظات
  entryDate: timestamp("entry_date").defaultNow().notNull(), // تاريخ الدخول
  price: decimal("price", { precision: 10, scale: 2 }), // السعر
  isSold: boolean("is_sold").default(false).notNull(), // مباع
  soldDate: timestamp("sold_date"), // تاريخ البيع
  reservationDate: timestamp("reservation_date"), // تاريخ الحجز
  reservedBy: text("reserved_by"), // المستخدم الذي حجز
  reservationNote: text("reservation_note"), // ملاحظة الحجز
});

// Manufacturers table for storing manufacturer logos
export const manufacturers = pgTable("manufacturers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Companies table for quotation management
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // اسم الشركة
  logo: text("logo"), // شعار الشركة (Base64)
  registrationNumber: text("registration_number").notNull(), // رقم السجل التجاري
  licenseNumber: text("license_number").notNull(), // رقم الرخصة
  taxNumber: text("tax_number").notNull(), // الرقم الضريبي
  address: text("address").notNull(), // العنوان
  phone: text("phone"), // الهاتف
  email: text("email").notNull(), // البريد الإلكتروني
  website: text("website"), // الموقع الإلكتروني
  primaryColor: text("primary_color").default("#00627F").notNull(), // اللون الأساسي
  secondaryColor: text("secondary_color").default("#BF9231").notNull(), // اللون الثانوي
  accentColor: text("accent_color").default("#0891b2").notNull(), // لون التمييز
  isActive: boolean("is_active").default(true).notNull(), // نشط
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Locations table for managing inventory locations
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // اسم الموقع
  description: text("description"), // الوصف
  address: text("address"), // العنوان
  manager: text("manager"), // المسؤول
  phone: text("phone"), // الهاتف
  capacity: integer("capacity"), // السعة القصوى
  isActive: boolean("is_active").default(true).notNull(), // نشط
  createdAt: timestamp("created_at").defaultNow(),
});

// Location transfers table for tracking item movements
export const locationTransfers = pgTable("location_transfers", {
  id: serial("id").primaryKey(),
  inventoryItemId: integer("inventory_item_id").notNull(),
  fromLocation: text("from_location").notNull(), // الموقع السابق
  toLocation: text("to_location").notNull(), // الموقع الجديد
  transferDate: timestamp("transfer_date").defaultNow().notNull(), // تاريخ النقل
  reason: text("reason"), // السبب
  transferredBy: text("transferred_by"), // المنقول بواسطة
  notes: text("notes"), // ملاحظات
});

// Specifications table for storing detailed vehicle specifications
export const specifications = pgTable("specifications", {
  id: serial("id").primaryKey(),
  manufacturer: text("manufacturer").notNull(), // الصانع
  category: text("category").notNull(), // الفئة
  trimLevel: text("trim_level"), // درجة التجهيز
  year: integer("year").notNull(), // السنة
  engineCapacity: text("engine_capacity").notNull(), // سعة المحرك
  
  // Engine & Performance Specifications
  engineType: text("engine_type"), // نوع المحرك
  horsepower: text("horsepower"), // القوة الحصانية
  torque: text("torque"), // عزم الدوران
  transmission: text("transmission"), // ناقل الحركة
  fuelType: text("fuel_type"), // نوع الوقود
  fuelConsumption: text("fuel_consumption"), // استهلاك الوقود
  drivetrain: text("drivetrain"), // نوع الدفع
  acceleration: text("acceleration"), // التسارع
  topSpeed: text("top_speed"), // السرعة القصوى
  
  // Dimensions & Weight
  length: text("length"), // الطول
  width: text("width"), // العرض
  height: text("height"), // الارتفاع
  wheelbase: text("wheelbase"), // قاعدة العجلات
  curbWeight: text("curb_weight"), // الوزن الفارغ
  grossWeight: text("gross_weight"), // إجمالي الوزن
  loadCapacity: text("load_capacity"), // سعة التحميل
  seatingCapacity: text("seating_capacity"), // عدد المقاعد
  
  // Features & Equipment
  safetyFeatures: text("safety_features"), // مميزات الأمان
  comfortFeatures: text("comfort_features"), // مميزات الراحة
  infotainment: text("infotainment"), // نظام المعلومات والترفيه
  driverAssistance: text("driver_assistance"), // مساعدة السائق
  exteriorFeatures: text("exterior_features"), // المميزات الخارجية
  interiorFeatures: text("interior_features"), // المميزات الداخلية
  
  // Technical Specifications
  tireSize: text("tire_size"), // مقاس الإطارات
  suspension: text("suspension"), // نوع التعليق
  brakes: text("brakes"), // نظام الكبح
  steering: text("steering"), // نظام التوجيه
  groundClearance: text("ground_clearance"), // ارتفاع عن الأرض
  
  // Additional Information
  warranty: text("warranty"), // الضمان
  notes: text("notes"), // ملاحظات إضافية
  detailedDescription: text("detailed_description"), // الوصف التفصيلي الكامل
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Trim levels table for managing trim levels per manufacturer and category
export const trimLevels = pgTable("trim_levels", {
  id: serial("id").primaryKey(),
  manufacturer: text("manufacturer").notNull(), // الصانع
  category: text("category").notNull(), // الفئة
  trimLevel: text("trim_level").notNull(), // درجة التجهيز
  description: text("description"), // وصف درجة التجهيز
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Quotations table for managing price quotes
export const quotations = pgTable("quotations", {
  id: serial("id").primaryKey(),
  quoteNumber: text("quote_number").notNull().unique(), // رقم العرض
  inventoryItemId: integer("inventory_item_id").notNull(), // معرف المركبة
  manufacturer: text("manufacturer").notNull(), // الصانع
  category: text("category").notNull(), // الفئة
  trimLevel: text("trim_level"), // درجة التجهيز
  year: integer("year").notNull(), // الموديل
  exteriorColor: text("exterior_color").notNull(), // اللون الخارجي
  interiorColor: text("interior_color").notNull(), // اللون الداخلي
  chassisNumber: text("chassis_number").notNull(), // رقم الهيكل
  engineCapacity: text("engine_capacity").notNull(), // سعة المحرك
  specifications: text("specifications"), // المواصفات التفصيلية
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(), // السعر الأساسي
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }).notNull(), // السعر النهائي
  customerName: text("customer_name").notNull(), // اسم العميل
  customerPhone: text("customer_phone"), // هاتف العميل
  customerEmail: text("customer_email"), // بريد العميل
  notes: text("notes"), // ملاحظات
  validUntil: timestamp("valid_until").notNull(), // صالح حتى
  status: text("status").notNull().default("مسودة"), // الحالة (مسودة، مرسل، مقبول، مرفوض)
  createdBy: text("created_by").notNull(), // المُنشئ
  companyData: text("company_data"), // بيانات الشركة
  representativeData: text("representative_data"), // بيانات المندوب
  quoteAppearance: text("quote_appearance"), // مظهر العرض
  pricingDetails: text("pricing_details"), // تفاصيل التسعير
  qrCodeData: text("qr_code_data"), // بيانات رمز QR
  createdAt: timestamp("created_at").defaultNow().notNull(), // تاريخ الإنشاء
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // تاريخ التحديث
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  entryDate: true,
}).extend({
  manufacturer: z.string().min(1, "الصانع مطلوب"),
  category: z.string().min(1, "الفئة مطلوبة"),
  engineCapacity: z.string().min(1, "الموديل مطلوب"),
  chassisNumber: z.string().min(1, "رقم الهيكل مطلوب"),
  exteriorColor: z.string().min(1, "اللون الخارجي مطلوب"),
  importType: z.string().min(1, "نوع الاستيراد مطلوب"),
});

export const insertManufacturerSchema = createInsertSchema(manufacturers).omit({
  id: true,
  createdAt: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
});

export const insertLocationTransferSchema = createInsertSchema(locationTransfers).omit({
  id: true,
  transferDate: true,
});

export const insertSpecificationSchema = createInsertSchema(specifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrimLevelSchema = createInsertSchema(trimLevels).omit({
  id: true,
  createdAt: true,
});



// Terms and conditions table
export const termsAndConditions = pgTable("terms_and_conditions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  content: text("content").notNull(), // محتوى الشروط والأحكام
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "اسم الشركة مطلوب"),
  registrationNumber: z.string().min(1, "رقم السجل مطلوب"),
  licenseNumber: z.string().min(1, "رقم الرخصة مطلوب"),
  taxNumber: z.string().min(1, "الرقم الضريبي مطلوب"),
  address: z.string().min(1, "العنوان مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
});

export const insertTermsSchema = createInsertSchema(termsAndConditions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuotationSchema = createInsertSchema(quotations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  customerName: z.string().min(1, "اسم العميل مطلوب"),
  basePrice: z.string().min(1, "السعر الأساسي مطلوب"),
  finalPrice: z.string().min(1, "السعر النهائي مطلوب"),
  validUntil: z.union([z.string(), z.date()]).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
});



// User sessions table for tracking login/logout times
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  loginTime: timestamp("login_time").defaultNow().notNull(),
  logoutTime: timestamp("logout_time"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true).notNull(),
});

// Activity logs table for tracking user actions
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(), // 'add', 'edit', 'delete', 'sell'
  entityType: text("entity_type").notNull(), // 'inventory', 'user', 'manufacturer'
  entityId: integer("entity_id"),
  details: text("details"), // JSON string with action details
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ipAddress: text("ip_address"),
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  loginTime: true,
  isActive: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertManufacturer = z.infer<typeof insertManufacturerSchema>;
export type Manufacturer = typeof manufacturers.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertLocationTransfer = z.infer<typeof insertLocationTransferSchema>;
export type LocationTransfer = typeof locationTransfers.$inferSelect;
export type InsertSpecification = z.infer<typeof insertSpecificationSchema>;
export type Specification = typeof specifications.$inferSelect;
export type InsertTrimLevel = z.infer<typeof insertTrimLevelSchema>;
export type TrimLevel = typeof trimLevels.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type Quotation = typeof quotations.$inferSelect;

// Low stock alerts table
export const lowStockAlerts = pgTable("low_stock_alerts", {
  id: serial("id").primaryKey(),
  manufacturer: text("manufacturer").notNull(),
  category: text("category").notNull(),
  currentStock: integer("current_stock").notNull(),
  minStockLevel: integer("min_stock_level").default(5).notNull(),
  alertLevel: text("alert_level").notNull(), // "low", "critical", "out_of_stock"
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Stock level settings table
export const stockSettings = pgTable("stock_settings", {
  id: serial("id").primaryKey(),
  manufacturer: text("manufacturer").notNull(),
  category: text("category").notNull(),
  minStockLevel: integer("min_stock_level").default(5).notNull(),
  lowStockThreshold: integer("low_stock_threshold").default(3).notNull(),
  criticalStockThreshold: integer("critical_stock_threshold").default(1).notNull(),
  autoReorderEnabled: boolean("auto_reorder_enabled").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLowStockAlertSchema = createInsertSchema(lowStockAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStockSettingsSchema = createInsertSchema(stockSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LowStockAlert = typeof lowStockAlerts.$inferSelect;
export type InsertLowStockAlert = z.infer<typeof insertLowStockAlertSchema>;

export type StockSettings = typeof stockSettings.$inferSelect;
export type InsertStockSettings = z.infer<typeof insertStockSettingsSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type TermsAndConditions = typeof termsAndConditions.$inferSelect;
export type InsertTermsAndConditions = z.infer<typeof insertTermsSchema>;

// Appearance settings table
export const appearanceSettings = pgTable("appearance_settings", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).default("إدارة المخزون"),
  companyNameEn: varchar("company_name_en", { length: 255 }).default("Inventory System"),
  companyLogo: text("company_logo"), // Base64 encoded image
  primaryColor: varchar("primary_color", { length: 7 }).default("#0f766e"), // Teal-700
  primaryHoverColor: varchar("primary_hover_color", { length: 7 }).default("#134e4a"), // Teal-900
  secondaryColor: varchar("secondary_color", { length: 7 }).default("#0891b2"), // Sky-600
  secondaryHoverColor: varchar("secondary_hover_color", { length: 7 }).default("#0c4a6e"), // Sky-900
  accentColor: varchar("accent_color", { length: 7 }).default("#BF9231"), // Custom golden
  accentHoverColor: varchar("accent_hover_color", { length: 7 }).default("#a67c27"), // Custom golden dark
  gradientStart: varchar("gradient_start", { length: 7 }).default("#0f766e"), // Teal-700
  gradientEnd: varchar("gradient_end", { length: 7 }).default("#0891b2"), // Sky-600
  cardBackgroundColor: varchar("card_background_color", { length: 7 }).default("#ffffff"), // White
  cardHoverColor: varchar("card_hover_color", { length: 7 }).default("#f8fafc"), // Slate-50
  borderColor: varchar("border_color", { length: 7 }).default("#e2e8f0"), // Slate-200
  borderHoverColor: varchar("border_hover_color", { length: 7 }).default("#0f766e"), // Teal-700
  backgroundColor: varchar("background_color", { length: 7 }).default("#f8fafc"), // Light mode background
  darkBackgroundColor: varchar("dark_background_color", { length: 7 }).default("#000000"), // Dark mode background
  
  // Dark mode colors
  darkPrimaryColor: varchar("dark_primary_color", { length: 7 }).default("#14b8a6"), // Teal-500
  darkPrimaryHoverColor: varchar("dark_primary_hover_color", { length: 7 }).default("#0d9488"), // Teal-600
  darkSecondaryColor: varchar("dark_secondary_color", { length: 7 }).default("#0ea5e9"), // Sky-500
  darkSecondaryHoverColor: varchar("dark_secondary_hover_color", { length: 7 }).default("#0284c7"), // Sky-600
  darkAccentColor: varchar("dark_accent_color", { length: 7 }).default("#f59e0b"), // Amber-500
  darkAccentHoverColor: varchar("dark_accent_hover_color", { length: 7 }).default("#d97706"), // Amber-600
  darkCardBackgroundColor: varchar("dark_card_background_color", { length: 7 }).default("#141414"), // Sooty
  darkCardHoverColor: varchar("dark_card_hover_color", { length: 7 }).default("#282828"), // Dire Wolf
  darkBorderColor: varchar("dark_border_color", { length: 7 }).default("#374151"), // Gray-700
  darkBorderHoverColor: varchar("dark_border_hover_color", { length: 7 }).default("#14b8a6"), // Teal-500
  darkTextPrimaryColor: varchar("dark_text_primary_color", { length: 7 }).default("#f1f5f9"), // Slate-100
  darkTextSecondaryColor: varchar("dark_text_secondary_color", { length: 7 }).default("#94a3b8"), // Slate-400
  
  // Light mode text colors
  textPrimaryColor: varchar("text_primary_color", { length: 7 }).default("#1e293b"), // Slate-800
  textSecondaryColor: varchar("text_secondary_color", { length: 7 }).default("#64748b"), // Slate-500
  
  // Header colors
  headerBackgroundColor: varchar("header_background_color", { length: 7 }).default("#ffffff"), // White
  darkHeaderBackgroundColor: varchar("dark_header_background_color", { length: 7 }).default("#141414"), // Sooty
  
  darkMode: boolean("dark_mode").default(false),
  rtlLayout: boolean("rtl_layout").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertAppearanceSettingsSchema = createInsertSchema(appearanceSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type AppearanceSettings = typeof appearanceSettings.$inferSelect;
export type InsertAppearanceSettings = z.infer<typeof insertAppearanceSettingsSchema>;
