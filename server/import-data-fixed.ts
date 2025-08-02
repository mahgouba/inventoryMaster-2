import { db } from "./db";
import { 
  users, inventoryItems, banks, manufacturers, vehicleCategories, vehicleTrimLevels
} from "@shared/schema";
import fs from 'fs/promises';
import path from 'path';

async function importDataFromJson() {
  try {
    console.log('🔄 Starting data import from data.base.json...');
    
    // Read the data.base.json file
    const dataPath = path.join(process.cwd(), 'data.base.json');
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));
    
    let stats = {
      users: 0,
      inventory: 0,
      banks: 0,
      manufacturers: 0,
      categories: 0,
      trimLevels: 0
    };

    // Import Users first
    if (data.data?.users && Array.isArray(data.data.users)) {
      console.log(`📝 Importing ${data.data.users.length} users...`);
      for (const user of data.data.users) {
        try {
          const userData = {
            name: user.name || user.fullName || user.username || 'مستخدم',
            jobTitle: user.jobTitle || user.job_title || 'موظف',
            phoneNumber: user.phoneNumber || user.phone_number || user.phone || '000000000',
            username: user.username,
            password: user.password || '$2b$10$defaulthash',
            role: user.role || 'salesperson'
          };
          
          await db.insert(users).values(userData).onConflictDoNothing();
          stats.users++;
        } catch (error) {
          console.error(`Error importing user ${user.username}:`, error);
        }
      }
    }

    // Import Banks
    if (data.data?.banks && Array.isArray(data.data.banks)) {
      console.log(`💰 Importing ${data.data.banks.length} banks...`);
      for (const bank of data.data.banks) {
        try {
          const bankData = {
            bankName: bank.bankName || bank.nameAr || bank.name || 'بنك',
            nameEn: bank.nameEn || bank.name_en || bank.bankName || 'Bank',
            accountName: bank.accountName || bank.account_name || 'حساب',
            accountNumber: bank.accountNumber || bank.account_number || '000000',
            iban: bank.iban || 'SA0000000000000000000000',
            type: bank.type || 'company',
            logo: bank.logo || null,
            isActive: bank.isActive !== false
          };
          
          await db.insert(banks).values(bankData).onConflictDoNothing();
          stats.banks++;
        } catch (error) {
          console.error(`Error importing bank ${bank.bankName || bank.name}:`, error);
        }
      }
    }

    // Import Manufacturers
    if (data.data?.manufacturers && Array.isArray(data.data.manufacturers)) {
      console.log(`🏭 Importing ${data.data.manufacturers.length} manufacturers...`);
      for (const manufacturer of data.data.manufacturers) {
        try {
          const manufacturerData = {
            nameAr: manufacturer.nameAr || manufacturer.name_ar || manufacturer.name || 'صانع',
            nameEn: manufacturer.nameEn || manufacturer.name_en || manufacturer.name || 'Manufacturer',
            logo: manufacturer.logo || null,
            isActive: manufacturer.isActive !== false
          };
          
          await db.insert(manufacturers).values(manufacturerData).onConflictDoNothing();
          stats.manufacturers++;
        } catch (error) {
          console.error(`Error importing manufacturer ${manufacturer.nameAr || manufacturer.name}:`, error);
        }
      }
    }

    // Import Categories
    if (data.data?.categories && Array.isArray(data.data.categories)) {
      console.log(`📂 Importing ${data.data.categories.length} categories...`);
      for (const category of data.data.categories) {
        try {
          const categoryData = {
            manufacturerId: category.manufacturerId || 1,
            nameAr: category.nameAr || category.name_ar || category.name || 'فئة',
            nameEn: category.nameEn || category.name_en || category.name || 'Category',
            isActive: category.isActive !== false
          };
          
          await db.insert(vehicleCategories).values(categoryData).onConflictDoNothing();
          stats.categories++;
        } catch (error) {
          console.error(`Error importing category ${category.nameAr || category.name}:`, error);
        }
      }
    }

    // Import Trim Levels
    if (data.data?.trimLevels && Array.isArray(data.data.trimLevels)) {
      console.log(`🔧 Importing ${data.data.trimLevels.length} trim levels...`);
      for (const trimLevel of data.data.trimLevels) {
        try {
          const trimLevelData = {
            categoryId: trimLevel.categoryId || 1,
            nameAr: trimLevel.nameAr || trimLevel.name_ar || trimLevel.name || 'درجة تجهيز',
            nameEn: trimLevel.nameEn || trimLevel.name_en || trimLevel.name || 'Trim Level',
            isActive: trimLevel.isActive !== false
          };
          
          await db.insert(vehicleTrimLevels).values(trimLevelData).onConflictDoNothing();
          stats.trimLevels++;
        } catch (error) {
          console.error(`Error importing trim level ${trimLevel.nameAr || trimLevel.name}:`, error);
        }
      }
    }

    // Import Inventory Items
    if (data.data?.inventory && Array.isArray(data.data.inventory)) {
      console.log(`🚗 Importing ${data.data.inventory.length} inventory items...`);
      for (const item of data.data.inventory) {
        try {
          const inventoryData = {
            manufacturer: item.manufacturer || 'غير محدد',
            category: item.category || 'غير محدد',
            trimLevel: item.trimLevel || null,
            engineCapacity: item.engineCapacity || '0.0L',
            year: item.year || 2020,
            exteriorColor: item.exteriorColor || 'غير محدد',
            interiorColor: item.interiorColor || 'غير محدد',
            status: item.status || 'متوفر',
            importType: item.importType || 'شخصي',
            ownershipType: item.ownershipType || 'ملك الشركة',
            location: item.location || 'المعرض',
            chassisNumber: item.chassisNumber || `CHASSIS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            images: item.images || [],
            logo: item.logo || null,
            notes: item.notes || null,
            detailedSpecifications: item.detailedSpecifications || null,
            price: item.price ? parseFloat(item.price.toString()) : null,
            isSold: item.isSold || false,
            soldDate: item.soldDate ? new Date(item.soldDate) : null,
            reservationDate: item.reservationDate ? new Date(item.reservationDate) : null,
            reservedBy: item.reservedBy || null,
            salesRepresentative: item.salesRepresentative || null,
            reservationNote: item.reservationNote || null,
            customerName: item.customerName || null,
            customerPhone: item.customerPhone || null,
            paidAmount: item.paidAmount ? parseFloat(item.paidAmount.toString()) : null,
            salePrice: item.salePrice ? parseFloat(item.salePrice.toString()) : null,
            paymentMethod: item.paymentMethod || null,
            bankName: item.bankName || null,
            soldToCustomerName: item.soldToCustomerName || null,
            soldToCustomerPhone: item.soldToCustomerPhone || null,
            soldBySalesRep: item.soldBySalesRep || null,
            saleNotes: item.saleNotes || null,
            mileage: item.mileage || null
          };
          
          await db.insert(inventoryItems).values(inventoryData).onConflictDoNothing();
          stats.inventory++;
        } catch (error) {
          console.error(`Error importing inventory item ${item.chassisNumber}:`, error);
        }
      }
    }

    console.log('✅ Data import completed successfully!');
    console.log('📊 Import statistics:');
    console.log(`   - Users: ${stats.users}`);
    console.log(`   - Banks: ${stats.banks}`);
    console.log(`   - Manufacturers: ${stats.manufacturers}`);
    console.log(`   - Categories: ${stats.categories}`);
    console.log(`   - Trim Levels: ${stats.trimLevels}`);
    console.log(`   - Inventory Items: ${stats.inventory}`);
    console.log(`   - Total: ${stats.users + stats.banks + stats.manufacturers + stats.categories + stats.trimLevels + stats.inventory}`);

  } catch (error) {
    console.error('❌ Error during data import:', error);
    throw error;
  }
}

// Run the import
importDataFromJson()
  .then(() => {
    console.log('✅ Data import complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });