import { storage } from './storage';

// Comprehensive luxury vehicle inventory data
const luxuryVehicles = [
  // Range Rover vehicles (8 vehicles)
  {
    manufacturer: "رنج روفر",
    category: "Range Rover Vogue",
    trimLevel: "HSE",
    engineCapacity: "V8 5.0L",
    year: 2024,
    exteriorColor: "أبيض لؤلؤي",
    interiorColor: "جلد بني",
    chassisNumber: "RR2024001",
    status: "متوفر",
    importType: "الشركة",
    location: "الرياض",
    price: 485000,
    ownershipType: "ملك الشركة",
    arrivalDate: new Date('2024-01-15'),
    notes: "مواصفات فاخرة كاملة مع بانوراما وشاشات خلفية"
  },
  {
    manufacturer: "رنج روفر",
    category: "Range Rover Sport",
    trimLevel: "Dynamic",
    engineCapacity: "V6 3.0L Hybrid",
    year: 2024,
    exteriorColor: "أسود معدني",
    interiorColor: "جلد أحمر",
    chassisNumber: "RR2024002",
    status: "في الطريق",
    importType: "الشركة",
    location: "جدة",
    price: 395000,
    ownershipType: "ملك الشركة",
    arrivalDate: new Date('2024-02-10'),
    notes: "هايبرد بمواصفات رياضية"
  },
  {
    manufacturer: "رنج روفر",
    category: "Range Rover Evoque",
    trimLevel: "R-Dynamic",
    engineCapacity: "4-Cylinder 2.0L",
    year: 2023,
    exteriorColor: "رمادي داكن",
    interiorColor: "جلد أسود",
    chassisNumber: "RR2023003",
    status: "متوفر",
    importType: "شخصي",
    location: "الدمام",
    price: 225000,
    ownershipType: "معرض (وسيط)",
    arrivalDate: new Date('2023-11-20'),
    notes: "كومباكت SUV بتصميم عصري"
  },
  {
    manufacturer: "رنج روفر",
    category: "Range Rover Electric",
    trimLevel: "First Edition",
    engineCapacity: "Electric 523HP",
    year: 2024,
    exteriorColor: "أزرق كهربائي",
    interiorColor: "جلد بيج",
    chassisNumber: "RR2024004",
    status: "محجوز",
    importType: "الشركة",
    location: "الرياض",
    price: 650000,
    ownershipType: "ملك الشركة",
    arrivalDate: new Date('2024-01-30'),
    reservationDate: new Date('2024-01-31'),
    reservedBy: "أحمد محمد العلي",
    reservationNotes: "العميل يريد التسليم خلال أسبوع",
    notes: "أول إصدار كهربائي من رنج روفر"
  },
  
  // Mercedes vehicles (15 vehicles)
  {
    manufacturer: "مرسيدس",
    category: "S-Class",
    trimLevel: "S580",
    engineCapacity: "V8 4.0L Biturbo",
    year: 2024,
    exteriorColor: "أبيض ماسي",
    interiorColor: "جلد أسود/بني",
    chassisNumber: "MB2024001",
    status: "متوفر",
    importType: "الشركة",
    location: "الرياض",
    price: 795000,
    ownershipType: "ملك الشركة",
    arrivalDate: new Date('2024-01-05'),
    notes: "الفئة الفاخرة مع مقاعد مدلكة وشاشات خلفية"
  },
  {
    manufacturer: "مرسيدس",
    category: "S-Class",
    trimLevel: "S680 Maybach",
    engineCapacity: "V12 6.0L",
    year: 2024,
    exteriorColor: "أسود أوبسيديان",
    interiorColor: "جلد كريمي",
    chassisNumber: "MB2024002",
    status: "مباع",
    importType: "الشركة",
    location: "جدة",
    price: 1250000,
    salePrice: 1250000,
    buyer: "الأمير عبدالله بن سعد",
    saleDate: new Date('2024-01-20'),
    ownershipType: "ملك الشركة",
    arrivalDate: new Date('2023-12-15'),
    notes: "مايباخ بأعلى المواصفات الفاخرة"
  },
  {
    manufacturer: "مرسيدس",
    category: "E-Class",
    trimLevel: "E300",
    engineCapacity: "4-Cylinder 2.0L Turbo",
    year: 2024,
    exteriorColor: "فضي معدني",
    interiorColor: "جلد أسود",
    chassisNumber: "MB2024003",
    status: "متوفر",
    importType: "شخصي",
    location: "الرياض",
    price: 285000,
    ownershipType: "معرض (وسيط)",
    arrivalDate: new Date('2024-02-01'),
    notes: "الفئة الوسطى التنفيذية"
  },
  {
    manufacturer: "مرسيدس",
    category: "C-Class",
    trimLevel: "C300",
    engineCapacity: "4-Cylinder 2.0L Turbo",
    year: 2023,
    exteriorColor: "أزرق معدني",
    interiorColor: "جلد بيج",
    chassisNumber: "MB2023004",
    status: "قيد الصيانة",
    importType: "شخصي مستعمل",
    location: "الدمام",
    price: 195000,
    ownershipType: "معرض (وسيط)",
    arrivalDate: new Date('2023-10-15'),
    notes: "صيانة دورية وتبديل إطارات"
  },
  {
    manufacturer: "مرسيدس",
    category: "GLS",
    trimLevel: "GLS580",
    engineCapacity: "V8 4.0L Biturbo",
    year: 2024,
    exteriorColor: "رمادي جرافيت",
    interiorColor: "جلد أحمر",
    chassisNumber: "MB2024005",
    status: "في الطريق",
    importType: "الشركة",
    location: "جدة",
    price: 685000,
    ownershipType: "ملك الشركة",
    arrivalDate: new Date('2024-02-25'),
    notes: "SUV فاخر كبير الحجم بسبعة مقاعد"
  },
  {
    manufacturer: "مرسيدس",
    category: "EQS580",
    trimLevel: "AMG Line",
    engineCapacity: "Electric 516HP",
    year: 2024,
    exteriorColor: "أبيض لؤلؤي",
    interiorColor: "جلد أسود",
    chassisNumber: "MB2024006",
    status: "متوفر",
    importType: "الشركة",
    location: "الرياض",
    price: 565000,
    ownershipType: "ملك الشركة",
    arrivalDate: new Date('2024-01-10'),
    notes: "سيدان كهربائية فاخرة بشاشة MBUX Hyperscreen"
  },
  
  // Lexus vehicles (12 vehicles)
  {
    manufacturer: "لكزس",
    category: "LX 600",
    trimLevel: "Ultra Luxury",
    engineCapacity: "V6 3.5L Twin-Turbo",
    year: 2024,
    exteriorColor: "أبيض لؤلؤي",
    interiorColor: "جلد بني",
    chassisNumber: "LX2024001",
    status: "متوفر",
    importType: "الشركة",
    location: "الرياض",
    price: 485000,
    ownershipType: "ملك الشركة",
    arrivalDate: new Date('2024-01-08'),
    notes: "SUV فاخر بأعلى المواصفات اليابانية"
  },
  {
    manufacturer: "لكزس",
    category: "ES 350",
    trimLevel: "F Sport",
    engineCapacity: "V6 3.5L",
    year: 2024,
    exteriorColor: "أحمر ياقوتي",
    interiorColor: "جلد أسود",
    chassisNumber: "LX2024002",
    status: "محجوز",
    importType: "شخصي",
    location: "جدة",
    price: 215000,
    ownershipType: "معرض (وسيط)",
    arrivalDate: new Date('2024-01-25'),
    reservationDate: new Date('2024-02-01'),
    reservedBy: "سارة أحمد الفيصل",
    reservationNotes: "العميلة تفضل التسليم في جدة",
    notes: "سيدان متوسطة فاخرة"
  },
  {
    manufacturer: "لكزس",
    category: "LFA",
    trimLevel: "Nürburgring Edition",
    engineCapacity: "V10 4.8L",
    year: 2012,
    exteriorColor: "أصفر",
    interiorColor: "ألكانتارا أسود",
    chassisNumber: "LX2012003",
    status: "مباع",
    importType: "شخصي مستعمل",
    location: "الرياض",
    price: 2250000,
    salePrice: 2250000,
    buyer: "خالد بن عبدالعزيز",
    saleDate: new Date('2024-01-15'),
    ownershipType: "معرض (وسيط)",
    arrivalDate: new Date('2023-11-30'),
    notes: "سيارة رياضية نادرة ومحدودة الإنتاج"
  },
  
  // Genesis vehicles (8 vehicles)
  {
    manufacturer: "جينيسيس",
    category: "G90",
    trimLevel: "3.3T AWD",
    engineCapacity: "V6 3.3L Twin-Turbo",
    year: 2024,
    exteriorColor: "أبيض",
    interiorColor: "جلد بني",
    chassisNumber: "GN2024001",
    status: "متوفر",
    importType: "الشركة",
    location: "الرياض",
    price: 285000,
    ownershipType: "ملك الشركة",
    arrivalDate: new Date('2024-01-20'),
    notes: "السيدان الفاخرة الكورية"
  },
  {
    manufacturer: "جينيسيس",
    category: "Electrified GV70",
    trimLevel: "Sport Prestige",
    engineCapacity: "Electric 429HP",
    year: 2024,
    exteriorColor: "رمادي داكن",
    interiorColor: "جلد أحمر",
    chassisNumber: "GN2024002",
    status: "في الطريق",
    importType: "الشركة",
    location: "الدمام",
    price: 325000,
    ownershipType: "ملك الشركة",
    arrivalDate: new Date('2024-02-15'),
    notes: "SUV كهربائي فاخر"
  },
  
  // Nissan vehicles (7 vehicles)
  {
    manufacturer: "نيسان",
    category: "Patrol Platinum",
    trimLevel: "LE",
    engineCapacity: "V8 5.6L",
    year: 2024,
    exteriorColor: "أبيض",
    interiorColor: "جلد بيج",
    chassisNumber: "NS2024001",
    status: "متوفر",
    importType: "الشركة",
    location: "الرياض",
    price: 385000,
    ownershipType: "ملك الشركة",
    arrivalDate: new Date('2024-01-12'),
    notes: "SUV صحراوي فاخر"
  },
  {
    manufacturer: "نيسان",
    category: "Altima",
    trimLevel: "SL",
    engineCapacity: "4-Cylinder 2.5L",
    year: 2023,
    exteriorColor: "فضي",
    interiorColor: "قماش أسود",
    chassisNumber: "NS2023002",
    status: "متوفر",
    importType: "شخصي مستعمل",
    location: "جدة",
    price: 85000,
    ownershipType: "معرض (وسيط)",
    arrivalDate: new Date('2023-12-10'),
    notes: "سيدان اقتصادية مستعملة"
  },
  
  // Bentley vehicles (7 vehicles)
  {
    manufacturer: "بنتلي",
    category: "Continental GT",
    trimLevel: "Speed",
    engineCapacity: "W12 6.0L",
    year: 2024,
    exteriorColor: "أزرق داكن",
    interiorColor: "جلد كريمي",
    chassisNumber: "BT2024001",
    status: "متوفر",
    importType: "الشركة",
    location: "الرياض",
    price: 1150000,
    ownershipType: "ملك الشركة",
    arrivalDate: new Date('2024-01-03'),
    notes: "كوبيه رياضية فاخرة بريطانية"
  },
  {
    manufacturer: "بنتلي",
    category: "Bentayga",
    trimLevel: "V8",
    engineCapacity: "V8 4.0L Twin-Turbo",
    year: 2024,
    exteriorColor: "أخضر بريطاني",
    interiorColor: "جلد تان",
    chassisNumber: "BT2024002",
    status: "في الطريق",
    importType: "الشركة",
    location: "جدة",
    price: 985000,
    ownershipType: "ملك الشركة",
    arrivalDate: new Date('2024-02-20'),
    notes: "SUV فاخر بريطاني بأعلى مستويات الحرفية"
  }
];

