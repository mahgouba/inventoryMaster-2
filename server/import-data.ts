import { db } from "./db";
import { 
  users, inventoryItems, banks, manufacturers, vehicleCategories, vehicleTrimLevels,
  type InsertUser, type InsertInventoryItem, type InsertBank, 
  type InsertManufacturer, type InsertVehicleCategory, type InsertVehicleTrimLevel
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

    // Import Users
    if (data.users && Array.isArray(data.users)) {
      console.log(`📝 Importing ${data.users.length} users...`);
      for (const user of data.users) {
        try {
          const userData: InsertUser = {
            username: user.username,
            fullName: user.fullName || user.full_name || user.username,
            password: user.password || '$2b$10$defaulthash', // Default hash if no password
            role: user.role || 'salesperson',
            email: user.email || null,
            phone: user.phone || null,
            isActive: user.isActive !== false,
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
            updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date()
          };
          
          await db.insert(users).values(userData).onConflictDoNothing();
          stats.users++;
        } catch (error) {
          console.error(`Error importing user ${user.username}:`, error);
        }
      }
    }

    // Import Banks
    if (data.banks && Array.isArray(data.banks)) {
      console.log(`💰 Importing ${data.banks.length} banks...`);
      for (const bank of data.banks) {
        try {
          const bankData: InsertBank = {
            nameAr: bank.nameAr || bank.name_ar || bank.name,
            nameEn: bank.nameEn || bank.name_en || bank.name,
            accountNumber: bank.accountNumber || bank.account_number || '',
            iban: bank.iban || '',
            type: bank.type || 'company',
            isVisible: bank.isVisible !== false,
            createdAt: bank.createdAt ? new Date(bank.createdAt) : new Date(),
            updatedAt: bank.updatedAt ? new Date(bank.updatedAt) : new Date()
          };
          
          await db.insert(banks).values(bankData).onConflictDoNothing();
          stats.banks++;
        } catch (error) {
          console.error(`Error importing bank ${bank.nameAr || bank.name}:`, error);
        }
      }
    }

    // Import Manufacturers
    if (data.manufacturers && Array.isArray(data.manufacturers)) {
      console.log(`🏭 Importing ${data.manufacturers.length} manufacturers...`);
      for (const manufacturer of data.manufacturers) {
        try {
          const manufacturerData: InsertManufacturer = {
            nameAr: manufacturer.nameAr || manufacturer.name_ar || manufacturer.name,
            nameEn: manufacturer.nameEn || manufacturer.name_en || manufacturer.name,
            logo: manufacturer.logo || null,
            isActive: manufacturer.isActive !== false,
            createdAt: manufacturer.createdAt ? new Date(manufacturer.createdAt) : new Date(),
            updatedAt: manufacturer.updatedAt ? new Date(manufacturer.updatedAt) : new Date()
          };
          
          await db.insert(manufacturers).values(manufacturerData).onConflictDoNothing();
          stats.manufacturers++;
        } catch (error) {
          console.error(`Error importing manufacturer ${manufacturer.nameAr || manufacturer.name}:`, error);
        }
      }
    }

    // Import Categories
    if (data.categories && Array.isArray(data.categories)) {
      console.log(`📂 Importing ${data.categories.length} categories...`);
      for (const category of data.categories) {
        try {
          const categoryData: InsertVehicleCategory = {
            manufacturerId: category.manufacturerId || 1, // Default to first manufacturer
            nameAr: category.nameAr || category.name_ar || category.name,
            nameEn: category.nameEn || category.name_en || category.name,
            isActive: category.isActive !== false,
            createdAt: category.createdAt ? new Date(category.createdAt) : new Date(),
            updatedAt: category.updatedAt ? new Date(category.updatedAt) : new Date()
          };
          
          await db.insert(vehicleCategories).values(categoryData).onConflictDoNothing();
          stats.categories++;
        } catch (error) {
          console.error(`Error importing category ${category.nameAr || category.name}:`, error);
        }
      }
    }

    // Import Trim Levels
    if (data.trimLevels && Array.isArray(data.trimLevels)) {
      console.log(`🔧 Importing ${data.trimLevels.length} trim levels...`);
      for (const trimLevel of data.trimLevels) {
        try {
          const trimLevelData: InsertVehicleTrimLevel = {
            categoryId: trimLevel.categoryId || 1, // Default to first category
            nameAr: trimLevel.nameAr || trimLevel.name_ar || trimLevel.name,
            nameEn: trimLevel.nameEn || trimLevel.name_en || trimLevel.name,
            isActive: trimLevel.isActive !== false,
            createdAt: trimLevel.createdAt ? new Date(trimLevel.createdAt) : new Date(),
            updatedAt: trimLevel.updatedAt ? new Date(trimLevel.updatedAt) : new Date()
          };
          
          await db.insert(vehicleTrimLevels).values(trimLevelData).onConflictDoNothing();
          stats.trimLevels++;
        } catch (error) {
          console.error(`Error importing trim level ${trimLevel.nameAr || trimLevel.name}:`, error);
        }
      }
    }

    // Import Inventory Items
    if (data.inventory && Array.isArray(data.inventory)) {
      console.log(`🚗 Importing ${data.inventory.length} inventory items...`);
      for (const item of data.inventory) {
        try {
          const inventoryData: InsertInventoryItem = {
            manufacturer: item.manufacturer || item.brand || '',
            category: item.category || item.model || '',
            trimLevel: item.trimLevel || item.trim || null,
            year: item.year || new Date().getFullYear(),
            chassisNumber: item.chassisNumber || item.chassis_number || item.vin || '',
            engineCapacity: item.engineCapacity || item.engine_capacity || '',
            exteriorColor: item.exteriorColor || item.exterior_color || item.color || '',
            interiorColor: item.interiorColor || item.interior_color || '',
            fuel: item.fuel || 'بنزين',
            transmission: item.transmission || 'أوتوماتيك',
            drivetrain: item.drivetrain || 'دفع أمامي',
            doors: item.doors || 4,
            seats: item.seats || 5,
            price: item.price || 0,
            status: item.status || 'متوفر',
            location: item.location || 'المعرض الرئيسي',
            notes: item.notes || null,
            images: item.images || [],
            importType: item.importType || item.import_type || 'شركة',
            logo: item.logo || null,
            isSold: item.isSold || false,
            soldAt: item.soldAt ? new Date(item.soldAt) : null,
            soldPrice: item.soldPrice || null,
            customerName: item.customerName || null,
            customerPhone: item.customerPhone || null,
            salesRep: item.salesRep || null,
            entryDate: item.entryDate ? new Date(item.entryDate) : new Date(),
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date()
          };
          
          await db.insert(inventoryItems).values(inventoryData).onConflictDoNothing();
          stats.inventory++;
        } catch (error) {
          console.error(`Error importing inventory item ${item.chassisNumber || item.id}:`, error);
        }
      }
    }

    console.log('✅ Data import completed successfully!');
    console.log(`📊 Import statistics:`);
    console.log(`   - Users: ${stats.users}`);
    console.log(`   - Banks: ${stats.banks}`);
    console.log(`   - Manufacturers: ${stats.manufacturers}`);
    console.log(`   - Categories: ${stats.categories}`);
    console.log(`   - Trim Levels: ${stats.trimLevels}`);
    console.log(`   - Inventory Items: ${stats.inventory}`);
    console.log(`   - Total: ${Object.values(stats).reduce((a, b) => a + b, 0)}`);

    return stats;
    
  } catch (error) {
    console.error('❌ Data import failed:', error);
    throw error;
  }
}

// Run if called directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  importDataFromJson().then(() => {
    console.log('✅ Data import complete');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Data import failed:', error);
    process.exit(1);
  });
}

export { importDataFromJson };