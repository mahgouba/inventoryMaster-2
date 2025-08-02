import { db } from './db';
import { 
  inventoryItems, 
  banks, 
  bankInterestRates, 
  manufacturers, 
  vehicleCategories, 
  vehicleTrimLevels, 
  trimLevels,
  users
} from '@shared/schema';
import { createInsertSchema } from "drizzle-zod";

// Create insert schemas
const insertInventory = createInsertSchema(inventoryItems);
const insertBank = createInsertSchema(banks);
const insertBankRate = createInsertSchema(bankInterestRates);
const insertManufacturer = createInsertSchema(manufacturers);
const insertCategory = createInsertSchema(vehicleCategories);
const insertTrimLevel = createInsertSchema(vehicleTrimLevels);
const insertSimpleTrimLevel = createInsertSchema(trimLevels);
const insertUser = createInsertSchema(users);

type InsertInventory = typeof insertInventory._type;
type InsertBank = typeof insertBank._type;
type InsertBankRate = typeof insertBankRate._type;
type InsertManufacturer = typeof insertManufacturer._type;
type InsertCategory = typeof insertCategory._type;
type InsertTrimLevel = typeof insertTrimLevel._type;
type InsertSimpleTrimLevel = typeof insertSimpleTrimLevel._type;
type InsertUser = typeof insertUser._type;
import fs from 'fs';
import path from 'path';

interface DatabaseExport {
  metadata: {
    exportDate: string;
    version: string;
    description: string;
    exportType: string;
    selectedTypes: string;
    lastUpdate: string;
  };
  data: {
    inventory: any[];
    banks: any[];
    rates: any[];
    users: any[];
    manufacturers: any[];
    categories: any[];
    trimLevels: any[];
  };
}

