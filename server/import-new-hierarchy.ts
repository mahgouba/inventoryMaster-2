import { getDatabase } from "./db";
import { manufacturers, vehicleCategories, vehicleTrimLevels } from "@shared/schema";
import fs from 'fs';

const hierarchyData = [
  {
    "brand_ar": "لاند روفر",
    "brand_en": "Land Rover",
    "models": [
      {
        "model_ar": "رنج روفر",
        "model_en": "Range Rover",
        "trims": [
          {"trim_ar": "SE", "trim_en": "SE"},
          {"trim_ar": "HSE", "trim_en": "HSE"},
          {"trim_ar": "أوتوبيوغرافي", "trim_en": "Autobiography"},
          {"trim_ar": "SV", "trim_en": "SV"}
        ]
      },
      {
        "model_ar": "رنج روفر سبورت",
        "model_en": "Range Rover Sport",
        "trims": [
          {"trim_ar": "SE", "trim_en": "SE"},
          {"trim_ar": "ديناميك SE", "trim_en": "Dynamic SE"},
          {"trim_ar": "ديناميك HSE", "trim_en": "Dynamic HSE"},
          {"trim_ar": "أوتوبيوغرافي", "trim_en": "Autobiography"},
          {"trim_ar": "SV", "trim_en": "SV"}
        ]
      },
      {
        "model_ar": "رنج روفر فيلار",
        "model_en": "Range Rover Velar",
        "trims": [
          {"trim_ar": "S", "trim_en": "S"},
          {"trim_ar": "ديناميك SE", "trim_en": "Dynamic SE"},
          {"trim_ar": "ديناميك HSE", "trim_en": "Dynamic HSE"},
          {"trim_ar": "SV أوتوبيوغرافي ديناميك إيديشن", "trim_en": "SVAutobiography Dynamic Edition"}
        ]
      },
      {
        "model_ar": "رنج روفر إيفوك",
        "model_en": "Range Rover Evoque",
        "trims": [
          {"trim_ar": "S", "trim_en": "S"},
          {"trim_ar": "ديناميك SE", "trim_en": "Dynamic SE"},
          {"trim_ar": "ديناميك HSE", "trim_en": "Dynamic HSE"}
        ]
      },
      {
        "model_ar": "ديفندر 90",
        "model_en": "Defender 90",
        "trims": [
          {"trim_ar": "S", "trim_en": "S"},
          {"trim_ar": "X-ديناميك S", "trim_en": "X-Dynamic S"},
          {"trim_ar": "X-ديناميك SE", "trim_en": "X-Dynamic SE"},
          {"trim_ar": "X-ديناميك HSE", "trim_en": "X-Dynamic HSE"},
          {"trim_ar": "X", "trim_en": "X"},
          {"trim_ar": "V8", "trim_en": "V8"}
        ]
      },
      {
        "model_ar": "ديفندر 110",
        "model_en": "Defender 110",
        "trims": [
          {"trim_ar": "S", "trim_en": "S"},
          {"trim_ar": "X-ديناميك S", "trim_en": "X-Dynamic S"},
          {"trim_ar": "X-ديناميك SE", "trim_en": "X-Dynamic SE"},
          {"trim_ar": "X-ديناميك HSE", "trim_en": "X-Dynamic HSE"},
          {"trim_ar": "X", "trim_en": "X"},
          {"trim_ar": "V8", "trim_en": "V8"}
        ]
      },
      {
        "model_ar": "ديفندر 130",
        "model_en": "Defender 130",
        "trims": [
          {"trim_ar": "S", "trim_en": "S"},
          {"trim_ar": "X-ديناميك SE", "trim_en": "X-Dynamic SE"},
          {"trim_ar": "آوت باوند", "trim_en": "Outbound"},
          {"trim_ar": "X", "trim_en": "X"},
          {"trim_ar": "V8", "trim_en": "V8"}
        ]
      }
    ]
  },
  {
    "brand_ar": "مرسيدس-بنز",
    "brand_en": "Mercedes-Benz",
    "models": [
      {
        "model_ar": "C-كلاس",
        "model_en": "C-Class",
        "trims": [
          {"trim_ar": "C 200", "trim_en": "C 200"},
          {"trim_ar": "C 300", "trim_en": "C 300"},
          {"trim_ar": "AMG C 43", "trim_en": "AMG C 43"},
          {"trim_ar": "AMG C 63", "trim_en": "AMG C 63"},
          {"trim_ar": "سيدان", "trim_en": "Sedan"},
          {"trim_ar": "كوبيه", "trim_en": "Coupe"},
          {"trim_ar": "كابريوليه", "trim_en": "Cabriolet"}
        ]
      },
      {
        "model_ar": "E-كلاس",
        "model_en": "E-Class",
        "trims": [
          {"trim_ar": "E 350", "trim_en": "E 350"},
          {"trim_ar": "E 450", "trim_en": "E 450"},
          {"trim_ar": "AMG E 53", "trim_en": "AMG E 53"},
          {"trim_ar": "AMG E 63 S", "trim_en": "AMG E 63 S"},
          {"trim_ar": "سيدان", "trim_en": "Sedan"},
          {"trim_ar": "كوبيه", "trim_en": "Coupe"},
          {"trim_ar": "كابريوليه", "trim_en": "Cabriolet"}
        ]
      },
      {
        "model_ar": "S-كلاس",
        "model_en": "S-Class",
        "trims": [
          {"trim_ar": "S 450", "trim_en": "S 450"},
          {"trim_ar": "S 500", "trim_en": "S 500"},
          {"trim_ar": "S 580", "trim_en": "S 580"},
          {"trim_ar": "S 680 (مايباخ)", "trim_en": "S 680 (Maybach)"}
        ]
      },
      {
        "model_ar": "GLE",
        "model_en": "GLE",
        "trims": [
          {"trim_ar": "GLE 350", "trim_en": "GLE 350"},
          {"trim_ar": "GLE 450", "trim_en": "GLE 450"},
          {"trim_ar": "GLE 53", "trim_en": "GLE 53"},
          {"trim_ar": "GLE 63 S", "trim_en": "GLE 63 S"},
          {"trim_ar": "SUV", "trim_en": "SUV"},
          {"trim_ar": "كوبيه", "trim_en": "Coupe"}
        ]
      },
      {
        "model_ar": "G-كلاس",
        "model_en": "G-Class",
        "trims": [
          {"trim_ar": "G 550", "trim_en": "G 550"},
          {"trim_ar": "AMG G 63", "trim_en": "AMG G 63"}
        ]
      }
    ]
  },
  {
    "brand_ar": "بي إم دبليو",
    "brand_en": "BMW",
    "models": [
      {
        "model_ar": "الفئة الثالثة",
        "model_en": "3 Series",
        "trims": [
          {"trim_ar": "320i", "trim_en": "320i"},
          {"trim_ar": "330i", "trim_en": "330i"},
          {"trim_ar": "M340i", "trim_en": "M340i"},
          {"trim_ar": "M3", "trim_en": "M3"},
          {"trim_ar": "سيدان", "trim_en": "Sedan"},
          {"trim_ar": "تورينج", "trim_en": "Touring"}
        ]
      },
      {
        "model_ar": "الفئة الخامسة",
        "model_en": "5 Series",
        "trims": [
          {"trim_ar": "530i", "trim_en": "530i"},
          {"trim_ar": "540i", "trim_en": "540i"},
          {"trim_ar": "M560i", "trim_en": "M560i"},
          {"trim_ar": "M5", "trim_en": "M5"},
          {"trim_ar": "سيدان", "trim_en": "Sedan"},
          {"trim_ar": "تورينج", "trim_en": "Touring"}
        ]
      },
      {
        "model_ar": "الفئة السابعة",
        "model_en": "7 Series",
        "trims": [
          {"trim_ar": "740i", "trim_en": "740i"},
          {"trim_ar": "760i", "trim_en": "760i"},
          {"trim_ar": "i7", "trim_en": "i7"}
        ]
      },
      {
        "model_ar": "X5",
        "model_en": "X5",
        "trims": [
          {"trim_ar": "xDrive40i", "trim_en": "xDrive40i"},
          {"trim_ar": "xDrive50e", "trim_en": "xDrive50e"},
          {"trim_ar": "M60i", "trim_en": "M60i"},
          {"trim_ar": "X5 M", "trim_en": "X5 M"}
        ]
      },
      {
        "model_ar": "X7",
        "model_en": "X7",
        "trims": [
          {"trim_ar": "xDrive40i", "trim_en": "xDrive40i"},
          {"trim_ar": "M60i", "trim_en": "M60i"},
          {"trim_ar": "ألبينا XB7", "trim_en": "Alpina XB7"}
        ]
      }
    ]
  },
  {
    "brand_ar": "رولز رويس",
    "brand_en": "Rolls-Royce",
    "models": [
      {
        "model_ar": "فانتوم",
        "model_en": "Phantom",
        "trims": [
          {"trim_ar": "قاعدة عجلات قياسية", "trim_en": "Standard Wheelbase"},
          {"trim_ar": "قاعدة عجلات ممتدة", "trim_en": "Extended Wheelbase"}
        ]
      },
      {
        "model_ar": "جوست",
        "model_en": "Ghost",
        "trims": [
          {"trim_ar": "قاعدة عجلات قياسية", "trim_en": "Standard Wheelbase"},
          {"trim_ar": "قاعدة عجلات ممتدة", "trim_en": "Extended Wheelbase"}
        ]
      },
      {
        "model_ar": "كولينان",
        "model_en": "Cullinan",
        "trims": [
          {"trim_ar": "ستاندرد", "trim_en": "Standard"},
          {"trim_ar": "بلاك بادج", "trim_en": "Black Badge"}
        ]
      },
      {
        "model_ar": "سبيكتر",
        "model_en": "Spectre",
        "trims": [
          {"trim_ar": "كهربائية", "trim_en": "Electric"}
        ]
      }
    ]
  },
  {
    "brand_ar": "بنتلي",
    "brand_en": "Bentley",
    "models": [
      {
        "model_ar": "كونتيننتال GT",
        "model_en": "Continental GT",
        "trims": [
          {"trim_ar": "V8", "trim_en": "V8"},
          {"trim_ar": "W12", "trim_en": "W12"},
          {"trim_ar": "سبيد", "trim_en": "Speed"},
          {"trim_ar": "كوبيه", "trim_en": "Coupe"},
          {"trim_ar": "كابريوليه", "trim_en": "Convertible"}
        ]
      },
      {
        "model_ar": "فلاينج سبير",
        "model_en": "Flying Spur",
        "trims": [
          {"trim_ar": "V8", "trim_en": "V8"},
          {"trim_ar": "W12", "trim_en": "W12"},
          {"trim_ar": "هايبريد", "trim_en": "Hybrid"}
        ]
      },
      {
        "model_ar": "بينتايجا",
        "model_en": "Bentayga",
        "trims": [
          {"trim_ar": "V8", "trim_en": "V8"},
          {"trim_ar": "هايبريد", "trim_en": "Hybrid"},
          {"trim_ar": "سبيد", "trim_en": "Speed"}
        ]
      }
    ]
  },
  {
    "brand_ar": "لكزس",
    "brand_en": "Lexus",
    "models": [
      {
        "model_ar": "ES",
        "model_en": "ES",
        "trims": [
          {"trim_ar": "ES 250", "trim_en": "ES 250"},
          {"trim_ar": "ES 350", "trim_en": "ES 350"},
          {"trim_ar": "ES 300h", "trim_en": "ES 300h"},
          {"trim_ar": "لكجري", "trim_en": "Luxury"},
          {"trim_ar": "F سبورت", "trim_en": "F Sport"},
          {"trim_ar": "ألترا لكجري", "trim_en": "Ultra Luxury"}
        ]
      },
      {
        "model_ar": "RX",
        "model_en": "RX",
        "trims": [
          {"trim_ar": "RX 350", "trim_en": "RX 350"},
          {"trim_ar": "RX 450h", "trim_en": "RX 450h"},
          {"trim_ar": "RX 500h", "trim_en": "RX 500h"},
          {"trim_ar": "ستاندرد", "trim_en": "Standard"},
          {"trim_ar": "بريميوم", "trim_en": "Premium"},
          {"trim_ar": "F سبورت", "trim_en": "F Sport"},
          {"trim_ar": "لكجري", "trim_en": "Luxury"}
        ]
      },
      {
        "model_ar": "GX",
        "model_en": "GX",
        "trims": [
          {"trim_ar": "GX 460", "trim_en": "GX 460"},
          {"trim_ar": "GX 550", "trim_en": "GX 550"},
          {"trim_ar": "بريميوم", "trim_en": "Premium"},
          {"trim_ar": "لكجري", "trim_en": "Luxury"},
          {"trim_ar": "أوفر تريل", "trim_en": "Overtrail"}
        ]
      },
      {
        "model_ar": "LX",
        "model_en": "LX",
        "trims": [
          {"trim_ar": "LX 600", "trim_en": "LX 600"},
          {"trim_ar": "ستاندرد", "trim_en": "Standard"},
          {"trim_ar": "بريميوم", "trim_en": "Premium"},
          {"trim_ar": "F سبورت", "trim_en": "F Sport"},
          {"trim_ar": "ألترا لكجري", "trim_en": "Ultra Luxury"}
        ]
      }
    ]
  },
  {
    "brand_ar": "تويوتا",
    "brand_en": "Toyota",
    "models": [
      {
        "model_ar": "كامري",
        "model_en": "Camry",
        "trims": [
          {"trim_ar": "LE", "trim_en": "LE"},
          {"trim_ar": "SE", "trim_en": "SE"},
          {"trim_ar": "XLE", "trim_en": "XLE"},
          {"trim_ar": "XSE", "trim_en": "XSE"},
          {"trim_ar": "TRD", "trim_en": "TRD"}
        ]
      },
      {
        "model_ar": "كورولا",
        "model_en": "Corolla",
        "trims": [
          {"trim_ar": "L", "trim_en": "L"},
          {"trim_ar": "LE", "trim_en": "LE"},
          {"trim_ar": "SE", "trim_en": "SE"},
          {"trim_ar": "XSE", "trim_en": "XSE"},
          {"trim_ar": "نايت شيد", "trim_en": "Nightshade"}
        ]
      },
      {
        "model_ar": "راف4",
        "model_en": "RAV4",
        "trims": [
          {"trim_ar": "LE", "trim_en": "LE"},
          {"trim_ar": "XLE", "trim_en": "XLE"},
          {"trim_ar": "XLE بريميوم", "trim_en": "XLE Premium"},
          {"trim_ar": "أدفينشر", "trim_en": "Adventure"},
          {"trim_ar": "TRD أوف-رود", "trim_en": "TRD Off-Road"},
          {"trim_ar": "ليميتد", "trim_en": "Limited"}
        ]
      },
      {
        "model_ar": "لاند كروزر",
        "model_en": "Land Cruiser",
        "trims": [
          {"trim_ar": "GX", "trim_en": "GX"},
          {"trim_ar": "GXR", "trim_en": "GXR"},
          {"trim_ar": "VXR", "trim_en": "VXR"}
        ]
      },
      {
        "model_ar": "هايلوكس",
        "model_en": "Hilux",
        "trims": [
          {"trim_ar": "كبينة واحدة", "trim_en": "Single Cab"},
          {"trim_ar": "كبينة مزدوجة", "trim_en": "Double Cab"},
          {"trim_ar": "GL", "trim_en": "GL"},
          {"trim_ar": "GLX", "trim_en": "GLX"},
          {"trim_ar": "SR5", "trim_en": "SR5"}
        ]
      },
      {
        "model_ar": "سوبرا",
        "model_en": "Supra",
        "trims": [
          {"trim_ar": "2.0", "trim_en": "2.0"},
          {"trim_ar": "3.0", "trim_en": "3.0"},
          {"trim_ar": "3.0 بريميوم", "trim_en": "3.0 Premium"}
        ]
      }
    ]
  },
  {
    "brand_ar": "نيسان",
    "brand_en": "Nissan",
    "models": [
      {
        "model_ar": "ألتيما",
        "model_en": "Altima",
        "trims": [
          {"trim_ar": "S", "trim_en": "S"},
          {"trim_ar": "SV", "trim_en": "SV"},
          {"trim_ar": "SL", "trim_en": "SL"},
          {"trim_ar": "SR", "trim_en": "SR"}
        ]
      },
      {
        "model_ar": "باترول",
        "model_en": "Patrol",
        "trims": [
          {"trim_ar": "XE", "trim_en": "XE"},
          {"trim_ar": "SE", "trim_en": "SE"},
          {"trim_ar": "LE (تيتانيوم)", "trim_en": "LE (Titanium)"},
          {"trim_ar": "LE (بلاتينيوم)", "trim_en": "LE (Platinum)"}
        ]
      },
      {
        "model_ar": "إكس-تريل",
        "model_en": "X-Trail/Rogue",
        "trims": [
          {"trim_ar": "S", "trim_en": "S"},
          {"trim_ar": "SV", "trim_en": "SV"},
          {"trim_ar": "SL", "trim_en": "SL"}
        ]
      },
      {
        "model_ar": "كيكس",
        "model_en": "Kicks",
        "trims": [
          {"trim_ar": "S", "trim_en": "S"},
          {"trim_ar": "SV", "trim_en": "SV"},
          {"trim_ar": "SR", "trim_en": "SR"}
        ]
      }
    ]
  },
  {
    "brand_ar": "بورشه",
    "brand_en": "Porsche",
    "models": [
      {
        "model_ar": "911",
        "model_en": "911",
        "trims": [
          {"trim_ar": "كاريرا", "trim_en": "Carrera"},
          {"trim_ar": "كاريرا S", "trim_en": "Carrera S"},
          {"trim_ar": "كاريرا GTS", "trim_en": "Carrera GTS"},
          {"trim_ar": "GT3", "trim_en": "GT3"},
          {"trim_ar": "توربو", "trim_en": "Turbo"},
          {"trim_ar": "توربو S", "trim_en": "Turbo S"},
          {"trim_ar": "GT2 RS", "trim_en": "GT2 RS"},
          {"trim_ar": "كوبيه", "trim_en": "Coupe"},
          {"trim_ar": "كابريوليه", "trim_en": "Cabriolet"},
          {"trim_ar": "تارغا", "trim_en": "Targa"}
        ]
      },
      {
        "model_ar": "كايين",
        "model_en": "Cayenne",
        "trims": [
          {"trim_ar": "بيز", "trim_en": "Base"},
          {"trim_ar": "إي-هايبريد", "trim_en": "E-Hybrid"},
          {"trim_ar": "S", "trim_en": "S"},
          {"trim_ar": "GTS", "trim_en": "GTS"},
          {"trim_ar": "توربو", "trim_en": "Turbo"},
          {"trim_ar": "توربو إي-هايبريد", "trim_en": "Turbo E-Hybrid"},
          {"trim_ar": "توربو GT", "trim_en": "Turbo GT"},
          {"trim_ar": "SUV", "trim_en": "SUV"},
          {"trim_ar": "كوبيه", "trim_en": "Coupe"}
        ]
      },
      {
        "model_ar": "باناميرا",
        "model_en": "Panamera",
        "trims": [
          {"trim_ar": "بيز", "trim_en": "Base"},
          {"trim_ar": "إي-هايبريد", "trim_en": "E-Hybrid"},
          {"trim_ar": "S", "trim_en": "S"},
          {"trim_ar": "GTS", "trim_en": "GTS"},
          {"trim_ar": "توربو إي-هايبريد", "trim_en": "Turbo E-Hybrid"},
          {"trim_ar": "سيدان", "trim_en": "Sedan"},
          {"trim_ar": "سبورت توريزمو", "trim_en": "Sport Turismo"}
        ]
      },
      {
        "model_ar": "تايكان",
        "model_en": "Taycan",
        "trims": [
          {"trim_ar": "بيز", "trim_en": "Base"},
          {"trim_ar": "4S", "trim_en": "4S"},
          {"trim_ar": "GTS", "trim_en": "GTS"},
          {"trim_ar": "توربو", "trim_en": "Turbo"},
          {"trim_ar": "توربو S", "trim_en": "Turbo S"},
          {"trim_ar": "سيدان", "trim_en": "Sedan"},
          {"trim_ar": "كروس توريزمو", "trim_en": "Cross Turismo"},
          {"trim_ar": "سبورت توريزمو", "trim_en": "Sport Turismo"}
        ]
      }
    ]
  }
];