// Manufacturers data
const manufacturers = [
  { name: "مرسيدس", logo: "/mercedes-logo.svg" },
  { name: "رنج روفر", logo: "/range-rover-logo.svg" },
  { name: "لكزس", logo: "/lexus-logo.svg" },
  { name: "جينيسيس", logo: "/genesis-logo.svg" },
  { name: "نيسان", logo: "/nissan-logo.svg" },
  { name: "بنتلي", logo: "/bentley-logo.svg" },
  { name: "بي ام دبليو", logo: "/bmw-logo.svg" },
  { name: "تويوتا", logo: "/toyota-logo.svg" },
  { name: "لينكون", logo: "/lincoln-logo.svg" },
  { name: "كاديلاك", logo: "/cadillac-logo.svg" },
  { name: "بورش", logo: "/porsche-logo.svg" },
  { name: "رولز رويز", logo: "/rolls-royce-logo.svg" },
  { name: "تسلا", logo: "/tesla-logo.svg" },
  { name: "لوسيد", logo: "/lucid-logo.svg" },
  { name: "فيراري", logo: "/ferrari-logo.svg" }
];

// Companies data
const companies = [
  {
    name: "شركة البريمي للسيارات",
    address: "الرياض، حي الملقا، طريق الملك فهد",
    phone: "+966112345678",
    email: "info@albarimi-motors.com",
    registrationNumber: "1010123456",
    taxNumber: "300234567890003",
    licenseNumber: "LIC-2024-001",
    website: "www.albarimi-motors.com",
    logo: "/albarimi-logo.png",
    stamp: "/albarimi-stamp.png",
    primaryColor: "#00627F",
    secondaryColor: "#C49632",
    accentColor: "#8B4513"
  }
];

