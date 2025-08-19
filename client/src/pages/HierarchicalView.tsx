import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDown, ChevronRight, Building2, Car, Settings, Search, Filter, Plus, Palette, Tag, Edit, Trash2, Save, X, Eye, EyeOff, Edit2, FileText, Image, Link, Upload, Download, GripVertical } from "lucide-react";
import * as XLSX from 'xlsx';
import * as Collapsible from "@radix-ui/react-collapsible";
// import { FreshImportButton } from "@/components/FreshImportButton"; // Removed per user request

interface Manufacturer {
  id: number;
  nameAr: string;
  nameEn?: string;
  logo?: string;
}

interface Category {
  id: number;
  manufacturer_id?: number;
  name_ar?: string;
  nameAr?: string;
  name_en?: string;
  nameEn?: string;
  category?: string;
}

interface Color {
  id: number;
  name: string;
  code?: string;
  type: 'exterior' | 'interior';
  vehicleCount: number;
}

interface TrimLevel {
  id: number;
  category_id: number;
  name_ar: string;
  name_en?: string;
  colors?: Color[];
}

interface HierarchyData {
  manufacturer: Manufacturer;
  categories: Array<{
    category: Category;
    trimLevels: TrimLevel[];
    vehicleCount: number;
  }>;
  totalVehicles: number;
}

interface VehicleSpecification {
  id?: number;
  manufacturer?: string;
  category?: string;
  trimLevel?: string;
  year?: number;
  chassisNumber?: string;
  engine?: string;
  specifications?: string;
  specificationsEn?: string;
}

interface VehicleImageLink {
  id?: number;
  manufacturer?: string;
  category?: string;
  trimLevel?: string;
  year?: number;
  exteriorColor?: string;
  interiorColor?: string;
  chassisNumber?: string;
  imageUrl: string;
  description?: string;
  descriptionEn?: string;
}