export async function importNewHierarchy() {
  const { db } = getDatabase();
  
  try {
    console.log("🔄 Starting hierarchy data replacement...");
    
    // Delete all existing data
    console.log("🗑️ Deleting existing trim levels...");
    await db.delete(vehicleTrimLevels);
    
    console.log("🗑️ Deleting existing vehicle categories...");
    await db.delete(vehicleCategories);
    
    console.log("🗑️ Deleting existing manufacturers...");
    await db.delete(manufacturers);
    
    console.log("✅ All existing data deleted successfully");
    
    let manufacturerIdCounter = 1;
    let categoryIdCounter = 1;
    let trimIdCounter = 1;
    
    // Import new data
    for (const brand of hierarchyData) {
      console.log(`📦 Importing brand: ${brand.brand_ar} (${brand.brand_en})`);
      
      // Insert manufacturer
      const [newManufacturer] = await db.insert(manufacturers).values({
        id: manufacturerIdCounter,
        nameAr: brand.brand_ar,
        nameEn: brand.brand_en,
        logo: null,
        isActive: true
      }).returning();
      
      console.log(`✅ Manufacturer inserted: ${newManufacturer.nameAr}`);
      
      // Insert models (categories)
      for (const model of brand.models) {
        console.log(`  📂 Importing model: ${model.model_ar} (${model.model_en})`);
        
        const [newCategory] = await db.insert(vehicleCategories).values({
          id: categoryIdCounter,
          manufacturerId: manufacturerIdCounter,
          nameAr: model.model_ar,
          nameEn: model.model_en,
          isActive: true
        }).returning();
        
        console.log(`  ✅ Category inserted: ${newCategory.nameAr}`);
        
        // Insert trims
        for (const trim of model.trims) {
          const [newTrim] = await db.insert(vehicleTrimLevels).values({
            id: trimIdCounter,
            categoryId: categoryIdCounter,
            nameAr: trim.trim_ar,
            nameEn: trim.trim_en,
            isActive: true
          }).returning();
          
          console.log(`    ✅ Trim inserted: ${newTrim.nameAr}`);
          trimIdCounter++;
        }
        
        categoryIdCounter++;
      }
      
      manufacturerIdCounter++;
    }
    
    console.log("🎉 Hierarchy data replacement completed successfully!");
    console.log(`📊 Total imported: ${manufacturerIdCounter - 1} manufacturers, ${categoryIdCounter - 1} categories, ${trimIdCounter - 1} trims`);
    
    return {
      success: true,
      counts: {
        manufacturers: manufacturerIdCounter - 1,
        categories: categoryIdCounter - 1,
        trims: trimIdCounter - 1
      }
    };
    
  } catch (error) {
    console.error("❌ Error importing hierarchy data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Run the import if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importNewHierarchy().then((result) => {
    if (result.success) {
      console.log("✅ Import completed successfully");
      process.exit(0);
    } else {
      console.error("❌ Import failed:", result.error);
      process.exit(1);
    }
  });
}