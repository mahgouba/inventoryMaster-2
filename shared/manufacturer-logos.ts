// Manufacturer logo mappings
export const manufacturerLogos: Record<string, string> = {
  // Arabic manufacturer names mapped to logo files
  "مرسيدس": "/mercedes.svg",
  "بي ام دبليو": "/bmw.svg",
  "تويوتا": "/toyota.svg",
  "لكزس": "/lexus.svg",
  "نيسان": "/Nissan.svg",
  "إنفينيتي": "/infiniti.svg",
  "لاند روفر": "/landrover.svg",
  "جاكوار": "/jaguar.svg",
  "بنتلي": "/bentley-svgrepo-com.svg",
  "رولز رويس": "/Rolls-Royce.svg",
  "فيراري": "/ferrari.svg",
  "لامبورغيني": "/lamborghini.svg",
  "بوغاتي": "/bugatti.svg",
  "بورشه": "/porsche-svgrepo-com.svg",
  "تيسلا": "/tesla.svg",
  "فولكس فاغن": "/volkswagen.svg",
  "فورد": "/ford-mustang.svg",
  "لينكولن": "/lincoln.svg",
  "رام": "/ram.svg",
  "جي إم سي": "/gmc.svg",
  "مايباخ": "/maybach.svg",
  "لوتس": "/lotus.svg",
  "روكس": "/logos /ROX.svg",
  "كاديلاك": "/logos /Cadillac--Streamline-Simple-Icons.svg",
  
  // English names as fallback
  "Mercedes": "/mercedes.svg",
  "Lexus": "/lexus.svg", 
  "Nissan": "/Nissan.svg",
  "Toyota": "/toyota.svg",
  "BMW": "/bmw.svg",
  "Land Rover": "/landrover.svg",
  "Jaguar": "/jaguar.svg",
  "Bentley": "/bentley-svgrepo-com.svg",
  "Rolls-Royce": "/Rolls-Royce.svg",
  "Ferrari": "/ferrari.svg",
  "Lamborghini": "/lamborghini.svg",
  "Bugatti": "/bugatti.svg",
  "Porsche": "/porsche-svgrepo-com.svg",
  "Tesla": "/tesla.svg",
  "Volkswagen": "/volkswagen.svg",
  "Ford": "/ford-mustang.svg",
  "Lincoln": "/lincoln.svg",
  "Ram": "/ram.svg",
  "GMC": "/gmc.svg",
  "Maybach": "/maybach.svg",
  "Lotus": "/lotus.svg",
  "Infiniti": "/infiniti.svg",
  "ROX": "/logos /ROX.svg",
  "Cadillac": "/logos /Cadillac--Streamline-Simple-Icons.svg"
};

export function getManufacturerLogo(manufacturerName: string): string | null {
  return manufacturerLogos[manufacturerName] || null;
}

export function getAllManufacturerLogos(): typeof manufacturerLogos {
  return manufacturerLogos;
}