export default function HierarchicalView() {
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hiddenManufacturers, setHiddenManufacturers] = useState<Set<string>>(new Set());
  const [manufacturerOrder, setManufacturerOrder] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  
  // Dialog states
  const [isAddManufacturerOpen, setIsAddManufacturerOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddTrimLevelOpen, setIsAddTrimLevelOpen] = useState(false);
  const [isAddColorOpen, setIsAddColorOpen] = useState(false);
  const [isAddSpecificationOpen, setIsAddSpecificationOpen] = useState(false);
  const [isAddImageLinkOpen, setIsAddImageLinkOpen] = useState(false);
  
  // Color form states
  const [colorType, setColorType] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorNameEn, setColorNameEn] = useState("");
  const [colorCode, setColorCode] = useState("");
  const [colorManufacturer, setColorManufacturer] = useState("");
  const [colorCategory, setColorCategory] = useState("");
  const [colorTrimLevel, setColorTrimLevel] = useState("");
  const [isEditMode, setIsEditMode] = useState<{ type: string; id: number | string; data: any } | null>(null);
  
  // Form states
  const [manufacturerNameAr, setManufacturerNameAr] = useState("");
  const [manufacturerNameEn, setManufacturerNameEn] = useState("");
  const [manufacturerLogo, setManufacturerLogo] = useState("");
  
  const [newCategoryNameAr, setNewCategoryNameAr] = useState("");
  const [newCategoryNameEn, setNewCategoryNameEn] = useState("");
  const [selectedManufacturerForCategory, setSelectedManufacturerForCategory] = useState<number | null>(null);
  
  const [newTrimLevelNameAr, setNewTrimLevelNameAr] = useState("");
  const [newTrimLevelNameEn, setNewTrimLevelNameEn] = useState("");
  const [selectedCategoryForTrimLevel, setSelectedCategoryForTrimLevel] = useState<number | null>(null);

  // Specification form states
  const [specManufacturer, setSpecManufacturer] = useState("");
  const [specCategory, setSpecCategory] = useState("");
  const [specTrimLevel, setSpecTrimLevel] = useState("");
  const [specYear, setSpecYear] = useState("");
  const [specChassisNumber, setSpecChassisNumber] = useState("");
  const [specEngine, setSpecEngine] = useState("");

  const [specSpecifications, setSpecSpecifications] = useState("");
  const [specSpecificationsEn, setSpecSpecificationsEn] = useState("");

  // Excel import state
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Image link form states
  const [imageManufacturer, setImageManufacturer] = useState("");
  const [imageCategory, setImageCategory] = useState("");
  const [imageTrimLevel, setImageTrimLevel] = useState("");
  const [imageYear, setImageYear] = useState("");
  const [imageExteriorColor, setImageExteriorColor] = useState("");
  const [imageInteriorColor, setImageInteriorColor] = useState("");
  const [imageChassisNumber, setImageChassisNumber] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [imageDescriptionEn, setImageDescriptionEn] = useState("");

  // State for manage dialogs
  const [isManageSpecificationsOpen, setIsManageSpecificationsOpen] = useState(false);
  const [isManageImageLinksOpen, setIsManageImageLinksOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for saved vehicle specifications
  const { data: savedSpecifications = [] } = useQuery({
    queryKey: ['/api/vehicle-specifications'],
    enabled: isManageSpecificationsOpen
  });

  // Query for saved vehicle image links
  const { data: savedImageLinks = [] } = useQuery({
    queryKey: ['/api/vehicle-image-links'],
    enabled: isManageImageLinksOpen
  });

  // Excel import functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const processExcelFile = async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const result: any = {};
          
          // Process each sheet
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (sheetName.toLowerCase().includes('manufacturer') || sheetName.toLowerCase().includes('صناع')) {
              result.manufacturers = jsonData.slice(1).map((row: any) => ({
                nameAr: row[0],
                nameEn: row[1],
                logo: row[2] || ''
              })).filter((item: any) => item.nameAr);
            }
            
            if (sheetName.toLowerCase().includes('categor') || sheetName.toLowerCase().includes('فئات')) {
              result.categories = jsonData.slice(1).map((row: any) => ({
                manufacturer: row[0],
                nameAr: row[1],
                nameEn: row[2]
              })).filter((item: any) => item.nameAr && item.manufacturer);
            }
            
            if (sheetName.toLowerCase().includes('trim') || sheetName.toLowerCase().includes('تجهيز')) {
              result.trimLevels = jsonData.slice(1).map((row: any) => ({
                category: row[0],
                manufacturer: row[1],
                nameAr: row[2],
                nameEn: row[3]
              })).filter((item: any) => item.nameAr && item.category);
            }
            
            if (sheetName.toLowerCase().includes('color') || sheetName.toLowerCase().includes('لون')) {
              result.colors = jsonData.slice(1).map((row: any) => ({
                name: row[0],
                code: row[1] || '',
                type: row[2] === 'interior' || row[2] === 'داخلي' ? 'interior' : 'exterior'
              })).filter((item: any) => item.name);
            }
          });
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const importExcelData = async () => {
    if (!importFile) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف إكسل",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    
    try {
      const data: any = await processExcelFile(importFile);
      
      let successCount = 0;
      let skippedCount = 0;
      
      // Import manufacturers
      if (data.manufacturers?.length > 0) {
        for (const manufacturer of data.manufacturers) {
          try {
            await apiRequest('/api/manufacturers', 'POST', manufacturer);
            successCount++;
          } catch (error) {
            console.log(`Manufacturer ${manufacturer.nameAr} might already exist`);
            skippedCount++;
          }
        }
      }

      // Import categories
      if (data.categories?.length > 0) {
        for (const category of data.categories) {
          try {
            // Find manufacturer by name
            const manufacturerResponse = await fetch('/api/manufacturers');
            const manufacturers = await manufacturerResponse.json();
            const manufacturer = manufacturers.find((m: any) => 
              m.nameAr === category.manufacturer || m.nameEn === category.manufacturer
            );
            
            if (manufacturer) {
              await apiRequest('/api/categories', 'POST', {
                ...category,
                manufacturer_id: manufacturer.id
              });
              successCount++;
            }
          } catch (error) {
            console.log(`Category ${category.nameAr} might already exist`);
            skippedCount++;
          }
        }
      }

      // Import trim levels
      if (data.trimLevels?.length > 0) {
        for (const trimLevel of data.trimLevels) {
          try {
            // Find category by name and manufacturer
            const categoriesResponse = await fetch('/api/categories');
            const categories = await categoriesResponse.json();
            const category = categories.find((c: any) => 
              (c.nameAr === trimLevel.category || c.name_ar === trimLevel.category) &&
              (c.manufacturer?.nameAr === trimLevel.manufacturer || c.manufacturer?.nameEn === trimLevel.manufacturer)
            );
            
            if (category) {
              await apiRequest('/api/trim-levels', 'POST', {
                ...trimLevel,
                category_id: category.id
              });
              successCount++;
            }
          } catch (error) {
            console.log(`Trim level ${trimLevel.nameAr} might already exist`);
            skippedCount++;
          }
        }
      }

      // Import colors
      if (data.colors?.length > 0) {
        for (const color of data.colors) {
          try {
            await apiRequest('/api/colors', 'POST', color);
            successCount++;
          } catch (error) {
            console.log(`Color ${color.name} might already exist`);
            skippedCount++;
          }
        }
      }

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchical/manufacturers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/colors'] });

      toast({
        title: "اكتمل الاستيراد الشامل",
        description: `تم إضافة ${successCount} عنصر جديد، تم تخطي ${skippedCount} عنصر موجود مسبقاً`
      });

      setIsImportDialogOpen(false);
      setImportFile(null);
      
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "خطأ في الاستيراد",
        description: "حدث خطأ أثناء استيراد البيانات",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadExcelTemplate = () => {
    const workbook = XLSX.utils.book_new();

    // Manufacturers sheet
    const manufacturersData = [
      ['الاسم بالعربية', 'الاسم بالإنجليزية', 'اللوجو'],
      ['تويوتا', 'Toyota', 'https://example.com/toyota-logo.png'],
      ['مرسيدس', 'Mercedes-Benz', 'https://example.com/mercedes-logo.png'],
      ['بي ام دبليو', 'BMW', 'https://example.com/bmw-logo.png'],
      ['أودي', 'Audi', 'https://example.com/audi-logo.png'],
      ['لكزس', 'Lexus', 'https://example.com/lexus-logo.png'],
      ['نيسان', 'Nissan', 'https://example.com/nissan-logo.png']
    ];
    const manufacturersSheet = XLSX.utils.aoa_to_sheet(manufacturersData);
    XLSX.utils.book_append_sheet(workbook, manufacturersSheet, 'الصناع');

    // Categories sheet
    const categoriesData = [
      ['الصانع', 'الاسم بالعربية', 'الاسم بالإنجليزية'],
      ['تويوتا', 'كامري', 'Camry'],
      ['تويوتا', 'كورولا', 'Corolla'],
      ['تويوتا', 'راف فور', 'RAV4'],
      ['تويوتا', 'برادو', 'Prado'],
      ['مرسيدس', 'الفئة إي', 'E-Class'],
      ['مرسيدس', 'الفئة سي', 'C-Class'],
      ['مرسيدس', 'جي إل إي', 'GLE'],
      ['بي ام دبليو', 'الفئة الثالثة', '3 Series'],
      ['بي ام دبليو', 'الفئة الخامسة', '5 Series'],
      ['بي ام دبليو', 'إكس ثري', 'X3']
    ];
    const categoriesSheet = XLSX.utils.aoa_to_sheet(categoriesData);
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'الفئات');

    // Trim levels sheet
    const trimLevelsData = [
      ['الفئة', 'الصانع', 'الاسم بالعربية', 'الاسم بالإنجليزية'],
      ['كامري', 'تويوتا', 'جي إل إي', 'GLE'],
      ['كامري', 'تويوتا', 'إس إي', 'SE'],
      ['كامري', 'تويوتا', 'إل إي', 'LE'],
      ['كورولا', 'تويوتا', 'إل', 'L'],
      ['كورولا', 'تويوتا', 'إل إي', 'LE'],
      ['كورولا', 'تويوتا', 'إكس إل إي', 'XLE'],
      ['الفئة إي', 'مرسيدس', 'إي 200', 'E 200'],
      ['الفئة إي', 'مرسيدس', 'إي 300', 'E 300'],
      ['الفئة إي', 'مرسيدس', 'إي 450', 'E 450'],
      ['الفئة الثالثة', 'بي ام دبليو', '320i', '320i'],
      ['الفئة الثالثة', 'بي ام دبليو', '330i', '330i']
    ];
    const trimLevelsSheet = XLSX.utils.aoa_to_sheet(trimLevelsData);
    XLSX.utils.book_append_sheet(workbook, trimLevelsSheet, 'درجات التجهيز');

    // Colors sheet
    const colorsData = [
      ['الاسم', 'الرمز', 'النوع'],
      ['أبيض لؤلؤي', '#FFFFFF', 'exterior'],
      ['أسود معدني', '#000000', 'exterior'],
      ['أحمر كرزي', '#8B0000', 'exterior'],
      ['فضي معدني', '#C0C0C0', 'exterior'],
      ['أزرق داكن', '#003366', 'exterior'],
      ['ذهبي', '#FFD700', 'exterior'],
      ['رمادي جرافيت', '#36454F', 'exterior'],
      ['بيج فاتح', '#F5F5DC', 'interior'],
      ['أسود جلد', '#2F2F2F', 'interior'],
      ['بني جلد', '#8B4513', 'interior'],
      ['رمادي فاتح', '#D3D3D3', 'interior'],
      ['كريمي', '#FFFDD0', 'interior']
    ];
    const colorsSheet = XLSX.utils.aoa_to_sheet(colorsData);
    XLSX.utils.book_append_sheet(workbook, colorsSheet, 'الألوان');

    // Download the file
    XLSX.writeFile(workbook, 'hierarchy_template.xlsx');
  };

  // Comprehensive vehicle data to be added automatically
  const defaultVehicleData = [
    // Toyota
    {
      manufacturer: { nameAr: "تويوتا", nameEn: "Toyota" },
      categories: [
        { name_ar: "كامري", name_en: "Camry" },
        { name_ar: "كورولا", name_en: "Corolla" },
        { name_ar: "افالون", name_en: "Avalon" },
        { name_ar: "راف فور", name_en: "RAV4" },
        { name_ar: "هايلاندر", name_en: "Highlander" },
        { name_ar: "برادو", name_en: "Prado" },
        { name_ar: "لاند كروزر", name_en: "Land Cruiser" },
        { name_ar: "سيكويا", name_en: "Sequoia" },
        { name_ar: "تاكوما", name_en: "Tacoma" },
        { name_ar: "سيينا", name_en: "Sienna" }
      ]
    },
    // Mercedes-Benz
    {
      manufacturer: { nameAr: "مرسيدس", nameEn: "Mercedes-Benz" },
      categories: [
        { name_ar: "الفئة إي", name_en: "E-Class" },
        { name_ar: "الفئة سي", name_en: "C-Class" },
        { name_ar: "الفئة إس", name_en: "S-Class" },
        { name_ar: "الفئة إيه", name_en: "A-Class" },
        { name_ar: "سي إل إس", name_en: "CLS" },
        { name_ar: "جي إل إي", name_en: "GLE" },
        { name_ar: "جي إل إس", name_en: "GLS" },
        { name_ar: "جي إل سي", name_en: "GLC" },
        { name_ar: "جي إل إيه", name_en: "GLA" },
        { name_ar: "جي كلاس", name_en: "G-Class" }
      ]
    },
    // BMW
    {
      manufacturer: { nameAr: "بي ام دبليو", nameEn: "BMW" },
      categories: [
        { name_ar: "الفئة الثالثة", name_en: "3 Series" },
        { name_ar: "الفئة الخامسة", name_en: "5 Series" },
        { name_ar: "الفئة السابعة", name_en: "7 Series" },
        { name_ar: "إكس ون", name_en: "X1" },
        { name_ar: "إكس ثري", name_en: "X3" },
        { name_ar: "إكس فايف", name_en: "X5" },
        { name_ar: "إكس سفن", name_en: "X7" },
        { name_ar: "زي فور", name_en: "Z4" }
      ]
    },
    // Land Rover
    {
      manufacturer: { nameAr: "لاند روفر", nameEn: "Land Rover" },
      categories: [
        { name_ar: "رينج روفر", name_en: "Range Rover" },
        { name_ar: "رينج روفر سبورت", name_en: "Range Rover Sport" },
        { name_ar: "رينج روفر إيفوك", name_en: "Range Rover Evoque" },
        { name_ar: "ديسكفري", name_en: "Discovery" },
        { name_ar: "ديفندر", name_en: "Defender" }
      ]
    },
    // Rolls-Royce
    {
      manufacturer: { nameAr: "رولز رويس", nameEn: "Rolls-Royce" },
      categories: [
        { name_ar: "فانتوم", name_en: "Phantom" },
        { name_ar: "غوست", name_en: "Ghost" },
        { name_ar: "ريث", name_en: "Wraith" },
        { name_ar: "داون", name_en: "Dawn" },
        { name_ar: "كولينان", name_en: "Cullinan" }
      ]
    },
    // Bentley
    {
      manufacturer: { nameAr: "بنتلي", nameEn: "Bentley" },
      categories: [
        { name_ar: "كونتيننتال", name_en: "Continental" },
        { name_ar: "فلاينج سبير", name_en: "Flying Spur" },
        { name_ar: "بنتايجا", name_en: "Bentayga" }
      ]
    },
    // Lexus
    {
      manufacturer: { nameAr: "لكزس", nameEn: "Lexus" },
      categories: [
        { name_ar: "إي إس", name_en: "ES" },
        { name_ar: "آي إس", name_en: "IS" },
        { name_ar: "جي إس", name_en: "GS" },
        { name_ar: "إل إس", name_en: "LS" },
        { name_ar: "آر إكس", name_en: "RX" },
        { name_ar: "جي إكس", name_en: "GX" },
        { name_ar: "إل إكس", name_en: "LX" },
        { name_ar: "إن إكس", name_en: "NX" }
      ]
    },
    // Ferrari
    {
      manufacturer: { nameAr: "فيراري", nameEn: "Ferrari" },
      categories: [
        { name_ar: "488", name_en: "488" },
        { name_ar: "إف 8", name_en: "F8" },
        { name_ar: "إس إف 90", name_en: "SF90" },
        { name_ar: "روما", name_en: "Roma" },
        { name_ar: "بورتوفينو", name_en: "Portofino" },
        { name_ar: "812", name_en: "812" }
      ]
    },
    // Porsche
    {
      manufacturer: { nameAr: "بورش", nameEn: "Porsche" },
      categories: [
        { name_ar: "911", name_en: "911" },
        { name_ar: "كايين", name_en: "Cayenne" },
        { name_ar: "ماكان", name_en: "Macan" },
        { name_ar: "باناميرا", name_en: "Panamera" },
        { name_ar: "تايكان", name_en: "Taycan" },
        { name_ar: "718", name_en: "718" }
      ]
    },
    // Lamborghini
    {
      manufacturer: { nameAr: "لامبورجيني", nameEn: "Lamborghini" },
      categories: [
        { name_ar: "أفينتادور", name_en: "Aventador" },
        { name_ar: "هوراكان", name_en: "Huracan" },
        { name_ar: "أوروس", name_en: "Urus" }
      ]
    },
    // Tesla
    {
      manufacturer: { nameAr: "تسلا", nameEn: "Tesla" },
      categories: [
        { name_ar: "موديل إس", name_en: "Model S" },
        { name_ar: "موديل 3", name_en: "Model 3" },
        { name_ar: "موديل إكس", name_en: "Model X" },
        { name_ar: "موديل واي", name_en: "Model Y" }
      ]
    },
    // Ford
    {
      manufacturer: { nameAr: "فورد", nameEn: "Ford" },
      categories: [
        { name_ar: "فيوجن", name_en: "Fusion" },
        { name_ar: "إكسبلورر", name_en: "Explorer" },
        { name_ar: "إف 150", name_en: "F-150" },
        { name_ar: "موستانج", name_en: "Mustang" },
        { name_ar: "إسكيب", name_en: "Escape" }
      ]
    },
    // GMC
    {
      manufacturer: { nameAr: "جي إم سي", nameEn: "GMC" },
      categories: [
        { name_ar: "سييرا", name_en: "Sierra" },
        { name_ar: "أكاديا", name_en: "Acadia" },
        { name_ar: "تيرين", name_en: "Terrain" },
        { name_ar: "يوكون", name_en: "Yukon" }
      ]
    },
    // Chevrolet
    {
      manufacturer: { nameAr: "شيفروليه", nameEn: "Chevrolet" },
      categories: [
        { name_ar: "تاهو", name_en: "Tahoe" },
        { name_ar: "سوبربان", name_en: "Suburban" },
        { name_ar: "إكوينوكس", name_en: "Equinox" },
        { name_ar: "كامارو", name_en: "Camaro" }
      ]
    },
    // Dodge
    {
      manufacturer: { nameAr: "دودج", nameEn: "Dodge" },
      categories: [
        { name_ar: "تشالنجر", name_en: "Challenger" },
        { name_ar: "تشارجر", name_en: "Charger" },
        { name_ar: "دورانجو", name_en: "Durango" },
        { name_ar: "رام", name_en: "RAM" }
      ]
    },
    // Lincoln
    {
      manufacturer: { nameAr: "لينكولن", nameEn: "Lincoln" },
      categories: [
        { name_ar: "نافيجيتور", name_en: "Navigator" },
        { name_ar: "أفياتور", name_en: "Aviator" },
        { name_ar: "كورسير", name_en: "Corsair" },
        { name_ar: "إم كي زد", name_en: "MKZ" }
      ]
    },
    // Nissan
    {
      manufacturer: { nameAr: "نيسان", nameEn: "Nissan" },
      categories: [
        { name_ar: "ألتيما", name_en: "Altima" },
        { name_ar: "سنترا", name_en: "Sentra" },
        { name_ar: "باترول", name_en: "Patrol" },
        { name_ar: "أرمادا", name_en: "Armada" },
        { name_ar: "370 زد", name_en: "370Z" }
      ]
    },
    // Infiniti
    {
      manufacturer: { nameAr: "انفينيتي", nameEn: "Infiniti" },
      categories: [
        { name_ar: "كيو 50", name_en: "Q50" },
        { name_ar: "كيو 60", name_en: "Q60" },
        { name_ar: "كيو 70", name_en: "Q70" },
        { name_ar: "كيو إكس 50", name_en: "QX50" },
        { name_ar: "كيو إكس 60", name_en: "QX60" },
        { name_ar: "كيو إكس 80", name_en: "QX80" }
      ]
    }
  ];

  // Trim levels data
  const trimLevelsData = [
    { name_ar: "فل كامل", name_en: "Full Option" },
    { name_ar: "فل", name_en: "Full" },
    { name_ar: "ستاندرد", name_en: "Standard" },
    { name_ar: "بريميوم", name_en: "Premium" },
    { name_ar: "لوكس", name_en: "Luxury" },
    { name_ar: "سبورت", name_en: "Sport" },
    { name_ar: "إيه إم جي", name_en: "AMG" },
    { name_ar: "إم سبورت", name_en: "M Sport" },
    { name_ar: "إس لاين", name_en: "S-Line" },
    { name_ar: "إف سبورت", name_en: "F Sport" },
    { name_ar: "إتش إس إي", name_en: "HSE" },
    { name_ar: "أوتوبايوجرافي", name_en: "Autobiography" }
  ];

  // Colors data
  const colorsData = {
    exterior: [
      { name: "أبيض / White", code: "#FFFFFF" },
      { name: "أبيض لؤلؤي / Pearl White", code: "#F8F8FF" },
      { name: "أسود / Black", code: "#000000" },
      { name: "أسود معدني / Metallic Black", code: "#1C1C1C" },
      { name: "فضي / Silver", code: "#C0C0C0" },
      { name: "رمادي / Gray", code: "#808080" },
      { name: "رمادي معدني / Metallic Gray", code: "#696969" },
      { name: "أزرق / Blue", code: "#0066CC" },
      { name: "أزرق معدني / Metallic Blue", code: "#003366" },
      { name: "أحمر / Red", code: "#CC0000" },
      { name: "بني / Brown", code: "#8B4513" },
      { name: "بيج / Beige", code: "#F5F5DC" },
      { name: "ذهبي / Gold", code: "#FFD700" },
      { name: "برونزي / Bronze", code: "#CD7F32" },
      { name: "أخضر / Green", code: "#006600" }
    ],
    interior: [
      { name: "بيج / Beige", code: "#F5F5DC" },
      { name: "أسود / Black", code: "#000000" },
      { name: "بني / Brown", code: "#8B4513" },
      { name: "رمادي / Gray", code: "#808080" },
      { name: "كريمي / Cream", code: "#FFFDD0" },
      { name: "أبيض / White", code: "#FFFFFF" },
      { name: "أحمر / Red", code: "#8B0000" },
      { name: "أزرق / Blue", code: "#000080" }
    ]
  };

  // Auto-populate data mutation removed per user request

  // Fetch manufacturers
  const { data: manufacturers = [] } = useQuery({
    queryKey: ['/api/hierarchical/manufacturers'],
  });

  // Fetch hierarchy data
  const { data: hierarchyData = [], isLoading, error } = useQuery({
    queryKey: ['/api/hierarchy/full'],
  });

  // Auto-populate functionality removed per user request

  // Add color mutation for trim levels
  const addColorMutation = useMutation({
    mutationFn: async (data: { name: string; code: string; type: 'exterior' | 'interior'; trimLevelId: number }) => {
      return apiRequest('POST', '/api/hierarchical/colors', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تم إضافة اللون",
        description: "تم إضافة اللون بنجاح",
      });
    }
  });

  // Add manufacturer mutation
  const addManufacturerMutation = useMutation({
    mutationFn: async (data: { nameAr: string; nameEn?: string; logo?: string }) => {
      return apiRequest('POST', '/api/hierarchical/manufacturers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchical/manufacturers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تمت إضافة الصانع",
        description: `تم إضافة صانع "${manufacturerNameAr}" بنجاح`,
      });
      setManufacturerNameAr("");
      setManufacturerNameEn("");
      setManufacturerLogo("");
      setIsAddManufacturerOpen(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الصانع",
        variant: "destructive",
      });
    }
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (data: { name_ar: string; name_en?: string; manufacturer_id: number }) => {
      return apiRequest('POST', '/api/hierarchical/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تمت إضافة الفئة",
        description: `تم إضافة فئة "${newCategoryNameAr}" بنجاح`,
      });
      setNewCategoryNameAr("");
      setNewCategoryNameEn("");
      setSelectedManufacturerForCategory(null);
      setIsAddCategoryOpen(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الفئة",
        variant: "destructive",
      });
    }
  });

  // Add trim level mutation
  const addTrimLevelMutation = useMutation({
    mutationFn: async (data: { name_ar: string; name_en?: string; category_id: number }) => {
      return apiRequest('POST', '/api/hierarchical/trimLevels', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تمت إضافة درجة التجهيز",
        description: `تم إضافة درجة التجهيز "${newTrimLevelNameAr}" بنجاح`,
      });
      setNewTrimLevelNameAr("");
      setNewTrimLevelNameEn("");
      setSelectedCategoryForTrimLevel(null);
      setIsAddTrimLevelOpen(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة درجة التجهيز",
        variant: "destructive",
      });
    }
  });

  // Delete mutations
  const deleteManufacturerMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/hierarchical/manufacturers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchical/manufacturers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({ title: "تم حذف الصانع بنجاح" });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/hierarchical/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({ title: "تم حذف الفئة بنجاح" });
    }
  });

  const deleteTrimLevelMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/hierarchical/trimLevels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({ title: "تم حذف درجة التجهيز بنجاح" });
    }
  });

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Toggle manufacturer visibility mutation
  const toggleManufacturerVisibilityMutation = useMutation({
    mutationFn: async (manufacturer: Manufacturer) => {
      return apiRequest('PUT', `/api/manufacturers/${manufacturer.id}`, {
        nameAr: manufacturer.nameAr,
        nameEn: manufacturer.nameEn,
        logo: manufacturer.logo || null,
        isActive: !((manufacturer as any).isActive ?? true)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchical/manufacturers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث إعدادات الرؤية بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث إعدادات الرؤية",
        variant: "destructive",
      });
    }
  });

  const toggleManufacturerVisibility = (manufacturer: Manufacturer) => {
    toggleManufacturerVisibilityMutation.mutate(manufacturer);
  };

  const handleDragStart = (e: React.DragEvent, manufacturerId: string) => {
    setIsDragging(manufacturerId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', manufacturerId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(null);
  };

  const handleDrop = (e: React.DragEvent, targetManufacturerId: string) => {
    e.preventDefault();
    const draggedManufacturerId = e.dataTransfer.getData('text/plain');
    
    if (draggedManufacturerId !== targetManufacturerId) {
      // Update manufacturer order
      setManufacturerOrder(prev => {
        const newOrder = [...prev];
        const draggedIndex = newOrder.indexOf(draggedManufacturerId);
        const targetIndex = newOrder.indexOf(targetManufacturerId);
        
        if (draggedIndex > -1) {
          newOrder.splice(draggedIndex, 1);
        }
        if (targetIndex > -1) {
          newOrder.splice(targetIndex, 0, draggedManufacturerId);
        } else {
          newOrder.push(draggedManufacturerId);
        }
        
        return newOrder;
      });
    }
    setIsDragging(null);
  };

  // Sort and filter data with visibility and custom ordering
  const filteredData = Array.isArray(hierarchyData) ? hierarchyData
    .filter((item: HierarchyData) => {
      // Filter hidden manufacturers
      if (hiddenManufacturers.has(item.manufacturer?.id?.toString())) return false;
      
      // Apply search filter
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      const manufacturerMatch = item.manufacturer?.nameAr?.toLowerCase().includes(searchLower) || false;
      const categoryMatch = item.categories?.some(cat => 
        cat.category?.name_ar?.toLowerCase().includes(searchLower)
      ) || false;
      const trimMatch = item.categories?.some(cat =>
        cat.trimLevels?.some(trim => trim.name_ar?.toLowerCase().includes(searchLower))
      ) || false;
      
      return manufacturerMatch || categoryMatch || trimMatch;
    })
    .sort((a, b) => {
      // First, apply custom order if available
      const aOrder = manufacturerOrder.indexOf(a.manufacturer?.id?.toString());
      const bOrder = manufacturerOrder.indexOf(b.manufacturer?.id?.toString());
      
      if (aOrder !== -1 && bOrder !== -1) {
        return aOrder - bOrder;
      }
      if (aOrder !== -1) return -1;
      if (bOrder !== -1) return 1;
      
      // Then sort by vehicle count (highest first)
      return (b.totalVehicles || 0) - (a.totalVehicles || 0);
    }) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          جاري تحميل التسلسل الهرمي...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-white">
          <div className="text-red-400 text-lg mb-4">خطأ في تحميل البيانات</div>
          <p className="text-gray-400">حدث خطأ أثناء تحميل التسلسل الهرمي. يرجى المحاولة مرة أخرى.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="glass-header p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white text-right flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            التسلسل الهرمي للمركبات
          </h1>
          
          <div className="flex gap-2">
            {/* Excel Import Button */}
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="glass-button flex items-center gap-2">
                  <Upload size={16} />
                  استيراد من إكسل
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-modal max-w-lg" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">استيراد البيانات من ملف إكسل</DialogTitle>
                  <DialogDescription className="text-right">
                    استيراد شامل للصناع والفئات ودرجات التجهيز والألوان الداخلية والخارجية من ملف إكسل واحد
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 text-right mb-2">تنسيق الملف المطلوب:</h4>
                    <ul className="text-sm text-blue-700 text-right space-y-1">
                      <li>• ورقة "الصناع": الاسم العربي، الاسم الإنجليزي، رابط الشعار</li>
                      <li>• ورقة "الفئات": الصانع، الاسم العربي، الاسم الإنجليزي</li>
                      <li>• ورقة "درجات التجهيز": الفئة، الصانع، الاسم العربي، الاسم الإنجليزي</li>
                      <li>• ورقة "الألوان": الاسم، الرمز اللوني، النوع (exterior/interior)</li>
                    </ul>
                  </div>

                  <div>
                    <Label className="text-right block mb-2">اختر ملف الإكسل (.xlsx أو .xls)</Label>
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="mt-2"
                      dir="rtl"
                    />
                  </div>
                  
                  {importFile && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="text-sm text-green-800 text-right">
                        ✓ ملف محدد: {importFile.name}
                      </div>
                      <div className="text-xs text-green-600 text-right mt-1">
                        الحجم: {(importFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={downloadExcelTemplate}
                      variant="outline"
                      className="glass-button flex items-center gap-2 flex-1"
                    >
                      <Download size={16} />
                      تحميل النموذج الشامل
                    </Button>
                    
                    <Button
                      onClick={importExcelData}
                      disabled={!importFile || isImporting}
                      className="glass-button flex items-center gap-2 flex-1"
                    >
                      <Upload size={16} />
                      {isImporting ? 'جاري الاستيراد الشامل...' : 'استيراد جميع البيانات'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Manufacturer Button */}
            <Dialog open={isAddManufacturerOpen} onOpenChange={setIsAddManufacturerOpen}>
            <DialogTrigger asChild>
              <Button className="glass-button flex items-center gap-2">
                <Plus className="h-4 w-4" />
                إضافة صانع
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-modal" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">إضافة صانع جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-right block mb-2">الاسم العربي *</Label>
                  <Input
                    value={manufacturerNameAr}
                    onChange={(e) => setManufacturerNameAr(e.target.value)}
                    placeholder="اسم الصانع بالعربية"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label className="text-right block mb-2">الاسم الإنجليزي</Label>
                  <Input
                    value={manufacturerNameEn}
                    onChange={(e) => setManufacturerNameEn(e.target.value)}
                    placeholder="Manufacturer Name in English"
                  />
                </div>
                <div>
                  <Label className="text-right block mb-2">رابط الشعار</Label>
                  <Input
                    value={manufacturerLogo}
                    onChange={(e) => setManufacturerLogo(e.target.value)}
                    placeholder="/logo.png"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => addManufacturerMutation.mutate({
                      nameAr: manufacturerNameAr,
                      nameEn: manufacturerNameEn || undefined,
                      logo: manufacturerLogo || undefined
                    })}
                    disabled={!manufacturerNameAr || addManufacturerMutation.isPending}
                    className="glass-button flex-1"
                  >
                    <Save className="h-4 w-4 ml-2" />
                    {addManufacturerMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                  <Button
                    onClick={() => setIsAddManufacturerOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
        <p className="text-gray-300 text-right mt-2">
          عرض العلاقة الهرمية بين الصانعين والفئات ودرجات التجهيز مع إمكانيات الإضافة والتعديل والحذف
        </p>
      </div>

      {/* Filters */}
      <Card className="glass-container">
        <CardHeader className="glass-header">
          <CardTitle className="text-white text-right flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والفلاتر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث في الصانعين، الفئات، أو درجات التجهيز..."
                className="pr-10"
                dir="rtl"
              />
            </div>

            {/* Manufacturer Filter */}
            <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
              <SelectTrigger dir="rtl">
                <SelectValue placeholder="اختر الصانع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الصانعين</SelectItem>
                {Array.isArray(manufacturers) && manufacturers.map((manufacturer: Manufacturer) => (
                  <SelectItem key={manufacturer.id} value={manufacturer.nameAr}>
                    {manufacturer.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Show Hidden Manufacturers */}
            <Button
              variant="outline"
              onClick={() => {
                if (hiddenManufacturers.size > 0) {
                  setHiddenManufacturers(new Set());
                }
              }}
              disabled={hiddenManufacturers.size === 0}
              className="glass-button flex items-center gap-2"
            >
              <EyeOff className="h-4 w-4" />
              إظهار المخفيين ({hiddenManufacturers.size})
            </Button>
          </div>
          
          {/* Sort Information */}
          <div className="text-sm text-gray-400 text-right border-t border-white/10 pt-2">
            <p>🔹 الترتيب: حسب عدد المركبات (الأعلى أولاً) أو الترتيب المخصص</p>
            <p>🔹 اسحب الصناع بواسطة المقبض لإعادة الترتيب</p>
          </div>
        </CardContent>
      </Card>



      {/* Action Buttons */}
      <div className="flex gap-4 justify-center flex-wrap">
        {/* Add Specification Button */}
        <Dialog open={isAddSpecificationOpen} onOpenChange={setIsAddSpecificationOpen}>
          <DialogContent className="glass-modal max-w-2xl" dir="rtl">
            <DialogHeader className="flex flex-row items-center justify-between">
              <div className="flex-1">
                <DialogTitle className="text-right">إضافة مواصفات تفصيلية للسيارة</DialogTitle>
                <DialogDescription className="text-right text-gray-400">
                  إما كتابة رقم الهيكل مباشرة أو تحديد الصانع والفئة ودرجة التجهيز والسنة
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="glass-button"
                      onClick={() => setIsManageSpecificationsOpen(true)}
                    >
                      <Settings className="h-4 w-4 ml-1" />
                      إدارة البيانات المحفوظة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-modal max-w-4xl max-h-[80vh] overflow-hidden" dir="rtl">
                    <DialogHeader>
                      <DialogTitle className="text-right">إدارة المواصفات التفصيلية المحفوظة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 overflow-y-auto max-h-[60vh]">
                      {/* قائمة المواصفات المحفوظة */}
                      <div className="space-y-2">
                        <Label className="text-right block">المواصفات المحفوظة ({Array.isArray(savedSpecifications) ? savedSpecifications.length : 0}):</Label>
                        <div className="grid gap-3">
                          {!Array.isArray(savedSpecifications) || savedSpecifications.length === 0 ? (
                            <div className="glass-card p-6 border rounded-lg text-center text-gray-400">
                              لا توجد مواصفات محفوظة حتى الآن
                            </div>
                          ) : (
                            Array.isArray(savedSpecifications) && savedSpecifications.map((spec: any) => (
                              <div key={spec.id} className="glass-card p-4 border rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    {spec.chassisNumber && (
                                      <div className="text-sm text-gray-400 mb-1">رقم الهيكل: {spec.chassisNumber}</div>
                                    )}
                                    {spec.manufacturer && (
                                      <div className="text-sm text-gray-400 mb-1">
                                        {spec.manufacturer} - {spec.category} - {spec.trimLevel} ({spec.year})
                                      </div>
                                    )}
                                    {spec.specifications && (
                                      <div className="text-sm font-medium mb-1">{spec.specifications}</div>
                                    )}
                                    {spec.specificationsEn && (
                                      <div className="text-xs text-gray-500">{spec.specificationsEn}</div>
                                    )}
                                    <div className="text-xs text-gray-600 mt-2">
                                      تاريخ الإنشاء: {new Date(spec.createdAt).toLocaleDateString('ar-SA')}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={async () => {
                                        try {
                                          await apiRequest('DELETE', `/api/vehicle-specifications/${spec.id}`);
                                          queryClient.invalidateQueries({ queryKey: ['/api/vehicle-specifications'] });
                                          toast({ title: "تم حذف المواصفة بنجاح" });
                                        } catch (error) {
                                          toast({
                                            title: "خطأ",
                                            description: "فشل في حذف المواصفة",
                                            variant: "destructive",
                                          });
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-400" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chassis Number */}
                <div className="md:col-span-2">
                  <Label className="text-right block mb-2">رقم الهيكل (اختياري - للربط المباشر)</Label>
                  <Input
                    value={specChassisNumber}
                    onChange={(e) => {
                      setSpecChassisNumber(e.target.value);
                      if (e.target.value.trim()) {
                        // Reset other fields when chassis number is entered
                        setSpecManufacturer("");
                        setSpecCategory("");
                        setSpecTrimLevel("");
                        setSpecYear("");
                      }
                    }}
                    placeholder="VIN أو رقم الهيكل"
                    dir="rtl"
                  />
                </div>

                {/* Show other fields only if chassis number is empty */}
                {!specChassisNumber && (
                  <>
                    <div>
                      <Label className="text-right block mb-2">الصانع</Label>
                      <Select value={specManufacturer} onValueChange={setSpecManufacturer}>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر الصانع" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(manufacturers) && manufacturers.map((manufacturer: Manufacturer) => (
                            <SelectItem key={`spec-mfg-${manufacturer.id}`} value={manufacturer.nameAr}>
                              {manufacturer.nameAr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-right block mb-2">الفئة</Label>
                      <Select value={specCategory} onValueChange={setSpecCategory}>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Get categories for selected manufacturer */}
                          {specManufacturer && Array.isArray(hierarchyData) && hierarchyData
                            .filter((data: HierarchyData) => data.manufacturer.nameAr === specManufacturer)
                            .flatMap((data: HierarchyData) => data.categories)
                            .map((category: any) => (
                              <SelectItem key={category.category.id} value={category.category.nameAr || category.category.name_ar || ""}>
                                {category.category.nameAr || category.category.name_ar}
                              </SelectItem>
                            ))
                          }
                          {/* Common categories if no manufacturer selected */}
                          {!specManufacturer && [
                            "كامري", "كورولا", "افالون", "راف فور", "هايلاندر", "برادو", "لاند كروزر", "سيكويا",
                            "الفئة إي", "الفئة سي", "الفئة إس", "جي إل إي", "جي إل إس", "جي كلاس",
                            "الفئة الثالثة", "الفئة الخامسة", "الفئة السابعة", "إكس ثري", "إكس فايف", "إكس سفن",
                            "رينج روفر", "رينج روفر سبورت", "ديسكفري", "ديفندر"
                          ].map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-right block mb-2">درجة التجهيز</Label>
                      <Select value={specTrimLevel} onValueChange={setSpecTrimLevel}>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر درجة التجهيز" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Get trim levels for selected category and manufacturer */}
                          {specCategory && specManufacturer && Array.isArray(hierarchyData) && hierarchyData
                            .filter((data: HierarchyData) => data.manufacturer.nameAr === specManufacturer)
                            .flatMap((data: HierarchyData) => data.categories)
                            .filter((category: any) => (category.category.nameAr || category.category.name_ar) === specCategory)
                            .flatMap((category: any) => category.trimLevels || [])
                            .map((trim: any) => (
                              <SelectItem key={trim.id} value={trim.name_ar}>
                                {trim.name_ar}
                              </SelectItem>
                            ))
                          }
                          {/* Fallback trim levels if no specific ones found */}
                          {(!specCategory || !specManufacturer) && trimLevelsData.map(trim => (
                            <SelectItem key={trim.name_en} value={trim.name_ar}>
                              {trim.name_ar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-right block mb-2">السنة</Label>
                      <Select value={specYear} onValueChange={setSpecYear}>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر السنة" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Generate years from 2020 to 2026 */}
                          {Array.from({ length: 7 }, (_, i) => 2026 - i).map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Technical Specifications - إخفاء سعة المحرك عند إدخال رقم الهيكل */}
                {!specChassisNumber && (
                  <div>
                    <Label className="text-right block mb-2">سعة المحرك</Label>
                    <Select value={specEngine} onValueChange={setSpecEngine}>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر سعة المحرك" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.6L">1.6 لتر</SelectItem>
                        <SelectItem value="1.8L">1.8 لتر</SelectItem>
                        <SelectItem value="2.0L">2.0 لتر</SelectItem>
                        <SelectItem value="2.4L">2.4 لتر</SelectItem>
                        <SelectItem value="2.5L">2.5 لتر</SelectItem>
                        <SelectItem value="3.0L">3.0 لتر</SelectItem>
                        <SelectItem value="3.5L">3.5 لتر</SelectItem>
                        <SelectItem value="4.0L">4.0 لتر</SelectItem>
                        <SelectItem value="4.6L">4.6 لتر</SelectItem>
                        <SelectItem value="5.0L">5.0 لتر</SelectItem>
                        <SelectItem value="5.7L">5.7 لتر</SelectItem>
                        <SelectItem value="6.2L">6.2 لتر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Detailed Specifications */}
                <div className="md:col-span-2">
                  <Label className="text-right block mb-2">المواصفات التفصيلية (عربي)</Label>
                  <textarea
                    value={specSpecifications}
                    onChange={(e) => setSpecSpecifications(e.target.value)}
                    placeholder="اكتب المواصفات التفصيلية بالعربية..."
                    className="w-full h-24 p-3 border border-gray-600 rounded-lg bg-gray-800 text-white resize-none"
                    dir="rtl"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-right block mb-2">المواصفات التفصيلية (إنجليزي)</Label>
                  <textarea
                    value={specSpecificationsEn}
                    onChange={(e) => setSpecSpecificationsEn(e.target.value)}
                    placeholder="Enter detailed specifications in English..."
                    className="w-full h-24 p-3 border border-gray-600 rounded-lg bg-gray-800 text-white resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={async () => {
                    try {
                      const specData: VehicleSpecification = {
                        chassisNumber: specChassisNumber || undefined,
                        manufacturer: specManufacturer || undefined,
                        category: specCategory || undefined,
                        trimLevel: specTrimLevel || undefined,
                        year: specYear ? parseInt(specYear) : undefined,
                        engine: specEngine || undefined,
                        specifications: specSpecifications || undefined,
                        specificationsEn: specSpecificationsEn || undefined
                      };

                      await apiRequest('POST', '/api/vehicle-specifications', specData);
                      
                      toast({ title: "تم إضافة المواصفات بنجاح" });
                      
                      // Reset form
                      setSpecManufacturer("");
                      setSpecCategory("");
                      setSpecTrimLevel("");
                      setSpecYear("");
                      setSpecChassisNumber("");
                      setSpecEngine("");
                      setSpecSpecifications("");
                      setSpecSpecificationsEn("");
                      setIsAddSpecificationOpen(false);
                    } catch (error) {
                      toast({
                        title: "خطأ",
                        description: "فشل في إضافة المواصفات",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={!specChassisNumber && (!specManufacturer || !specCategory)}
                  className="glass-button flex-1"
                >
                  <Save className="h-4 w-4 ml-2" />
                  حفظ المواصفات
                </Button>
                <Button
                  onClick={() => setIsAddSpecificationOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Image Link Button */}
        <Dialog open={isAddImageLinkOpen} onOpenChange={setIsAddImageLinkOpen}>
          <DialogContent className="glass-modal max-w-2xl" dir="rtl">
            <DialogHeader className="flex flex-row items-center justify-between">
              <div className="flex-1">
                <DialogTitle className="text-right">إضافة رابط صورة للسيارة</DialogTitle>
                <DialogDescription className="text-right text-gray-400">
                  إما كتابة رقم الهيكل مباشرة أو تحديد الصانع والفئة ودرجة التجهيز والألوان
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="glass-button"
                      onClick={() => setIsManageImageLinksOpen(true)}
                    >
                      <Settings className="h-4 w-4 ml-1" />
                      إدارة البيانات المحفوظة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-modal max-w-4xl max-h-[80vh] overflow-hidden" dir="rtl">
                    <DialogHeader>
                      <DialogTitle className="text-right">إدارة روابط الصور المحفوظة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 overflow-y-auto max-h-[60vh]">
                      {/* قائمة روابط الصور المحفوظة */}
                      <div className="space-y-2">
                        <Label className="text-right block">روابط الصور المحفوظة ({Array.isArray(savedImageLinks) ? savedImageLinks.length : 0}):</Label>
                        <div className="grid gap-3">
                          {!Array.isArray(savedImageLinks) || savedImageLinks.length === 0 ? (
                            <div className="glass-card p-6 border rounded-lg text-center text-gray-400">
                              لا توجد روابط صور محفوظة حتى الآن
                            </div>
                          ) : (
                            Array.isArray(savedImageLinks) && savedImageLinks.map((link: any) => (
                              <div key={link.id} className="glass-card p-4 border rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    {link.chassisNumber && (
                                      <div className="text-sm text-gray-400 mb-1">رقم الهيكل: {link.chassisNumber}</div>
                                    )}
                                    {link.manufacturer && (
                                      <div className="text-sm text-gray-400 mb-1">
                                        {link.manufacturer} - {link.category} - {link.trimLevel} ({link.year})
                                      </div>
                                    )}
                                    {(link.exteriorColor || link.interiorColor) && (
                                      <div className="text-sm text-gray-400 mb-1">
                                        اللون الخارجي: {link.exteriorColor || 'غير محدد'} | اللون الداخلي: {link.interiorColor || 'غير محدد'}
                                      </div>
                                    )}
                                    <div className="text-sm font-medium mb-1 break-all">{link.imageUrl}</div>
                                    {link.description && (
                                      <div className="text-sm text-gray-300 mb-1">{link.description}</div>
                                    )}
                                    {link.descriptionEn && (
                                      <div className="text-xs text-gray-500 mb-1">{link.descriptionEn}</div>
                                    )}
                                    <div className="text-xs text-gray-600">
                                      تاريخ الإنشاء: {new Date(link.createdAt).toLocaleDateString('ar-SA')}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={async () => {
                                        try {
                                          await apiRequest('DELETE', `/api/vehicle-image-links/${link.id}`);
                                          queryClient.invalidateQueries({ queryKey: ['/api/vehicle-image-links'] });
                                          toast({ title: "تم حذف رابط الصورة بنجاح" });
                                        } catch (error) {
                                          toast({
                                            title: "خطأ",
                                            description: "فشل في حذف رابط الصورة",
                                            variant: "destructive",
                                          });
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-400" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chassis Number */}
                <div className="md:col-span-2">
                  <Label className="text-right block mb-2">رقم الهيكل (اختياري - للربط المباشر)</Label>
                  <Input
                    value={imageChassisNumber}
                    onChange={(e) => {
                      setImageChassisNumber(e.target.value);
                      if (e.target.value.trim()) {
                        // Reset other fields when chassis number is entered
                        setImageManufacturer("");
                        setImageCategory("");
                        setImageTrimLevel("");
                        setImageYear("");
                        setImageExteriorColor("");
                        setImageInteriorColor("");
                      }
                    }}
                    placeholder="VIN أو رقم الهيكل"
                    dir="rtl"
                  />
                </div>

                {/* Show other fields only if chassis number is empty */}
                {!imageChassisNumber && (
                  <>
                    <div>
                      <Label className="text-right block mb-2">الصانع</Label>
                      <Select value={imageManufacturer} onValueChange={setImageManufacturer}>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر الصانع" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(manufacturers) && manufacturers.map((manufacturer: Manufacturer) => (
                            <SelectItem key={`image-mfg-${manufacturer.id}`} value={manufacturer.nameAr}>
                              {manufacturer.nameAr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-right block mb-2">الفئة</Label>
                      <Select value={imageCategory} onValueChange={setImageCategory}>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Get categories for selected manufacturer */}
                          {imageManufacturer && Array.isArray(hierarchyData) && hierarchyData
                            .filter((data: HierarchyData) => data.manufacturer.nameAr === imageManufacturer)
                            .flatMap((data: HierarchyData) => data.categories)
                            .map((category: any) => (
                              <SelectItem key={category.category.id} value={category.category.nameAr || category.category.name_ar || ""}>
                                {category.category.nameAr || category.category.name_ar}
                              </SelectItem>
                            ))
                          }
                          {/* Common categories if no manufacturer selected */}
                          {!imageManufacturer && [
                            "كامري", "كورولا", "افالون", "راف فور", "هايلاندر", "برادو", "لاند كروزر", "سيكويا",
                            "الفئة إي", "الفئة سي", "الفئة إس", "جي إل إي", "جي إل إس", "جي كلاس",
                            "الفئة الثالثة", "الفئة الخامسة", "الفئة السابعة", "إكس ثري", "إكس فايف", "إكس سفن",
                            "رينج روفر", "رينج روفر سبورت", "ديسكفري", "ديفندر"
                          ].map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-right block mb-2">درجة التجهيز</Label>
                      <Select value={imageTrimLevel} onValueChange={setImageTrimLevel}>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر درجة التجهيز" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Get trim levels for selected category and manufacturer */}
                          {imageCategory && imageManufacturer && Array.isArray(hierarchyData) && hierarchyData
                            .filter((data: HierarchyData) => data.manufacturer.nameAr === imageManufacturer)
                            .flatMap((data: HierarchyData) => data.categories)
                            .filter((category: any) => (category.category.nameAr || category.category.name_ar) === imageCategory)
                            .flatMap((category: any) => category.trimLevels || [])
                            .map((trim: any) => (
                              <SelectItem key={trim.id} value={trim.name_ar}>
                                {trim.name_ar}
                              </SelectItem>
                            ))
                          }
                          {/* Fallback trim levels if no specific ones found */}
                          {(!imageCategory || !imageManufacturer) && trimLevelsData.map(trim => (
                            <SelectItem key={trim.name_en} value={trim.name_ar}>
                              {trim.name_ar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-right block mb-2">السنة</Label>
                      <Select value={imageYear} onValueChange={setImageYear}>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر السنة" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Generate years from 2020 to 2026 */}
                          {Array.from({ length: 7 }, (_, i) => 2026 - i).map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-right block mb-2">اللون الخارجي</Label>
                      <Select value={imageExteriorColor} onValueChange={setImageExteriorColor}>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر اللون الخارجي" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorsData.exterior.map(color => (
                            <SelectItem key={color.name} value={color.name.split(' / ')[0]}>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border" style={{backgroundColor: color.code}}></div>
                                {color.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-right block mb-2">اللون الداخلي</Label>
                      <Select value={imageInteriorColor} onValueChange={setImageInteriorColor}>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر اللون الداخلي" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorsData.interior.map(color => (
                            <SelectItem key={color.name} value={color.name.split(' / ')[0]}>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border" style={{backgroundColor: color.code}}></div>
                                {color.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Image URL */}
                <div className="md:col-span-2">
                  <Label className="text-right block mb-2">رابط الصورة *</Label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label className="text-right block mb-2">وصف الصورة (عربي)</Label>
                  <Input
                    value={imageDescription}
                    onChange={(e) => setImageDescription(e.target.value)}
                    placeholder="صورة جانبية للسيارة"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label className="text-right block mb-2">وصف الصورة (إنجليزي)</Label>
                  <Input
                    value={imageDescriptionEn}
                    onChange={(e) => setImageDescriptionEn(e.target.value)}
                    placeholder="Side view of the vehicle"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={async () => {
                    try {
                      const imageData: VehicleImageLink = {
                        chassisNumber: imageChassisNumber || undefined,
                        manufacturer: imageManufacturer || undefined,
                        category: imageCategory || undefined,
                        trimLevel: imageTrimLevel || undefined,
                        year: imageYear ? parseInt(imageYear) : undefined,
                        exteriorColor: imageExteriorColor || undefined,
                        interiorColor: imageInteriorColor || undefined,
                        imageUrl: imageUrl,
                        description: imageDescription || undefined,
                        descriptionEn: imageDescriptionEn || undefined
                      };

                      await apiRequest('POST', '/api/vehicle-image-links', imageData);
                      
                      toast({ title: "تم إضافة رابط الصورة بنجاح" });
                      
                      // Reset form
                      setImageManufacturer("");
                      setImageCategory("");
                      setImageTrimLevel("");
                      setImageYear("");
                      setImageExteriorColor("");
                      setImageInteriorColor("");
                      setImageChassisNumber("");
                      setImageUrl("");
                      setImageDescription("");
                      setImageDescriptionEn("");
                      setIsAddImageLinkOpen(false);
                    } catch (error) {
                      toast({
                        title: "خطأ",
                        description: "فشل في إضافة رابط الصورة",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={!imageUrl || (!imageChassisNumber && (!imageManufacturer || !imageCategory))}
                  className="glass-button flex-1"
                >
                  <Save className="h-4 w-4 ml-2" />
                  حفظ رابط الصورة
                </Button>
                <Button
                  onClick={() => setIsAddImageLinkOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Category Button */}
        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <DialogTrigger asChild>
            <Button className="glass-button flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة فئة
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-modal" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة فئة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-right block mb-2">الصانع *</Label>
                <Select value={selectedManufacturerForCategory ? selectedManufacturerForCategory.toString() : ""} onValueChange={(value) => setSelectedManufacturerForCategory(Number(value))}>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder="اختر الصانع" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(manufacturers) && manufacturers.filter(m => m.id && m.nameAr).map((manufacturer: Manufacturer) => (
                      <SelectItem key={`category-mfg-${manufacturer.id}`} value={manufacturer.id.toString()}>
                        {manufacturer.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-right block mb-2">اسم الفئة بالعربية *</Label>
                <Input
                  value={newCategoryNameAr}
                  onChange={(e) => setNewCategoryNameAr(e.target.value)}
                  placeholder="اسم الفئة"
                  dir="rtl"
                />
              </div>
              <div>
                <Label className="text-right block mb-2">اسم الفئة بالإنجليزية</Label>
                <Input
                  value={newCategoryNameEn}
                  onChange={(e) => setNewCategoryNameEn(e.target.value)}
                  placeholder="Category Name"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => addCategoryMutation.mutate({
                    name_ar: newCategoryNameAr,
                    name_en: newCategoryNameEn || undefined,
                    manufacturer_id: selectedManufacturerForCategory!
                  })}
                  disabled={!newCategoryNameAr || !selectedManufacturerForCategory || addCategoryMutation.isPending}
                  className="glass-button flex-1"
                >
                  <Save className="h-4 w-4 ml-2" />
                  {addCategoryMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
                <Button
                  onClick={() => setIsAddCategoryOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Trim Level Button */}
        <Dialog open={isAddTrimLevelOpen} onOpenChange={setIsAddTrimLevelOpen}>
          <DialogTrigger asChild>
            <Button className="glass-button flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة درجة تجهيز
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-modal" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة درجة تجهيز جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-right block mb-2">الفئة *</Label>
                <Select value={selectedCategoryForTrimLevel ? selectedCategoryForTrimLevel.toString() : ""} onValueChange={(value) => setSelectedCategoryForTrimLevel(Number(value))}>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(hierarchyData) && hierarchyData.flatMap((item: HierarchyData) => 
                      item.categories?.filter(catData => 
                        catData.category?.id && 
                        catData.category.id.toString().trim() !== '' &&
                        (catData.category?.name_ar || catData.category?.nameAr)
                      ).map(catData => (
                        <SelectItem key={catData.category.id} value={catData.category.id.toString()}>
                          {item.manufacturer.nameAr} - {catData.category.name_ar || catData.category.nameAr}
                        </SelectItem>
                      )) || []
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-right block mb-2">اسم درجة التجهيز بالعربية *</Label>
                <Input
                  value={newTrimLevelNameAr}
                  onChange={(e) => setNewTrimLevelNameAr(e.target.value)}
                  placeholder="درجة التجهيز"
                  dir="rtl"
                />
              </div>
              <div>
                <Label className="text-right block mb-2">اسم درجة التجهيز بالإنجليزية</Label>
                <Input
                  value={newTrimLevelNameEn}
                  onChange={(e) => setNewTrimLevelNameEn(e.target.value)}
                  placeholder="Trim Level Name"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => addTrimLevelMutation.mutate({
                    name_ar: newTrimLevelNameAr,
                    name_en: newTrimLevelNameEn || undefined,
                    category_id: selectedCategoryForTrimLevel!
                  })}
                  disabled={!newTrimLevelNameAr || !selectedCategoryForTrimLevel || addTrimLevelMutation.isPending}
                  className="glass-button flex-1"
                >
                  <Save className="h-4 w-4 ml-2" />
                  {addTrimLevelMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
                <Button
                  onClick={() => setIsAddTrimLevelOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Color Button */}
        <Dialog open={isAddColorOpen} onOpenChange={setIsAddColorOpen}>
          <DialogTrigger asChild>
            <Button className="glass-button flex items-center gap-2">
              <Palette className="h-4 w-4" />
              إضافة لون
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-modal" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة لون جديد</DialogTitle>
              <DialogDescription className="text-right">
                قم بإدخال تفاصيل اللون الجديد وحدد نطاق الربط (صانع، فئة، أو درجة تجهيز)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-right block mb-2">نوع اللون *</Label>
                  <Select value={colorType} onValueChange={setColorType}>
                    <SelectTrigger dir="rtl">
                      <SelectValue placeholder="اختر نوع اللون" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exterior">لون خارجي</SelectItem>
                      <SelectItem value="interior">لون داخلي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-right block mb-2">كود اللون</Label>
                  <div className="flex gap-2">
                    <Input
                      value={colorCode}
                      onChange={(e) => setColorCode(e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                    {colorCode && (
                      <div 
                        className="w-8 h-8 rounded border border-gray-300" 
                        style={{ backgroundColor: colorCode }}
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-right block mb-2">اسم اللون بالعربية *</Label>
                <Input
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="اسم اللون بالعربية"
                  dir="rtl"
                />
              </div>

              <div>
                <Label className="text-right block mb-2">اسم اللون بالإنجليزية</Label>
                <Input
                  value={colorNameEn}
                  onChange={(e) => setColorNameEn(e.target.value)}
                  placeholder="Color Name in English"
                  dir="ltr"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-right block text-sm font-medium">ربط اللون (اختياري - يمكن اختيار مستوى واحد أو أكثر)</Label>
                
                <div>
                  <Label className="text-right block mb-2 text-sm">الصانع</Label>
                  <Select value={colorManufacturer} onValueChange={setColorManufacturer}>
                    <SelectTrigger dir="rtl">
                      <SelectValue placeholder="اختر الصانع (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون تحديد صانع</SelectItem>
                      {Array.isArray(manufacturers) && manufacturers.filter(m => m.id && m.nameAr).map((manufacturer: Manufacturer) => (
                        <SelectItem key={`color-dialog-mfg-${manufacturer.id}`} value={manufacturer.id.toString()}>
                          {manufacturer.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-right block mb-2 text-sm">الفئة</Label>
                  <Select value={colorCategory} onValueChange={setColorCategory}>
                    <SelectTrigger dir="rtl">
                      <SelectValue placeholder="اختر الفئة (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون تحديد فئة</SelectItem>
                      {Array.isArray(hierarchyData) && hierarchyData.flatMap((item: HierarchyData) => 
                        item.categories?.filter(catData => catData.category?.id && catData.category?.name_ar).map(catData => (
                          <SelectItem key={`color-cat-${catData.category.id}`} value={catData.category.id.toString()}>
                            {item.manufacturer.nameAr} - {catData.category.name_ar}
                          </SelectItem>
                        )) || []
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-right block mb-2 text-sm">درجة التجهيز</Label>
                  <Select value={colorTrimLevel} onValueChange={setColorTrimLevel}>
                    <SelectTrigger dir="rtl">
                      <SelectValue placeholder="اختر درجة التجهيز (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون تحديد درجة تجهيز</SelectItem>
                      {Array.isArray(hierarchyData) && hierarchyData.flatMap((item: HierarchyData) => 
                        item.categories?.flatMap(catData => 
                          catData.trimLevels?.filter(trim => trim.id && trim.name_ar).map(trim => (
                            <SelectItem key={`color-trim-${trim.id}`} value={trim.id.toString()}>
                              {item.manufacturer.nameAr} - {catData.category.name_ar} - {trim.name_ar}
                            </SelectItem>
                          )) || []
                        ) || []
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={async () => {
                    try {
                      // تحديد البيانات المطلوبة للألوان
                      const manufacturerData = Array.isArray(manufacturers) ? 
                        manufacturers.find((m: any) => m.id === Number(colorManufacturer)) : null;
                      const categoryData = Array.isArray(hierarchyData) ? 
                        hierarchyData.find((h: any) => h.manufacturer?.id === Number(colorManufacturer))
                        ?.categories?.find((c: any) => c.category?.id === Number(colorCategory)) : null;
                      const trimLevelData = categoryData?.trimLevels?.find((t: any) => t.id === Number(colorTrimLevel));

                      const colorData = {
                        manufacturer: manufacturerData?.nameAr || "",
                        category: categoryData?.category?.nameAr || categoryData?.category?.name_ar || "",
                        trimLevel: trimLevelData?.name_ar || "",
                        colorType: colorType,
                        colorName: colorName,
                        colorNameEn: colorNameEn || "",
                        colorCode: colorCode || "#FFFFFF"
                      };
                      
                      console.log('Color data to save:', colorData);
                      
                      // إرسال البيانات إلى API
                      await apiRequest('POST', '/api/color-associations', colorData);
                      
                      // تحديث البيانات
                      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
                      
                      toast({
                        title: "تمت إضافة اللون",
                        description: `تم إضافة لون "${colorName}" بنجاح`,
                      });
                      
                      // إعادة تعيين النموذج
                      setColorType("");
                      setColorName("");
                      setColorNameEn("");
                      setColorCode("");
                      setColorManufacturer("");
                      setColorCategory("");
                      setColorTrimLevel("");
                      setIsAddColorOpen(false);
                    } catch (error) {
                      toast({
                        title: "خطأ",
                        description: "فشل في إضافة اللون",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={!colorName || !colorType}
                  className="glass-button flex-1"
                >
                  <Save className="h-4 w-4 ml-2" />
                  حفظ اللون
                </Button>
                <Button
                  onClick={() => {
                    setColorType("");
                    setColorName("");
                    setColorNameEn("");
                    setColorCode("");
                    setColorManufacturer("");
                    setColorCategory("");
                    setColorTrimLevel("");
                    setIsAddColorOpen(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hierarchy Display */}
      <div className="space-y-4">
        {filteredData.map((item: HierarchyData) => {
          // Safety check for item validity
          if (!item?.manufacturer?.id || !item?.manufacturer?.nameAr) {
            return null;
          }
          
          return (
          <Card 
            key={`manufacturer-${item.manufacturer.id}`} 
            className={`glass-container transition-all duration-200 ${
              isDragging === item.manufacturer.id?.toString() ? 'opacity-50 scale-95' : 'hover:shadow-lg'
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, item.manufacturer.id?.toString())}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, item.manufacturer.id?.toString())}
            onDragEnd={handleDragEnd}
          >
            <CardHeader className="glass-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Drag Handle */}
                  <div className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(`manufacturer-${item.manufacturer.id}`)}
                    className="text-white hover:bg-white/10"
                  >
                    {expandedItems.has(`manufacturer-${item.manufacturer.id}`) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <Building2 className="h-5 w-5 text-blue-400" />
                  <div className="text-right">
                    <h3 className="text-lg font-semibold text-white">{item.manufacturer.nameAr}</h3>
                    {item.manufacturer.nameEn && (
                      <p className="text-sm text-gray-400">{item.manufacturer.nameEn}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="glass-badge">
                    {item.totalVehicles} مركبة
                  </Badge>
                  <Badge variant="outline" className="glass-badge">
                    {item.categories.length} فئة
                  </Badge>
                  
                  {/* Manufacturer Actions */}
                  <div className="flex gap-1">
                    {/* Visibility Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleManufacturerVisibility(item.manufacturer)}
                      className={`hover:bg-gray-700/50 ${((item.manufacturer as any).isActive === false) ? 'text-red-400' : 'text-green-400'}`}
                      title={((item.manufacturer as any).isActive === false) ? "إظهار الصانع في القوائم المنسدلة" : "إخفاء الصانع من القوائم المنسدلة"}
                      disabled={toggleManufacturerVisibilityMutation.isPending}
                    >
                      {((item.manufacturer as any).isActive === false) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditMode({ type: 'manufacturer', id: item.manufacturer.id, data: item.manufacturer })}
                      className="text-yellow-400 hover:bg-yellow-400/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteManufacturerMutation.mutate(item.manufacturer?.id ? item.manufacturer.id.toString() : "")}
                      className="text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            {/* Categories */}
            <Collapsible.Root open={expandedItems.has(`manufacturer-${item.manufacturer.id}`)}>
              <Collapsible.Content>
                <CardContent className="pt-0">
                  <div className="space-y-3 mr-8">
                    {item.categories.map((catData) => (
                      <div key={catData.category.id} className="glass-section p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(`category-${catData.category.id}`)}
                              className="text-white hover:bg-white/10"
                            >
                              {expandedItems.has(`category-${catData.category.id}`) ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </Button>
                            <Car className="h-4 w-4 text-green-400" />
                            <div className="text-right">
                              <h4 className="font-medium text-white">{catData.category.name_ar || catData.category.nameAr}</h4>
                              {(catData.category.name_en || catData.category.nameEn) && (
                                <p className="text-xs text-gray-400">{catData.category.name_en || catData.category.nameEn}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="glass-badge text-xs">
                              {catData.vehicleCount} مركبة
                            </Badge>
                            <Badge variant="outline" className="glass-badge text-xs">
                              {catData.trimLevels.length} درجة
                            </Badge>
                            
                            {/* Category Actions */}
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditMode({ type: 'category', id: catData.category.id, data: catData.category })}
                                className="text-yellow-400 hover:bg-yellow-400/10"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCategoryMutation.mutate(catData.category.id)}
                                className="text-red-400 hover:bg-red-400/10"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Trim Levels */}
                        <Collapsible.Root open={expandedItems.has(`category-${catData.category.id}`)}>
                          <Collapsible.Content>
                            <div className="space-y-2 mr-6">
                              {catData.trimLevels.map((trimLevel) => (
                                <div key={trimLevel.id} className="glass-item rounded">
                                  {/* Trim Level Header */}
                                  <div className="flex items-center justify-between p-2">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleExpanded(`trim-${trimLevel.id}`)}
                                        className="text-white hover:bg-white/10 p-1"
                                      >
                                        {expandedItems.has(`trim-${trimLevel.id}`) ? (
                                          <ChevronDown className="h-3 w-3" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3" />
                                        )}
                                      </Button>
                                      <Settings className="h-3 w-3 text-purple-400" />
                                      <div className="text-right">
                                        <span className="text-sm text-white">{trimLevel.name_ar}</span>
                                        {trimLevel.name_en && (
                                          <span className="text-xs text-gray-400 block">{trimLevel.name_en}</span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      {trimLevel.colors && trimLevel.colors.length > 0 && (
                                        <Badge variant="outline" className="glass-badge text-xs">
                                          {trimLevel.colors.length} لون
                                        </Badge>
                                      )}
                                      
                                      {/* Trim Level Actions */}
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setIsEditMode({ type: 'trimLevel', id: trimLevel.id, data: trimLevel })}
                                          className="text-yellow-400 hover:bg-yellow-400/10"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => deleteTrimLevelMutation.mutate(trimLevel.id)}
                                          className="text-red-400 hover:bg-red-400/10"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Colors under Trim Level */}
                                  <Collapsible.Root open={expandedItems.has(`trim-${trimLevel.id}`)}>
                                    <Collapsible.Content>
                                      <div className="space-y-2 mr-6 mt-2">
                                        <div className="p-2 bg-black/20 rounded">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <h6 className="text-xs font-medium text-gray-300 mb-2">الألوان الخارجية</h6>
                                              <div className="space-y-1">
                                                {colorsData.exterior.slice(0, 5).map((color, index) => (
                                                  <div key={`ext-${index}`} className="flex items-center gap-2">
                                                    <div 
                                                      className="w-3 h-3 rounded-full border border-gray-400"
                                                      style={{ backgroundColor: color.code }}
                                                    ></div>
                                                    <span className="text-xs text-white">{color.name.split(' / ')[0]}</span>
                                                  </div>
                                                ))}
                                                {colorsData.exterior.length > 5 && (
                                                  <span className="text-xs text-gray-400">+{colorsData.exterior.length - 5} لون آخر</span>
                                                )}
                                              </div>
                                            </div>
                                            <div>
                                              <h6 className="text-xs font-medium text-gray-300 mb-2">الألوان الداخلية</h6>
                                              <div className="space-y-1">
                                                {colorsData.interior.slice(0, 4).map((color, index) => (
                                                  <div key={`int-${index}`} className="flex items-center gap-2">
                                                    <div 
                                                      className="w-3 h-3 rounded-full border border-gray-400"
                                                      style={{ backgroundColor: color.code }}
                                                    ></div>
                                                    <span className="text-xs text-white">{color.name.split(' / ')[0]}</span>
                                                  </div>
                                                ))}
                                                {colorsData.interior.length > 4 && (
                                                  <span className="text-xs text-gray-400">+{colorsData.interior.length - 4} لون آخر</span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </Collapsible.Content>
                                  </Collapsible.Root>
                                  
                                  {/* Colors under Trim Level */}
                                  <Collapsible.Root open={expandedItems.has(`trim-${trimLevel.id}`)}>
                                    <Collapsible.Content>
                                      {trimLevel.colors && trimLevel.colors.length > 0 && (
                                        <div className="px-4 pb-2 mr-6">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                            {trimLevel.colors.map((color) => (
                                              <div key={color.id} className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/10">
                                                <div className="flex items-center gap-2">
                                                  <Palette className="h-3 w-3 text-yellow-400" />
                                                  <div className="flex items-center gap-2">
                                                    {color.code && (
                                                      <div 
                                                        className="w-4 h-4 rounded-full border border-white/30"
                                                        style={{ backgroundColor: color.code }}
                                                      />
                                                    )}
                                                    <div className="text-right">
                                                      <span className="text-xs text-white">{color.name}</span>
                                                      <div className="flex items-center gap-1">
                                                        <Badge 
                                                          variant="outline" 
                                                          className={`text-xs ${
                                                            color.type === 'exterior' 
                                                              ? 'border-blue-400 text-blue-400' 
                                                              : 'border-orange-400 text-orange-400'
                                                          }`}
                                                        >
                                                          {color.type === 'exterior' ? 'خارجي' : 'داخلي'}
                                                        </Badge>
                                                        {color.vehicleCount > 0 && (
                                                          <Badge variant="secondary" className="text-xs">
                                                            {color.vehicleCount} مركبة
                                                          </Badge>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Color Actions */}
                                                <div className="flex gap-1">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsEditMode({ type: 'color', id: color.id, data: color })}
                                                    className="text-yellow-400 hover:bg-yellow-400/10 p-1"
                                                  >
                                                    <Edit className="h-3 w-3" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={async () => {
                                                      if (confirm("هل أنت متأكد من حذف هذا اللون؟")) {
                                                        try {
                                                          await apiRequest('DELETE', `/api/color-associations/${color.id}`);
                                                          queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
                                                          toast({ title: "تم حذف اللون بنجاح" });
                                                        } catch (error) {
                                                          toast({
                                                            title: "خطأ",
                                                            description: "فشل في حذف اللون",
                                                            variant: "destructive",
                                                          });
                                                        }
                                                      }
                                                    }}
                                                    className="text-red-400 hover:bg-red-400/10 p-1"
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </Collapsible.Content>
                                  </Collapsible.Root>
                                </div>
                              ))}
                            </div>
                          </Collapsible.Content>
                        </Collapsible.Root>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Collapsible.Content>
            </Collapsible.Root>
          </Card>
          );
        })}
      </div>

      {filteredData.length === 0 && (
        <Card className="glass-container">
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">لا توجد بيانات</h3>
            <p className="text-gray-400">لا توجد بيانات هرمية متطابقة مع البحث الحالي</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Mode Dialog */}
      {isEditMode && (
        <Dialog open={true} onOpenChange={() => setIsEditMode(null)}>
          <DialogContent className="glass-modal" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">
                تعديل {isEditMode.type === 'manufacturer' ? 'الصانع' : 
                       isEditMode.type === 'category' ? 'الفئة' : 'درجة التجهيز'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {isEditMode.type === 'manufacturer' && (
                <>
                  <div>
                    <Label className="text-right block mb-2">اسم الصانع بالعربية *</Label>
                    <Input
                      value={manufacturerNameAr || isEditMode.data?.nameAr || ''}
                      onChange={(e) => setManufacturerNameAr(e.target.value)}
                      placeholder="اسم الصانع"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label className="text-right block mb-2">اسم الصانع بالإنجليزية</Label>
                    <Input
                      value={manufacturerNameEn || isEditMode.data?.nameEn || ''}
                      onChange={(e) => setManufacturerNameEn(e.target.value)}
                      placeholder="Manufacturer Name"
                      dir="ltr"
                    />
                  </div>
                </>
              )}

              {isEditMode.type === 'category' && (
                <>
                  <div>
                    <Label className="text-right block mb-2">اسم الفئة بالعربية *</Label>
                    <Input
                      value={newCategoryNameAr || isEditMode.data?.name_ar || isEditMode.data?.nameAr || ''}
                      onChange={(e) => setNewCategoryNameAr(e.target.value)}
                      placeholder="اسم الفئة"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label className="text-right block mb-2">اسم الفئة بالإنجليزية</Label>
                    <Input
                      value={newCategoryNameEn || isEditMode.data?.name_en || isEditMode.data?.nameEn || ''}
                      onChange={(e) => setNewCategoryNameEn(e.target.value)}
                      placeholder="Category Name"
                      dir="ltr"
                    />
                  </div>
                </>
              )}

              {isEditMode.type === 'trimLevel' && (
                <>
                  <div>
                    <Label className="text-right block mb-2">اسم درجة التجهيز بالعربية *</Label>
                    <Input
                      value={newTrimLevelNameAr || isEditMode.data?.name_ar || ''}
                      onChange={(e) => setNewTrimLevelNameAr(e.target.value)}
                      placeholder="اسم درجة التجهيز"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label className="text-right block mb-2">اسم درجة التجهيز بالإنجليزية</Label>
                    <Input
                      value={newTrimLevelNameEn || isEditMode.data?.name_en || ''}
                      onChange={(e) => setNewTrimLevelNameEn(e.target.value)}
                      placeholder="Trim Level Name"
                      dir="ltr"
                    />
                  </div>
                </>
              )}

              {isEditMode.type === 'color' && (
                <>
                  <div>
                    <Label className="text-right block mb-2">اسم اللون بالعربية *</Label>
                    <Input
                      value={colorName || isEditMode.data?.name || ''}
                      onChange={(e) => setColorName(e.target.value)}
                      placeholder="اسم اللون بالعربية"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label className="text-right block mb-2">اسم اللون بالإنجليزية</Label>
                    <Input
                      value={colorNameEn || isEditMode.data?.nameEn || ''}
                      onChange={(e) => setColorNameEn(e.target.value)}
                      placeholder="Color Name in English"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label className="text-right block mb-2">كود اللون</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={colorCode || isEditMode.data?.code || '#ffffff'}
                        onChange={(e) => setColorCode(e.target.value)}
                        className="w-16 h-10 p-1 rounded border"
                      />
                      <Input
                        value={colorCode || isEditMode.data?.code || ''}
                        onChange={(e) => setColorCode(e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-right block mb-2">نوع اللون</Label>
                    <Select value={colorType || isEditMode.data?.type || ''} onValueChange={setColorType}>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر نوع اللون" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exterior">خارجي</SelectItem>
                        <SelectItem value="interior">داخلي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={async () => {
                    try {
                      if (isEditMode.type === 'manufacturer') {
                        await apiRequest('PUT', `/api/hierarchical/manufacturers/${isEditMode.id}`, {
                          nameAr: manufacturerNameAr || isEditMode.data?.nameAr,
                          nameEn: manufacturerNameEn || isEditMode.data?.nameEn
                        });
                      } else if (isEditMode.type === 'category') {
                        await apiRequest('PUT', `/api/hierarchical/categories/${isEditMode.id}`, {
                          name_ar: newCategoryNameAr || isEditMode.data?.name_ar || isEditMode.data?.nameAr,
                          name_en: newCategoryNameEn || isEditMode.data?.name_en || isEditMode.data?.nameEn
                        });
                      } else if (isEditMode.type === 'trimLevel') {
                        await apiRequest('PUT', `/api/hierarchical/trimLevels/${isEditMode.id}`, {
                          name_ar: newTrimLevelNameAr || isEditMode.data?.name_ar,
                          name_en: newTrimLevelNameEn || isEditMode.data?.name_en
                        });
                      } else if (isEditMode.type === 'color') {
                        await apiRequest('PUT', `/api/color-associations/${isEditMode.id}`, {
                          colorName: colorName || isEditMode.data?.name,
                          colorNameEn: colorNameEn || isEditMode.data?.nameEn,
                          colorCode: colorCode || isEditMode.data?.code,
                          colorType: colorType || isEditMode.data?.type
                        });
                      }
                      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
                      queryClient.invalidateQueries({ queryKey: ['/api/hierarchical/manufacturers'] });
                      toast({ title: "تم التحديث بنجاح" });
                      
                      // Reset all form fields
                      setManufacturerNameAr('');
                      setManufacturerNameEn('');
                      setNewCategoryNameAr('');
                      setNewCategoryNameEn('');
                      setNewTrimLevelNameAr('');
                      setNewTrimLevelNameEn('');
                      setColorName('');
                      setColorNameEn('');
                      setColorCode('');
                      setColorType('');
                      setIsEditMode(null);
                    } catch (error) {
                      toast({
                        title: "خطأ",
                        description: "فشل في التحديث",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="glass-button flex-1"
                >
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </Button>
                <Button
                  onClick={() => setIsEditMode(null)}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}