async function importData() {
  try {
    console.log('🔄 بدء استيراد البيانات من data.base.json...');
    
    // قراءة ملف البيانات
    const dataPath = path.join(process.cwd(), 'data.base.json');
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const data: DatabaseExport = JSON.parse(fileContent);
    
    console.log(`📊 تم تحميل البيانات - تاريخ التصدير: ${data.metadata.exportDate}`);
    console.log(`📝 الوصف: ${data.metadata.description}`);
    
    // مسح البيانات الحالية
    console.log('🗑️ مسح البيانات الحالية...');
    await db.delete(inventoryItems);
    await db.delete(banks);
    await db.delete(bankInterestRates);
    await db.delete(trimLevels);
    await db.delete(vehicleTrimLevels);
    await db.delete(vehicleCategories);
    await db.delete(manufacturers);
    await db.delete(users);
    
    // استيراد المصنعين أولاً وإنشاء خريطة المعرفات
    let manufacturerIdMap: Record<number, number> = {};
    if (data.data.manufacturers && data.data.manufacturers.length > 0) {
      console.log(`📦 استيراد ${data.data.manufacturers.length} مصنع...`);
      const manufacturersData = data.data.manufacturers.map((item: any) => ({
        nameAr: item.name_ar || item.nameAr || item.name || "مصنع غير محدد",
        nameEn: item.name_en || item.nameEn || item.name || "Unknown Manufacturer",
        logo: item.logo,
        isActive: item.isActive !== false
      } as InsertManufacturer));
      
      const insertedManufacturers = await db.insert(manufacturers).values(manufacturersData).returning();
      
      // إنشاء خريطة تربط المعرفات القديمة بالجديدة
      data.data.manufacturers.forEach((oldItem: any, index: number) => {
        manufacturerIdMap[oldItem.id] = insertedManufacturers[index].id;
      });
    }
    
    // استيراد الفئات مع ربطها بالمصنعين الجديدة
    let categoryIdMap: Record<number, number> = {};
    if (data.data.categories && data.data.categories.length > 0) {
      console.log(`📂 استيراد ${data.data.categories.length} فئة...`);
      const categoriesData = data.data.categories.map((item: any) => ({
        manufacturerId: manufacturerIdMap[item.manufacturerId] || Object.values(manufacturerIdMap)[0] || 1,
        nameAr: item.name_ar || item.nameAr || item.name || "فئة غير محددة",
        nameEn: item.name_en || item.nameEn || item.name || "Unknown Category",
        isActive: item.isActive !== false
      } as InsertCategory));
      
      const insertedCategories = await db.insert(vehicleCategories).values(categoriesData).returning();
      
      // إنشاء خريطة تربط المعرفات القديمة بالجديدة
      data.data.categories.forEach((oldItem: any, index: number) => {
        categoryIdMap[oldItem.id] = insertedCategories[index].id;
      });
    }
    
    // استيراد مستويات التريم مع ربطها بالفئات الجديدة
    if (data.data.trimLevels && data.data.trimLevels.length > 0) {
      console.log(`⚙️ استيراد ${data.data.trimLevels.length} مستوى تريم...`);
      const trimLevelsData = data.data.trimLevels.map((item: any) => ({
        categoryId: categoryIdMap[item.categoryId] || Object.values(categoryIdMap)[0] || 1,
        nameAr: item.name_ar || item.nameAr || item.name || "مستوى غير محدد",
        nameEn: item.name_en || item.nameEn || item.name || "Unknown Trim",
        isActive: item.isActive !== false
      } as InsertTrimLevel));
      await db.insert(vehicleTrimLevels).values(trimLevelsData);
    }
    
    // استيراد المستخدمين
    if (data.data.users && data.data.users.length > 0) {
      console.log(`👥 استيراد ${data.data.users.length} مستخدم...`);
      const usersData = data.data.users.map((item: any) => ({
        name: item.fullName || item.name || item.username,
        jobTitle: item.jobTitle || "موظف",
        phoneNumber: item.phoneNumber || "0500000000",
        username: item.username,
        password: item.password || "123456", // Default password if missing
        role: item.role || "seller"
      } as InsertUser));
      await db.insert(users).values(usersData);
    }
    
    // استيراد البنوك
    if (data.data.banks && data.data.banks.length > 0) {
      console.log(`🏦 استيراد ${data.data.banks.length} بنك...`);
      const banksData = data.data.banks.map((item: any) => ({
        logo: item.logo,
        bankName: item.name || item.bankName || "بنك غير محدد",
        nameEn: item.nameEn || item.name_en || "Unknown Bank",
        accountName: item.accountName || "حساب الشركة",
        accountNumber: item.accountNumber || "0000000000",
        iban: item.iban || "SA0000000000000000000000",
        type: item.type || "شركة",
        isActive: item.isVisible !== false
      } as InsertBank));
      await db.insert(banks).values(banksData);
    }
    
    // استيراد معدلات التمويل
    if (data.data.rates && data.data.rates.length > 0) {
      console.log(`💰 استيراد ${data.data.rates.length} معدل تمويل...`);
      const ratesData = data.data.rates.map((item: any) => ({
        bankId: 1, // Default to first bank
        categoryName: item.categoryName || "عام",
        interestRate: item.rate.toString(),
        years: item.years || 5,
        isActive: item.isActive !== false
      } as InsertBankRate));
      await db.insert(bankInterestRates).values(ratesData);
    }
    
    // استيراد المخزون
    if (data.data.inventory && data.data.inventory.length > 0) {
      console.log(`🚗 استيراد ${data.data.inventory.length} عنصر مخزون...`);
      const inventoryData = data.data.inventory.map((item: any) => ({
        manufacturer: item.manufacturer,
        category: item.category,
        trimLevel: item.trimLevel,
        engineCapacity: item.engineCapacity,
        year: item.year,
        exteriorColor: item.exteriorColor,
        interiorColor: item.interiorColor,
        status: item.status,
        importType: item.importType,
        ownershipType: item.ownershipType,
        location: item.location,
        chassisNumber: item.chassisNumber,
        images: item.images || [],
        logo: item.logo,
        notes: item.notes,
        detailedSpecifications: JSON.stringify(item.detailedSpecifications),
        entryDate: item.entryDate ? new Date(item.entryDate) : new Date(),
        price: item.price ? item.price.toString() : null,
        isSold: item.isSold || false,
        soldDate: item.soldDate ? new Date(item.soldDate) : null,
        reservationDate: item.reservationDate ? new Date(item.reservationDate) : null,
        reservedBy: item.reservedBy,
        salesRepresentative: item.salesRepresentative,
        reservationNote: item.reservationNotes,
        customerName: item.customerName,
        customerPhone: item.customerPhone,
        paidAmount: item.paidAmount ? item.paidAmount.toString() : null,
        salePrice: item.salePrice ? item.salePrice.toString() : null,
        paymentMethod: item.paymentMethod,
        bankName: item.bankName,
        soldToCustomerName: item.soldToCustomerName,
        soldToCustomerPhone: item.soldToCustomerPhone,
        soldBySalesRep: item.soldBySalesRep,
        saleNotes: item.saleNotes,
        mileage: item.mileage
      } as InsertInventory));
      
      // تقسيم البيانات إلى مجموعات صغيرة لتجنب مشاكل الذاكرة
      const batchSize = 100;
      for (let i = 0; i < inventoryData.length; i += batchSize) {
        const batch = inventoryData.slice(i, i + batchSize);
        await db.insert(inventoryItems).values(batch);
        console.log(`   ✅ تم استيراد ${i + batch.length}/${inventoryData.length} عنصر`);
      }
    }
    
    console.log('✅ تم الانتهاء من استيراد جميع البيانات بنجاح!');
    
    // عرض الإحصائيات
    const stats = {
      inventory: await db.$count(inventoryItems),
      banks: await db.$count(banks),
      rates: await db.$count(bankInterestRates),
      users: await db.$count(users),
      manufacturers: await db.$count(manufacturers),
      categories: await db.$count(vehicleCategories),
      trimLevels: await db.$count(vehicleTrimLevels),
      simpleTrimLevels: await db.$count(trimLevels)
    };
    
    console.log('\n📊 إحصائيات البيانات المستوردة:');
    console.log(`   📦 المخزون: ${stats.inventory}`);
    console.log(`   🏭 المصنعين: ${stats.manufacturers}`);
    console.log(`   📂 الفئات: ${stats.categories}`);
    console.log(`   ⚙️ مستويات التريم: ${stats.trimLevels}`);
    console.log(`   🔧 مستويات التريم البسيطة: ${stats.simpleTrimLevels}`);
    console.log(`   🏦 البنوك: ${stats.banks}`);
    console.log(`   💰 معدلات التمويل: ${stats.rates}`);
    console.log(`   👥 المستخدمين: ${stats.users}`);
    
  } catch (error) {
    console.error('❌ خطأ في استيراد البيانات:', error);
    process.exit(1);
  }
}

// تشغيل الاستيراد
importData()
  .then(() => {
    console.log('🎉 تم الانتهاء من العملية!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ فشل في استيراد البيانات:', error);
    process.exit(1);
  });