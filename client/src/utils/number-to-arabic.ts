// Function to convert numbers to Arabic text
export function numberToArabic(num: number): string {
  if (num === 0) return "صفر";
  
  const ones = [
    "", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة",
    "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر",
    "سبعة عشر", "ثمانية عشر", "تسعة عشر"
  ];
  
  const tens = [
    "", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"
  ];
  
  const hundreds = [
    "", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"
  ];
  
  const thousands = [
    "", "ألف", "ألفان", "ثلاثة آلاف", "أربعة آلاف", "خمسة آلاف", "ستة آلاف", "سبعة آلاف", "ثمانية آلاف", "تسعة آلاف"
  ];
  
  function convertHundreds(n: number): string {
    let result = "";
    
    if (n >= 100) {
      result += hundreds[Math.floor(n / 100)];
      n %= 100;
      if (n > 0) result += " ";
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)];
      n %= 10;
      if (n > 0) result += " ";
    }
    
    if (n > 0) {
      result += ones[n];
    }
    
    return result;
  }
  
  function convertThousands(n: number): string {
    if (n === 0) return "";
    
    let result = "";
    
    if (n >= 1000000) {
      const millions = Math.floor(n / 1000000);
      if (millions === 1) {
        result += "مليون";
      } else if (millions === 2) {
        result += "مليونان";
      } else if (millions < 11) {
        result += convertHundreds(millions) + " ملايين";
      } else {
        result += convertHundreds(millions) + " مليون";
      }
      n %= 1000000;
      if (n > 0) result += " ";
    }
    
    if (n >= 1000) {
      const thousandsDigit = Math.floor(n / 1000);
      if (thousandsDigit === 1) {
        result += "ألف";
      } else if (thousandsDigit === 2) {
        result += "ألفان";
      } else if (thousandsDigit < 11) {
        result += convertHundreds(thousandsDigit) + " آلاف";
      } else {
        result += convertHundreds(thousandsDigit) + " ألف";
      }
      n %= 1000;
      if (n > 0) result += " ";
    }
    
    if (n > 0) {
      result += convertHundreds(n);
    }
    
    return result;
  }
  
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  let result = convertThousands(integerPart);
  
  if (decimalPart > 0) {
    result += " و " + convertHundreds(decimalPart) + " قرش";
  }
  
  return result + " ريال";
}