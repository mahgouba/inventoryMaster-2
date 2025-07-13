import { db } from "./db";
import { manufacturers, trimLevels } from "../shared/schema";

// Comprehensive trim levels data from the provided file
const trimLevelsData = [
  // BMW Group
  { manufacturer: "بي ام دبليو", category: "3 Series", trimLevel: "320i" },
  { manufacturer: "بي ام دبليو", category: "3 Series", trimLevel: "330i" },
  { manufacturer: "بي ام دبليو", category: "3 Series", trimLevel: "M340i" },
  { manufacturer: "بي ام دبليو", category: "5 Series", trimLevel: "520i" },
  { manufacturer: "بي ام دبليو", category: "5 Series", trimLevel: "530i" },
  { manufacturer: "بي ام دبليو", category: "5 Series", trimLevel: "M550i" },
  { manufacturer: "بي ام دبليو", category: "7 Series", trimLevel: "735i" },
  { manufacturer: "بي ام دبليو", category: "7 Series", trimLevel: "740i" },
  { manufacturer: "بي ام دبليو", category: "7 Series", trimLevel: "i7" },
  { manufacturer: "بي ام دبليو", category: "X5", trimLevel: "xDrive40i" },
  { manufacturer: "بي ام دبليو", category: "X5", trimLevel: "M60i" },
  { manufacturer: "بي ام دبليو", category: "X5", trimLevel: "M Competition" },

  // Rolls-Royce
  { manufacturer: "رولز رويز", category: "جوست", trimLevel: "Standard" },
  { manufacturer: "رولز رويز", category: "جوست", trimLevel: "Black Badge" },
  { manufacturer: "رولز رويز", category: "فانتوم", trimLevel: "Standard" },
  { manufacturer: "رولز رويز", category: "فانتوم", trimLevel: "Extended Wheelbase" },
  { manufacturer: "رولز رويز", category: "كولينان", trimLevel: "Standard" },
  { manufacturer: "رولز رويز", category: "كولينان", trimLevel: "Black Badge" },

  // Mercedes-Benz
  { manufacturer: "مرسيدس", category: "C-Class", trimLevel: "C200 Avantgarde" },
  { manufacturer: "مرسيدس", category: "C-Class", trimLevel: "C300 AMG Line" },
  { manufacturer: "مرسيدس", category: "E-Class", trimLevel: "E200" },
  { manufacturer: "مرسيدس", category: "E-Class", trimLevel: "E300" },
  { manufacturer: "مرسيدس", category: "S-Class", trimLevel: "S450" },
  { manufacturer: "مرسيدس", category: "S-Class", trimLevel: "S500" },
  { manufacturer: "مرسيدس", category: "S-Class", trimLevel: "S580 Maybach" },
  { manufacturer: "مرسيدس", category: "GLE", trimLevel: "GLE 450" },
  { manufacturer: "مرسيدس", category: "GLE", trimLevel: "GLE 53 AMG" },

  // Ferrari
  { manufacturer: "فيراري", category: "296", trimLevel: "GTB" },
  { manufacturer: "فيراري", category: "296", trimLevel: "GTS" },
  { manufacturer: "فيراري", category: "SF90", trimLevel: "Stradale" },
  { manufacturer: "فيراري", category: "SF90", trimLevel: "Spider" },
  { manufacturer: "فيراري", category: "روما", trimLevel: "Standard" },
  { manufacturer: "فيراري", category: "روما", trimLevel: "Spider" },
  { manufacturer: "فيراري", category: "بوروسانجوي", trimLevel: "Standard" },

  // Ford
  { manufacturer: "فورد", category: "تورس", trimLevel: "Ambiente" },
  { manufacturer: "فورد", category: "تورس", trimLevel: "Trend" },
  { manufacturer: "فورد", category: "تورس", trimLevel: "Titanium" },
  { manufacturer: "فورد", category: "إكسبلورر", trimLevel: "Base" },
  { manufacturer: "فورد", category: "إكسبلورر", trimLevel: "XLT" },
  { manufacturer: "فورد", category: "إكسبلورر", trimLevel: "ST-Line" },
  { manufacturer: "فورد", category: "إكسبلورر", trimLevel: "Limited" },
  { manufacturer: "فورد", category: "برونكو", trimLevel: "Big Bend" },
  { manufacturer: "فورد", category: "برونكو", trimLevel: "Outer Banks" },
  { manufacturer: "فورد", category: "برونكو", trimLevel: "Badlands" },
  { manufacturer: "فورد", category: "برونكو", trimLevel: "Raptor" },
  { manufacturer: "فورد", category: "F-150", trimLevel: "XL" },
  { manufacturer: "فورد", category: "F-150", trimLevel: "XLT" },
  { manufacturer: "فورد", category: "F-150", trimLevel: "Lariat" },
  { manufacturer: "فورد", category: "F-150", trimLevel: "Platinum" },
  { manufacturer: "فورد", category: "F-150", trimLevel: "Raptor" },

  // Chevrolet
  { manufacturer: "شيفروليه", category: "كابتيفا", trimLevel: "LS" },
  { manufacturer: "شيفروليه", category: "كابتيفا", trimLevel: "LT" },
  { manufacturer: "شيفروليه", category: "كابتيفا", trimLevel: "Premier" },
  { manufacturer: "شيفروليه", category: "تاهو", trimLevel: "LS" },
  { manufacturer: "شيفروليه", category: "تاهو", trimLevel: "LT" },
  { manufacturer: "شيفروليه", category: "تاهو", trimLevel: "Z71" },
  { manufacturer: "شيفروليه", category: "تاهو", trimLevel: "RST" },
  { manufacturer: "شيفروليه", category: "تاهو", trimLevel: "Premier" },
  { manufacturer: "شيفروليه", category: "سيلفرادو", trimLevel: "WT" },
  { manufacturer: "شيفروليه", category: "سيلفرادو", trimLevel: "LT" },
  { manufacturer: "شيفروليه", category: "سيلفرادو", trimLevel: "Trail Boss" },
  { manufacturer: "شيفروليه", category: "سيلفرادو", trimLevel: "LTZ" },
  { manufacturer: "شيفروليه", category: "سيلفرادو", trimLevel: "High Country" },

  // GMC
  { manufacturer: "جي إم سي", category: "تيرين", trimLevel: "SLE" },
  { manufacturer: "جي إم سي", category: "تيرين", trimLevel: "SLT" },
  { manufacturer: "جي إم سي", category: "تيرين", trimLevel: "AT4" },
  { manufacturer: "جي إم سي", category: "تيرين", trimLevel: "Denali" },
  { manufacturer: "جي إم سي", category: "أكاديا", trimLevel: "SLE" },
  { manufacturer: "جي إم سي", category: "أكاديا", trimLevel: "SLT" },
  { manufacturer: "جي إم سي", category: "أكاديا", trimLevel: "AT4" },
  { manufacturer: "جي إم سي", category: "أكاديا", trimLevel: "Denali" },
  { manufacturer: "جي إم سي", category: "يوكون", trimLevel: "SLE" },
  { manufacturer: "جي إم سي", category: "يوكون", trimLevel: "SLT" },
  { manufacturer: "جي إم سي", category: "يوكون", trimLevel: "AT4" },
  { manufacturer: "جي إم سي", category: "يوكون", trimLevel: "Denali" },
  { manufacturer: "جي إم سي", category: "سييرا", trimLevel: "SLE" },
  { manufacturer: "جي إم سي", category: "سييرا", trimLevel: "Elevation" },
  { manufacturer: "جي إم سي", category: "سييرا", trimLevel: "SLT" },
  { manufacturer: "جي إم سي", category: "سييرا", trimLevel: "AT4" },
  { manufacturer: "جي إم سي", category: "سييرا", trimLevel: "Denali" },

  // Honda
  { manufacturer: "هوندا", category: "سيفيك", trimLevel: "LX" },
  { manufacturer: "هوندا", category: "سيفيك", trimLevel: "Sport" },
  { manufacturer: "هوندا", category: "أكورد", trimLevel: "LX" },
  { manufacturer: "هوندا", category: "أكورد", trimLevel: "EX" },
  { manufacturer: "هوندا", category: "أكورد", trimLevel: "EX-L" },
  { manufacturer: "هوندا", category: "HR-V", trimLevel: "LX" },
  { manufacturer: "هوندا", category: "HR-V", trimLevel: "EX" },
  { manufacturer: "هوندا", category: "CR-V", trimLevel: "EX" },
  { manufacturer: "هوندا", category: "CR-V", trimLevel: "Touring" },

  // Hyundai
  { manufacturer: "هيونداي", category: "إلنترا", trimLevel: "Smart" },
  { manufacturer: "هيونداي", category: "إلنترا", trimLevel: "Comfort" },
  { manufacturer: "هيونداي", category: "إلنترا", trimLevel: "Premium" },
  { manufacturer: "هيونداي", category: "سوناتا", trimLevel: "Base" },
  { manufacturer: "هيونداي", category: "سوناتا", trimLevel: "Smart" },
  { manufacturer: "هيونداي", category: "سوناتا", trimLevel: "Comfort" },
  { manufacturer: "هيونداي", category: "سوناتا", trimLevel: "Premium" },
  { manufacturer: "هيونداي", category: "توسان", trimLevel: "Smart" },
  { manufacturer: "هيونداي", category: "توسان", trimLevel: "Comfort" },
  { manufacturer: "هيونداي", category: "توسان", trimLevel: "Premium" },
  { manufacturer: "هيونداي", category: "سنتافي", trimLevel: "Smart" },
  { manufacturer: "هيونداي", category: "سنتافي", trimLevel: "Comfort" },
  { manufacturer: "هيونداي", category: "سنتافي", trimLevel: "Premium" },
  { manufacturer: "هيونداي", category: "سنتافي", trimLevel: "Calligraphy" },
  { manufacturer: "هيونداي", category: "باليسيد", trimLevel: "Comfort" },
  { manufacturer: "هيونداي", category: "باليسيد", trimLevel: "Premium" },
  { manufacturer: "هيونداي", category: "باليسيد", trimLevel: "Calligraphy" },

  // Kia
  { manufacturer: "كيا", category: "سيراتو", trimLevel: "L" },
  { manufacturer: "كيا", category: "سيراتو", trimLevel: "LX" },
  { manufacturer: "كيا", category: "K5", trimLevel: "LX" },
  { manufacturer: "كيا", category: "K5", trimLevel: "EX" },
  { manufacturer: "كيا", category: "سبورتاج", trimLevel: "LX" },
  { manufacturer: "كيا", category: "سبورتاج", trimLevel: "EX" },
  { manufacturer: "كيا", category: "تيلورايد", trimLevel: "LX" },
  { manufacturer: "كيا", category: "تيلورايد", trimLevel: "EX" },
  { manufacturer: "كيا", category: "تيلورايد", trimLevel: "SX" },

  // Genesis
  { manufacturer: "جينيسيس", category: "G70", trimLevel: "Prestige" },
  { manufacturer: "جينيسيس", category: "G70", trimLevel: "Platinum" },
  { manufacturer: "جينيسيس", category: "G80", trimLevel: "Prestige" },
  { manufacturer: "جينيسيس", category: "G80", trimLevel: "Royal" },
  { manufacturer: "جينيسيس", category: "G90", trimLevel: "Prestige" },
  { manufacturer: "جينيسيس", category: "G90", trimLevel: "Royal" },
  { manufacturer: "جينيسيس", category: "GV70", trimLevel: "Prestige" },
  { manufacturer: "جينيسيس", category: "GV70", trimLevel: "Platinum" },
  { manufacturer: "جينيسيس", category: "GV80", trimLevel: "Prestige" },
  { manufacturer: "جينيسيس", category: "GV80", trimLevel: "Royal" },

  // Mazda
  { manufacturer: "مازدا", category: "Mazda6", trimLevel: "Core" },
  { manufacturer: "مازدا", category: "Mazda6", trimLevel: "High" },
  { manufacturer: "مازدا", category: "Mazda6", trimLevel: "High Plus" },
  { manufacturer: "مازدا", category: "CX-5", trimLevel: "Standard" },
  { manufacturer: "مازدا", category: "CX-5", trimLevel: "High" },
  { manufacturer: "مازدا", category: "CX-5", trimLevel: "High Plus" },
  { manufacturer: "مازدا", category: "CX-5", trimLevel: "Ignite" },
  { manufacturer: "مازدا", category: "CX-9", trimLevel: "Grade 1" },
  { manufacturer: "مازدا", category: "CX-9", trimLevel: "High" },
  { manufacturer: "مازدا", category: "CX-9", trimLevel: "Ignite" },

  // Nissan
  { manufacturer: "نيسان", category: "صني", trimLevel: "S" },
  { manufacturer: "نيسان", category: "صني", trimLevel: "SV" },
  { manufacturer: "نيسان", category: "صني", trimLevel: "SL" },
  { manufacturer: "نيسان", category: "ألتيما", trimLevel: "S" },
  { manufacturer: "نيسان", category: "ألتيما", trimLevel: "SV" },
  { manufacturer: "نيسان", category: "ألتيما", trimLevel: "SR" },
  { manufacturer: "نيسان", category: "ألتيما", trimLevel: "SL" },
  { manufacturer: "نيسان", category: "إكس-تريل", trimLevel: "S" },
  { manufacturer: "نيسان", category: "إكس-تريل", trimLevel: "SV" },
  { manufacturer: "نيسان", category: "إكس-تريل", trimLevel: "SL" },
  { manufacturer: "نيسان", category: "باترول", trimLevel: "XE" },
  { manufacturer: "نيسان", category: "باترول", trimLevel: "SE" },
  { manufacturer: "نيسان", category: "باترول", trimLevel: "LE" },
  { manufacturer: "نيسان", category: "باترول", trimLevel: "Titanium" },
  { manufacturer: "نيسان", category: "باترول", trimLevel: "Platinum City" },
  { manufacturer: "نيسان", category: "باترول", trimLevel: "Nismo" },

  // MG
  { manufacturer: "إم جي", category: "MG5", trimLevel: "STD" },
  { manufacturer: "إم جي", category: "MG5", trimLevel: "COM" },
  { manufacturer: "إم جي", category: "MG5", trimLevel: "DEL" },
  { manufacturer: "إم جي", category: "MG GT", trimLevel: "STD" },
  { manufacturer: "إم جي", category: "MG GT", trimLevel: "COM" },
  { manufacturer: "إم جي", category: "MG GT", trimLevel: "DEL" },
  { manufacturer: "إم جي", category: "RX5", trimLevel: "STD" },
  { manufacturer: "إم جي", category: "RX5", trimLevel: "COM" },
  { manufacturer: "إم جي", category: "RX5", trimLevel: "LUX" },
  { manufacturer: "إم جي", category: "HS", trimLevel: "COM" },
  { manufacturer: "إم جي", category: "HS", trimLevel: "LUX" },

  // Jeep
  { manufacturer: "جيب", category: "رانجلر", trimLevel: "Sport" },
  { manufacturer: "جيب", category: "رانجلر", trimLevel: "Sahara" },
  { manufacturer: "جيب", category: "رانجلر", trimLevel: "Rubicon" },
  { manufacturer: "جيب", category: "جراند شيروكي", trimLevel: "Laredo" },
  { manufacturer: "جيب", category: "جراند شيروكي", trimLevel: "Altitude" },
  { manufacturer: "جيب", category: "جراند شيروكي", trimLevel: "Limited" },
  { manufacturer: "جيب", category: "جراند شيروكي", trimLevel: "Overland" },
  { manufacturer: "جيب", category: "جراند شيروكي", trimLevel: "Summit Reserve" },
  { manufacturer: "جيب", category: "جراند واجونير", trimLevel: "Series I" },
  { manufacturer: "جيب", category: "جراند واجونير", trimLevel: "Series II" },
  { manufacturer: "جيب", category: "جراند واجونير", trimLevel: "Series III" },

  // Dodge
  { manufacturer: "دودج", category: "تشارجر", trimLevel: "GT" },
  { manufacturer: "دودج", category: "تشارجر", trimLevel: "R/T" },
  { manufacturer: "دودج", category: "تشارجر", trimLevel: "Scat Pack" },
  { manufacturer: "دودج", category: "تشارجر", trimLevel: "Hellcat" },
  { manufacturer: "دودج", category: "دورانجو", trimLevel: "SXT" },
  { manufacturer: "دودج", category: "دورانجو", trimLevel: "GT" },
  { manufacturer: "دودج", category: "دورانجو", trimLevel: "R/T" },
  { manufacturer: "دودج", category: "دورانجو", trimLevel: "Citadel" },

  // Maserati
  { manufacturer: "مازيراتي", category: "جيبلي", trimLevel: "GT" },
  { manufacturer: "مازيراتي", category: "جيبلي", trimLevel: "Modena" },
  { manufacturer: "مازيراتي", category: "جيبلي", trimLevel: "Trofeo" },
  { manufacturer: "مازيراتي", category: "ليفانتي", trimLevel: "GT" },
  { manufacturer: "مازيراتي", category: "ليفانتي", trimLevel: "Modena" },
  { manufacturer: "مازيراتي", category: "ليفانتي", trimLevel: "Trofeo" },
  { manufacturer: "مازيراتي", category: "جران توريزمو", trimLevel: "Modena" },
  { manufacturer: "مازيراتي", category: "جران توريزمو", trimLevel: "Trofeo" },

  // Land Rover
  { manufacturer: "لاند روفر", category: "ديفندر", trimLevel: "S" },
  { manufacturer: "لاند روفر", category: "ديفندر", trimLevel: "SE" },
  { manufacturer: "لاند روفر", category: "ديفندر", trimLevel: "HSE" },
  { manufacturer: "لاند روفر", category: "ديفندر", trimLevel: "X-Dynamic" },
  { manufacturer: "لاند روفر", category: "ديفندر", trimLevel: "X" },
  { manufacturer: "لاند روفر", category: "ديفندر", trimLevel: "V8" },
  { manufacturer: "لاند روفر", category: "رنج روفر سبورت", trimLevel: "SE" },
  { manufacturer: "لاند روفر", category: "رنج روفر سبورت", trimLevel: "Dynamic SE" },
  { manufacturer: "لاند روفر", category: "رنج روفر سبورت", trimLevel: "Dynamic HSE" },
  { manufacturer: "لاند روفر", category: "رنج روفر سبورت", trimLevel: "Autobiography" },
  { manufacturer: "لاند روفر", category: "رنج روفر", trimLevel: "SE" },
  { manufacturer: "لاند روفر", category: "رنج روفر", trimLevel: "HSE" },
  { manufacturer: "لاند روفر", category: "رنج روفر", trimLevel: "Autobiography" },
  { manufacturer: "لاند روفر", category: "رنج روفر", trimLevel: "SV" },
  { manufacturer: "لاند روفر", category: "فيلار", trimLevel: "S" },
  { manufacturer: "لاند روفر", category: "فيلار", trimLevel: "SE" },
  { manufacturer: "لاند روفر", category: "فيلار", trimLevel: "Dynamic SE" },
  { manufacturer: "لاند روفر", category: "فيلار", trimLevel: "Dynamic HSE" },

  // Toyota
  { manufacturer: "تويوتا", category: "يارس", trimLevel: "Y" },
  { manufacturer: "تويوتا", category: "يارس", trimLevel: "Y Plus" },
  { manufacturer: "تويوتا", category: "يارس", trimLevel: "YX" },
  { manufacturer: "تويوتا", category: "كورولا", trimLevel: "XLI" },
  { manufacturer: "تويوتا", category: "كورولا", trimLevel: "XLI Executive" },
  { manufacturer: "تويوتا", category: "كورولا", trimLevel: "GLI" },
  { manufacturer: "تويوتا", category: "كورولا", trimLevel: "GLI Hybrid" },
  { manufacturer: "تويوتا", category: "كامري", trimLevel: "LE" },
  { manufacturer: "تويوتا", category: "كامري", trimLevel: "GLE" },
  { manufacturer: "تويوتا", category: "كامري", trimLevel: "SE" },
  { manufacturer: "تويوتا", category: "كامري", trimLevel: "Grande" },
  { manufacturer: "تويوتا", category: "كامري", trimLevel: "Hybrid" },
  { manufacturer: "تويوتا", category: "راف فور", trimLevel: "LE" },
  { manufacturer: "تويوتا", category: "راف فور", trimLevel: "XLE" },
  { manufacturer: "تويوتا", category: "راف فور", trimLevel: "Adventure" },
  { manufacturer: "تويوتا", category: "راف فور", trimLevel: "LTD" },
  { manufacturer: "تويوتا", category: "راف فور", trimLevel: "Hybrid" },
  { manufacturer: "تويوتا", category: "هايلاندر", trimLevel: "LE" },
  { manufacturer: "تويوتا", category: "هايلاندر", trimLevel: "GLE" },
  { manufacturer: "تويوتا", category: "هايلاندر", trimLevel: "Limited" },
  { manufacturer: "تويوتا", category: "هايلاندر", trimLevel: "Hybrid" },
  { manufacturer: "تويوتا", category: "لاندكروزر", trimLevel: "GXR" },
  { manufacturer: "تويوتا", category: "لاندكروزر", trimLevel: "VX" },
  { manufacturer: "تويوتا", category: "لاندكروزر", trimLevel: "VXR" },
  { manufacturer: "تويوتا", category: "لاندكروزر", trimLevel: "GR-S" },
  { manufacturer: "تويوتا", category: "هايلكس", trimLevel: "GL" },
  { manufacturer: "تويوتا", category: "هايلكس", trimLevel: "GLX" },
  { manufacturer: "تويوتا", category: "هايلكس", trimLevel: "S-GLX" },
  { manufacturer: "تويوتا", category: "هايلكس", trimLevel: "GR Sport" },

  // Lexus
  { manufacturer: "لكزس", category: "IS", trimLevel: "IS300" },
  { manufacturer: "لكزس", category: "IS", trimLevel: "IS350 F-Sport" },
  { manufacturer: "لكزس", category: "ES", trimLevel: "ES250" },
  { manufacturer: "لكزس", category: "ES", trimLevel: "ES350" },
  { manufacturer: "لكزس", category: "ES", trimLevel: "ES300h" },
  { manufacturer: "لكزس", category: "LS", trimLevel: "LS350" },
  { manufacturer: "لكزس", category: "LS", trimLevel: "LS500h" },
  { manufacturer: "لكزس", category: "LX", trimLevel: "LX600" },
  { manufacturer: "لكزس", category: "LX", trimLevel: "LX600 VIP" },
  { manufacturer: "لكزس", category: "LX", trimLevel: "LX600 F-Sport" },

  // Volkswagen
  { manufacturer: "فولكس فاجن", category: "جيتا", trimLevel: "Trendline" },
  { manufacturer: "فولكس فاجن", category: "جيتا", trimLevel: "Comfortline" },
  { manufacturer: "فولكس فاجن", category: "جيتا", trimLevel: "Highline" },
  { manufacturer: "فولكس فاجن", category: "تيجوان", trimLevel: "Trendline" },
  { manufacturer: "فولكس فاجن", category: "تيجوان", trimLevel: "Life" },
  { manufacturer: "فولكس فاجن", category: "تيجوان", trimLevel: "Elegance" },
  { manufacturer: "فولكس فاجن", category: "تيجوان", trimLevel: "R-Line" },
  { manufacturer: "فولكس فاجن", category: "تيرامونت", trimLevel: "Trendline" },
  { manufacturer: "فولكس فاجن", category: "تيرامونت", trimLevel: "Comfortline" },
  { manufacturer: "فولكس فاجن", category: "تيرامونت", trimLevel: "Highline" },
  { manufacturer: "فولكس فاجن", category: "تيرامونت", trimLevel: "R-Line" },

  // Audi
  { manufacturer: "أودي", category: "A6", trimLevel: "40 TFSI" },
  { manufacturer: "أودي", category: "A6", trimLevel: "45 TFSI" },
  { manufacturer: "أودي", category: "A8", trimLevel: "55 TFSI" },
  { manufacturer: "أودي", category: "Q5", trimLevel: "S line" },
  { manufacturer: "أودي", category: "Q7", trimLevel: "S line" },
  { manufacturer: "أودي", category: "Q8", trimLevel: "S line" },
  { manufacturer: "أودي", category: "Q8", trimLevel: "RS Q8" },

  // Porsche
  { manufacturer: "بورش", category: "911", trimLevel: "Carrera" },
  { manufacturer: "بورش", category: "911", trimLevel: "Carrera S" },
  { manufacturer: "بورش", category: "911", trimLevel: "Carrera GTS" },
  { manufacturer: "بورش", category: "911", trimLevel: "Turbo" },
  { manufacturer: "بورش", category: "911", trimLevel: "Turbo S" },
  { manufacturer: "بورش", category: "911", trimLevel: "GT3" },
  { manufacturer: "بورش", category: "كايين", trimLevel: "Standard" },
  { manufacturer: "بورش", category: "كايين", trimLevel: "S" },
  { manufacturer: "بورش", category: "كايين", trimLevel: "GTS" },
  { manufacturer: "بورش", category: "كايين", trimLevel: "Turbo E-Hybrid" },
  { manufacturer: "بورش", category: "كايين", trimLevel: "Coupe" },
  { manufacturer: "بورش", category: "باناميرا", trimLevel: "Standard" },
  { manufacturer: "بورش", category: "باناميرا", trimLevel: "4" },
  { manufacturer: "بورش", category: "باناميرا", trimLevel: "Platinum Edition" },
  { manufacturer: "بورش", category: "باناميرا", trimLevel: "Turbo E-Hybrid" },

  // Bentley
  { manufacturer: "بنتلي", category: "كونتيننتال جي تي", trimLevel: "Standard" },
  { manufacturer: "بنتلي", category: "كونتيننتال جي تي", trimLevel: "S" },
  { manufacturer: "بنتلي", category: "كونتيننتال جي تي", trimLevel: "Azure" },
  { manufacturer: "بنتلي", category: "كونتيننتال جي تي", trimLevel: "Mulliner" },
  { manufacturer: "بنتلي", category: "فلاينج سبير", trimLevel: "Standard" },
  { manufacturer: "بنتلي", category: "فلاينج سبير", trimLevel: "S" },
  { manufacturer: "بنتلي", category: "فلاينج سبير", trimLevel: "Azure" },
  { manufacturer: "بنتلي", category: "فلاينج سبير", trimLevel: "Mulliner" },
  { manufacturer: "بنتلي", category: "بينتايجا", trimLevel: "Standard" },
  { manufacturer: "بنتلي", category: "بينتايجا", trimLevel: "S" },
  { manufacturer: "بنتلي", category: "بينتايجا", trimLevel: "Azure" },
  { manufacturer: "بنتلي", category: "بينتايجا", trimLevel: "EWB" },

  // Lamborghini
  { manufacturer: "لامبورجيني", category: "ريفويلتو", trimLevel: "Standard" },
  { manufacturer: "لامبورجيني", category: "هوراكان", trimLevel: "EVO" },
  { manufacturer: "لامبورجيني", category: "هوراكان", trimLevel: "STO" },
  { manufacturer: "لامبورجيني", category: "هوراكان", trimLevel: "Tecnica" },
  { manufacturer: "لامبورجيني", category: "أوروس", trimLevel: "S" },
  { manufacturer: "لامبورجيني", category: "أوروس", trimLevel: "Performante" },

  // Changan
  { manufacturer: "شانجان", category: "UNI-V", trimLevel: "Standard" },
  { manufacturer: "شانجان", category: "UNI-K", trimLevel: "Standard" },
  { manufacturer: "شانجان", category: "CS95", trimLevel: "Classic" },
  { manufacturer: "شانجان", category: "CS95", trimLevel: "Platinum" },
  { manufacturer: "شانجان", category: "CS95", trimLevel: "Royal" },

  // Haval
  { manufacturer: "هافال", category: "جوليان", trimLevel: "Basic" },
  { manufacturer: "هافال", category: "جوليان", trimLevel: "Active" },
  { manufacturer: "هافال", category: "جوليان", trimLevel: "Premium" },
  { manufacturer: "هافال", category: "H6", trimLevel: "Basic" },
  { manufacturer: "هافال", category: "H6", trimLevel: "Active" },
  { manufacturer: "هافال", category: "H6", trimLevel: "Premium" },
  { manufacturer: "هافال", category: "H6", trimLevel: "GT" },
  { manufacturer: "هافال", category: "دارجو", trimLevel: "Sport" },
  { manufacturer: "هافال", category: "دارجو", trimLevel: "Adventure" },
];

export async function seedComprehensiveTrimLevels() {
  console.log("Seeding comprehensive trim levels...");
  
  try {
    // Clear existing trim levels
    await db.delete(trimLevels);
    
    // Insert new trim levels
    await db.insert(trimLevels).values(trimLevelsData);
    
    console.log(`Successfully seeded ${trimLevelsData.length} trim levels.`);
  } catch (error) {
    console.error("Error seeding trim levels:", error);
  }
}

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedComprehensiveTrimLevels().then(() => {
    console.log("Comprehensive trim levels seeding completed.");
    process.exit(0);
  }).catch((error) => {
    console.error("Error during seeding:", error);
    process.exit(1);
  });
}