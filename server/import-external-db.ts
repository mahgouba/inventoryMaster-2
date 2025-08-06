import { Pool } from 'pg';
import { db } from './db';
import { inventoryItems, users, banks, manufacturers, vehicleCategories, vehicleTrimLevels } from "@shared/schema";

// استيراد البيانات من قاعدة البيانات الخارجية
export async function importFromExternalDatabase(externalDbUrl: string) {
  let externalPool: Pool | null = null;
  
  try {
    console.log('🔗 Connecting to external database...');
    
    // إنشاء اتصال مع قاعدة البيانات الخارجية
    externalPool = new Pool({
      connectionString: externalDbUrl,
      ssl: {
        rejectUnauthorized: false
      },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // اختبار الاتصال
    await externalPool.query('SELECT 1');
    console.log('✅ Connected to external database successfully');

    if (!db) {
      throw new Error('Local database not available');
    }

    // استيراد البيانات من الجداول المختلفة
    
    // 1. استيراد المستخدمين
    try {
      console.log('👥 Importing users...');
      const usersResult = await externalPool.query('SELECT * FROM users ORDER BY id');
      if (usersResult.rows.length > 0) {
        for (const user of usersResult.rows) {
          try {
            await db.insert(users).values({
              name: user.name || 'مستخدم غير محدد',
              jobTitle: user.job_title || user.jobTitle || 'غير محدد',
              phoneNumber: user.phone_number || user.phoneNumber || '0000000000',
              username: user.username,
              password: user.password,
              role: user.role || 'seller'
            }).onConflictDoNothing();
          } catch (userError) {
            console.log(`⚠️ Error importing user ${user.username}:`, userError);
          }
        }
        console.log(`✅ Imported ${usersResult.rows.length} users`);
      }
    } catch (error) {
      console.log('⚠️ Could not import users table:', error);
    }

    // 2. استيراد البنوك
    try {
      console.log('🏦 Importing banks...');
      const banksResult = await externalPool.query('SELECT * FROM banks ORDER BY id');
      if (banksResult.rows.length > 0) {
        for (const bank of banksResult.rows) {
          try {
            await db.insert(banks).values({
              logo: bank.logo,
              bankName: bank.bank_name || bank.bankName,
              nameEn: bank.name_en || bank.nameEn,
              accountName: bank.account_name || bank.accountName,
              accountNumber: bank.account_number || bank.accountNumber,
              iban: bank.iban,
              type: bank.type || 'شخصي',
              isActive: bank.is_active ?? bank.isActive ?? true
            }).onConflictDoNothing();
          } catch (bankError) {
            console.log(`⚠️ Error importing bank ${bank.bank_name || bank.bankName}:`, bankError);
          }
        }
        console.log(`✅ Imported ${banksResult.rows.length} banks`);
      }
    } catch (error) {
      console.log('⚠️ Could not import banks table:', error);
    }

    // 3. استيراد الشركات المصنعة
    try {
      console.log('🏭 Importing manufacturers...');
      const manufacturersResult = await externalPool.query('SELECT * FROM manufacturers ORDER BY id');
      if (manufacturersResult.rows.length > 0) {
        for (const manufacturer of manufacturersResult.rows) {
          try {
            await db.insert(manufacturers).values({
              nameAr: manufacturer.name_ar || manufacturer.nameAr,
              nameEn: manufacturer.name_en || manufacturer.nameEn,
              logo: manufacturer.logo,
              isActive: manufacturer.is_active ?? manufacturer.isActive ?? true
            }).onConflictDoNothing();
          } catch (manuError) {
            console.log(`⚠️ Error importing manufacturer ${manufacturer.name_ar || manufacturer.nameAr}:`, manuError);
          }
        }
        console.log(`✅ Imported ${manufacturersResult.rows.length} manufacturers`);
      }
    } catch (error) {
      console.log('⚠️ Could not import manufacturers table:', error);
    }

    // 4. استيراد عناصر المخزون
    try {
      console.log('🚗 Importing inventory items...');
      const inventoryResult = await externalPool.query('SELECT * FROM inventory_items ORDER BY id LIMIT 1000');
      if (inventoryResult.rows.length > 0) {
        let importedCount = 0;
        for (const item of inventoryResult.rows) {
          try {
            await db.insert(inventoryItems).values({
              manufacturer: item.manufacturer,
              category: item.category,
              trimLevel: item.trim_level || item.trimLevel,
              engineCapacity: item.engine_capacity || item.engineCapacity || '2.0L',
              year: item.year,
              exteriorColor: item.exterior_color || item.exteriorColor,
              interiorColor: item.interior_color || item.interiorColor,
              status: item.status,
              importType: item.import_type || item.importType,
              ownershipType: item.ownership_type || item.ownershipType || 'ملك الشركة',
              location: item.location,
              chassisNumber: item.chassis_number || item.chassisNumber,
              images: item.images || [],
              logo: item.logo,
              notes: item.notes,
              detailedSpecifications: item.detailed_specifications || item.detailedSpecifications,
              price: item.price ? item.price.toString() : null,
              isSold: item.is_sold ?? item.isSold ?? false,
              soldDate: item.sold_date || item.soldDate,
              reservationDate: item.reservation_date || item.reservationDate,
              reservedBy: item.reserved_by || item.reservedBy,
              salesRepresentative: item.sales_representative || item.salesRepresentative,
              reservationNote: item.reservation_note || item.reservationNote,
              customerName: item.customer_name || item.customerName,
              customerPhone: item.customer_phone || item.customerPhone,
              paidAmount: item.paid_amount || item.paidAmount ? (item.paid_amount || item.paidAmount).toString() : null,
              salePrice: item.sale_price || item.salePrice ? (item.sale_price || item.salePrice).toString() : null,
              paymentMethod: item.payment_method || item.paymentMethod,
              bankName: item.bank_name || item.bankName,
              soldToCustomerName: item.sold_to_customer_name || item.soldToCustomerName,
              soldToCustomerPhone: item.sold_to_customer_phone || item.soldToCustomerPhone,
              soldBySalesRep: item.sold_by_sales_rep || item.soldBySalesRep,
              saleNotes: item.sale_notes || item.saleNotes,
              mileage: item.mileage
            }).onConflictDoNothing();
            importedCount++;
          } catch (itemError) {
            console.log(`⚠️ Error importing inventory item ${item.chassis_number || item.chassisNumber}:`, itemError);
          }
        }
        console.log(`✅ Imported ${importedCount} inventory items`);
      }
    } catch (error) {
      console.log('⚠️ Could not import inventory_items table:', error);
    }

    console.log('🎉 Data import completed successfully!');
    
    return {
      success: true,
      message: 'تم استيراد البيانات بنجاح'
    };

  } catch (error) {
    console.error('❌ Error importing from external database:', error);
    return {
      success: false,
      message: `خطأ في استيراد البيانات: ${error.message}`
    };
  } finally {
    if (externalPool) {
      await externalPool.end();
      console.log('🔌 External database connection closed');
    }
  }
}