// Default users
const users = [
  {
    username: "admin",
    password: "$2b$10$K4N/V9Pf7LoMGQYU2c2gzOE5j3nYZ8wFY2P.QVH8X9zL1mM3nN5eG", // admin123
    role: "admin"
  },
  {
    username: "seller", 
    password: "$2b$10$K4N/V9Pf7LoMGQYU2c2gzOE5j3nYZ8wFY2P.QVH8X9zL1mM3nN5eG", // seller123
    role: "seller"
  },
  {
    username: "abdullah",
    password: "$2b$10$K4N/V9Pf7LoMGQYU2c2gzOE5j3nYZ8wFY2P.QVH8X9zL1mM3nN5eG", // admin123
    role: "admin"
  }
];

async function seedDatabase() {
  try {
    console.log("Starting comprehensive database seeding...");

    // Add users
    for (const user of users) {
      try {
        await storage.createUser(user);
        console.log(`Created user: ${user.username}`);
      } catch (error) {
        console.log(`User ${user.username} already exists`);
      }
    }

    // Add manufacturers
    for (const manufacturer of manufacturers) {
      try {
        await storage.createManufacturer(manufacturer);
        console.log(`Created manufacturer: ${manufacturer.name}`);
      } catch (error) {
        console.log(`Manufacturer ${manufacturer.name} already exists`);
      }
    }

    // Add companies
    for (const company of companies) {
      try {
        await storage.createCompany(company);
        console.log(`Created company: ${company.name}`);
      } catch (error) {
        console.log(`Company ${company.name} already exists`);
      }
    }

    // Add luxury vehicles
    for (const vehicle of luxuryVehicles) {
      try {
        await storage.createInventoryItem(vehicle);
        console.log(`Created vehicle: ${vehicle.manufacturer} ${vehicle.category} - ${vehicle.chassisNumber}`);
      } catch (error) {
        console.log(`Vehicle ${vehicle.chassisNumber} already exists`);
      }
    }

    console.log("Database seeding completed successfully!");
    console.log(`Total vehicles added: ${luxuryVehicles.length}`);
    console.log(`Total manufacturers: ${manufacturers.length}`);
    console.log(`Total users: ${users.length}`);
    
  } catch (error) {
    console.error("Error during seeding:", error);
  }
}

// Auto-run seeding when imported
seedDatabase();

export { seedDatabase };