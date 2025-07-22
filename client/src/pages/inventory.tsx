import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Plus, Download, Printer, Bell, UserCircle, FileSpreadsheet, LayoutGrid, Table, DollarSign, Settings, LogOut, Palette, Users, MapPin, Building2, MessageSquare, Moon, Sun, FileText, Database, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, EyeOff, Calendar, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import InventoryStats from "@/components/inventory-stats";
import InventoryTable from "@/components/inventory-table";
import InventoryFormSimple from "@/components/inventory-form-simple";
import ExcelImport from "@/components/excel-import";

import VoiceAssistant from "@/components/voice-assistant";
import { InventoryFAB } from "@/components/animated-fab";
import SpecificationsManager from "@/components/specifications-manager";
import SpecificationsManagement from "@/components/specifications-management";
import ImageManagement from "@/components/image-management";
import { AdvancedPrintDialog } from "@/components/advanced-print-dialog";
import { exportToCSV, exportToExcel, printTable, printTableWithSettings } from "@/lib/utils";
import type { InventoryItem } from "@shared/schema";

interface InventoryPageProps {
  userRole: string;
  username: string;
  onLogout: () => void;
}

export default function InventoryPage({ userRole, username, onLogout }: InventoryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [manufacturerFilter, setManufacturerFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [trimLevelFilter, setTrimLevelFilter] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState<string[]>([]);
  const [engineCapacityFilter, setEngineCapacityFilter] = useState<string[]>([]);
  const [interiorColorFilter, setInteriorColorFilter] = useState<string[]>([]);
  const [exteriorColorFilter, setExteriorColorFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [importTypeFilter, setImportTypeFilter] = useState<string[]>([]);
  const [ownershipTypeFilter, setOwnershipTypeFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [showSoldCars, setShowSoldCars] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | undefined>(undefined);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);

  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [specificationsManagerOpen, setSpecificationsManagerOpen] = useState(false);
  const [imageManagementOpen, setImageManagementOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Toggle states for individual filters
  const [showManufacturerFilter, setShowManufacturerFilter] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showTrimLevelFilter, setShowTrimLevelFilter] = useState(false);
  const [showYearFilter, setShowYearFilter] = useState(false);
  const [showEngineCapacityFilter, setShowEngineCapacityFilter] = useState(false);
  const [showExteriorColorFilter, setShowExteriorColorFilter] = useState(false);
  const [showInteriorColorFilter, setShowInteriorColorFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showImportTypeFilter, setShowImportTypeFilter] = useState(false);
  const [showOwnershipTypeFilter, setShowOwnershipTypeFilter] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);

  // Get theme settings and hooks
  const { companyName, companyLogo, darkMode, toggleDarkMode, isUpdatingDarkMode } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  // Get inventory stats to show sold cars count
  const { data: stats } = useQuery({
    queryKey: ["/api/inventory/stats"],
  });

  // Mutation for importing cars data
  const importCarsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/cars/import", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trim-levels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cars/manufacturers"] });
      toast({
        title: "تم الاستيراد",
        description: "تم استيراد بيانات السيارات بنجاح من ملف cars.json",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في الاستيراد", 
        description: "فشل في استيراد بيانات السيارات",
        variant: "destructive",
      });
    },
  });

  // Mutation for clearing all inventory items
  const clearAllItemsMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/inventory/clear-all", {}),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      toast({
        title: "تم حذف جميع العناصر",
        description: "تم حذف جميع العناصر من المخزون بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في حذف العناصر",
        description: "فشل حذف جميع العناصر من المخزون",
        variant: "destructive",
      });
    },
  });

  // Dynamic manufacturers from inventory data - removed hardcoded list
  
  // Generate categories based on selected manufacturer
  const manufacturerCategories: Record<string, string[]> = {
    "مرسيدس": ["S-Class", "E-Class", "C-Class", "GLE", "GLS", "A-Class", "CLA", "CLS", "G-Class", "GLC"],
    "بي ام دبليو": ["7 Series", "5 Series", "3 Series", "X7", "X5", "X3", "X1", "i8", "M3", "M5"],
    "اودي": ["A8", "A6", "A4", "Q8", "Q7", "Q5", "Q3", "A3", "TT", "RS6", "e-tron"],
    "تويوتا": ["لاند كروزر", "كامري", "كورولا", "هايلاندر", "بريوس", "أفالون", "RAV4", "سيكويا"],
    "لكزس": ["LX 600", "GX 460", "RX 350", "ES 350", "LS 500", "IS 350", "UX 250h", "LC 500"],
    "رنج روفر": ["Range Rover Vogue", "Range Rover Sport", "Range Rover Evoque", "Range Rover Velar", "Discovery", "Defender"],
    "بورش": ["Cayenne", "Macan", "911", "Panamera", "Taycan", "718"],
    "نيسان": ["باترول", "التيما", "ماكسيما", "اكس تريل", "سنترا", "مورانو", "أرمادا", "Z"],
    "انفينيتي": ["QX80", "QX60", "QX50", "Q50", "Q60", "QX55"],
    "هيونداي": ["النترا", "سوناتا", "توسان", "سانتا في", "باليسايد", "أكسنت", "فيلوستر"],
    "كيا": ["سورينتو", "تيلورايد", "سيراتو", "أوبتيما", "سبورتاج", "كارنيفال", "ستينغر"],
    "فولفو": ["XC90", "XC60", "S90", "V90", "S60", "XC40"],
    "جاكوار": ["F-PACE", "I-PACE", "XF", "XE", "F-TYPE"],
    "مازيراتي": ["Levante", "Ghibli", "Quattroporte", "GranTurismo"],
    "فيراري": ["488", "F8", "Roma", "Portofino", "SF90"],
    "لامبورغيني": ["Aventador", "Huracan", "Urus"],
    "تسلا": ["Model S", "Model 3", "Model X", "Model Y"],
    "لوسيد": ["Air Dream", "Air Touring", "Air Pure"],
    "كاديلاك": ["Escalade", "XT6", "XT5", "XT4", "CT5"],
    "جي ام سي": ["Yukon", "Tahoe", "Sierra", "Canyon", "Terrain"]
  };
  
  // Get dynamic filter options from inventory data (only from available cars, not sold ones)
  const getUniqueValues = (field: keyof InventoryItem) => {
    const availableData = items.filter(item => !showSoldCars ? !item.isSold : true);
    const values = availableData
      .map(item => item[field])
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    return values;
  };
  
  // Helper function to apply multiple selection filters
  const applyMultiSelectFilter = (itemValue: any, filterArray: string[]) => {
    if (filterArray.length === 0) return true;
    return filterArray.includes(String(itemValue));
  };

  // Get categories based on selected manufacturer from actual inventory data
  const getAvailableCategories = () => {
    if (manufacturerFilter.length === 0) {
      // Return all categories from actual inventory data
      return getUniqueValues("category");
    }
    // Return categories for specific manufacturer from actual inventory data
    const availableData = items.filter(item => !showSoldCars ? !item.isSold : true);
    const manufacturerCats = availableData
      .filter(item => manufacturerFilter.includes(item.manufacturer || ""))
      .map(item => item.category)
      .filter((category, index, self) => category && self.indexOf(category) === index)
      .sort();
    return manufacturerCats;
  };
  
  // Get available manufacturers from inventory data  
  const getAvailableManufacturers = () => {
    const availableData = items.filter(item => !showSoldCars ? !item.isSold : true);
    const manufacturers = availableData
      .map(item => item.manufacturer)
      .filter((manufacturer, index, self) => manufacturer && self.indexOf(manufacturer) === index)
      .sort();
    return manufacturers;
  };

  const categories = getAvailableCategories();
  const manufacturers = getAvailableManufacturers();
  
  // Helper functions for ImageManagement component
  const getSimpleManufacturers = (): string[] => {
    const availableData = items.filter(item => !showSoldCars ? !item.isSold : true);
    const manufacturers = availableData
      .map(item => item.manufacturer)
      .filter((manufacturer, index, self) => manufacturer && self.indexOf(manufacturer) === index)
      .sort();
    return manufacturers;
  };
  
  const getSimpleCategories = (): string[] => {
    const availableData = items.filter(item => !showSoldCars ? !item.isSold : true);
    const categories = availableData
      .map(item => item.category)
      .filter((category, index, self) => category && self.indexOf(category) === index)
      .sort();
    return categories;
  };
  
  const getSimpleTrimLevels = (): string[] => {
    const availableData = items.filter(item => !showSoldCars ? !item.isSold : true);
    const trimLevels = availableData
      .map(item => item.trimLevel)
      .filter((trimLevel, index, self) => trimLevel != null && self.indexOf(trimLevel) === index)
      .sort();
    return trimLevels as string[];
  };
  
  const getSimpleColors = (): string[] => {
    const availableData = items.filter(item => !showSoldCars ? !item.isSold : true);
    const exteriorColors = availableData.map(item => item.exteriorColor);
    const interiorColors = availableData.map(item => item.interiorColor);
    const allColors = [...exteriorColors, ...interiorColors]
      .filter((color, index, self) => color && self.indexOf(color) === index)
      .sort();
    return allColors;
  };

  // Get count for each filter option - dynamically based on previously applied filters
  const getFilterCount = (field: keyof InventoryItem, value: string) => {
    const availableData = items.filter(item => !showSoldCars ? !item.isSold : true);
    
    // Apply all filters that come BEFORE the current field in the hierarchy
    let filteredData = availableData.filter(item => {
      // Apply search filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          item.chassisNumber?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.trimLevel?.toLowerCase().includes(query) ||
          item.exteriorColor?.toLowerCase().includes(query) ||
          item.interiorColor?.toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query) ||
          item.manufacturer?.toLowerCase().includes(query) ||
          item.engineCapacity?.toLowerCase().includes(query) ||
          item.year?.toString().includes(query) ||
          item.status?.toLowerCase().includes(query) ||
          item.importType?.toLowerCase().includes(query) ||
          item.ownershipType?.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Filter hierarchy: manufacturer -> category -> trimLevel -> year -> engineCapacity -> colors -> status -> importType
      if (field === "manufacturer") {
        // No previous filters for manufacturer
        return true;
      }
      
      if (field === "category") {
        // Apply manufacturer filter if set
        if (manufacturerFilter.length > 0 && !manufacturerFilter.includes(item.manufacturer || "")) return false;
        return true;
      }
      
      if (field === "trimLevel") {
        // Apply manufacturer and category filters
        if (manufacturerFilter.length > 0 && !manufacturerFilter.includes(item.manufacturer || "")) return false;
        if (categoryFilter.length > 0 && !categoryFilter.includes(item.category || "")) return false;
        return true;
      }
      
      if (field === "year") {
        // Apply manufacturer, category, trimLevel filters
        if (manufacturerFilter.length > 0 && !manufacturerFilter.includes(item.manufacturer || "")) return false;
        if (categoryFilter.length > 0 && !categoryFilter.includes(item.category || "")) return false;
        if (trimLevelFilter.length > 0 && !trimLevelFilter.includes(item.trimLevel || "")) return false;
        return true;
      }
      
      if (field === "engineCapacity") {
        // Apply all previous filters
        if (manufacturerFilter.length > 0 && !manufacturerFilter.includes(item.manufacturer || "")) return false;
        if (categoryFilter.length > 0 && !categoryFilter.includes(item.category || "")) return false;
        if (trimLevelFilter.length > 0 && !trimLevelFilter.includes(item.trimLevel || "")) return false;
        if (yearFilter.length > 0 && !yearFilter.includes(String(item.year))) return false;
        return true;
      }
      
      if (field === "exteriorColor") {
        if (manufacturerFilter.length > 0 && !manufacturerFilter.includes(item.manufacturer || "")) return false;
        if (categoryFilter.length > 0 && !categoryFilter.includes(item.category || "")) return false;
        if (trimLevelFilter.length > 0 && !trimLevelFilter.includes(item.trimLevel || "")) return false;
        if (yearFilter.length > 0 && !yearFilter.includes(String(item.year))) return false;
        if (engineCapacityFilter.length > 0 && !engineCapacityFilter.includes(item.engineCapacity || "")) return false;
        return true;
      }
      
      if (field === "interiorColor") {
        if (manufacturerFilter.length > 0 && !manufacturerFilter.includes(item.manufacturer || "")) return false;
        if (categoryFilter.length > 0 && !categoryFilter.includes(item.category || "")) return false;
        if (trimLevelFilter.length > 0 && !trimLevelFilter.includes(item.trimLevel || "")) return false;
        if (yearFilter.length > 0 && !yearFilter.includes(String(item.year))) return false;
        if (engineCapacityFilter.length > 0 && !engineCapacityFilter.includes(item.engineCapacity || "")) return false;
        if (exteriorColorFilter.length > 0 && !exteriorColorFilter.includes(item.exteriorColor || "")) return false;
        return true;
      }
      
      if (field === "status") {
        if (manufacturerFilter.length > 0 && !manufacturerFilter.includes(item.manufacturer || "")) return false;
        if (categoryFilter.length > 0 && !categoryFilter.includes(item.category || "")) return false;
        if (trimLevelFilter.length > 0 && !trimLevelFilter.includes(item.trimLevel || "")) return false;
        if (yearFilter.length > 0 && !yearFilter.includes(String(item.year))) return false;
        if (engineCapacityFilter.length > 0 && !engineCapacityFilter.includes(item.engineCapacity || "")) return false;
        if (exteriorColorFilter.length > 0 && !exteriorColorFilter.includes(item.exteriorColor || "")) return false;
        if (interiorColorFilter.length > 0 && !interiorColorFilter.includes(item.interiorColor || "")) return false;
        return true;
      }
      
      if (field === "importType") {
        // Apply all previous filters
        if (manufacturerFilter.length > 0 && !manufacturerFilter.includes(item.manufacturer || "")) return false;
        if (categoryFilter.length > 0 && !categoryFilter.includes(item.category || "")) return false;
        if (trimLevelFilter.length > 0 && !trimLevelFilter.includes(item.trimLevel || "")) return false;
        if (yearFilter.length > 0 && !yearFilter.includes(String(item.year))) return false;
        if (engineCapacityFilter.length > 0 && !engineCapacityFilter.includes(item.engineCapacity || "")) return false;
        if (exteriorColorFilter.length > 0 && !exteriorColorFilter.includes(item.exteriorColor || "")) return false;
        if (interiorColorFilter.length > 0 && !interiorColorFilter.includes(item.interiorColor || "")) return false;
        if (statusFilter.length > 0 && !statusFilter.includes(item.status || "")) return false;
        return true;
      }
      
      if (field === "ownershipType") {
        if (manufacturerFilter.length > 0 && !manufacturerFilter.includes(item.manufacturer || "")) return false;
        if (categoryFilter.length > 0 && !categoryFilter.includes(item.category || "")) return false;
        if (trimLevelFilter.length > 0 && !trimLevelFilter.includes(item.trimLevel || "")) return false;
        if (yearFilter.length > 0 && !yearFilter.includes(String(item.year))) return false;
        if (engineCapacityFilter.length > 0 && !engineCapacityFilter.includes(item.engineCapacity || "")) return false;
        if (exteriorColorFilter.length > 0 && !exteriorColorFilter.includes(item.exteriorColor || "")) return false;
        if (interiorColorFilter.length > 0 && !interiorColorFilter.includes(item.interiorColor || "")) return false;
        if (statusFilter.length > 0 && !statusFilter.includes(item.status || "")) return false;
        if (importTypeFilter.length > 0 && !importTypeFilter.includes(item.importType || "")) return false;
        return true;
      }
      
      return true;
    });
    
    // Return count based on value
    if (value === "جميع الصناع" || value === "جميع الفئات" || value === "جميع درجات التجهيز" || 
        value === "جميع السنوات" || value === "جميع السعات" || value === "جميع الألوان الداخلية" || 
        value === "جميع الألوان الخارجية" || value === "جميع الحالات" || value === "جميع الأنواع" || value === "جميع أنواع الملكية") {
      return filteredData.length;
    }
    
    // Special handling for year field to handle number/string comparison
    if (field === "year") {
      return filteredData.filter(item => String(item.year) === String(value)).length;
    }
    
    return filteredData.filter(item => item[field] === value).length;
  };
  
  // Helper function to toggle filter selection
  const toggleFilter = (
    filterArray: string[], 
    setFilterArray: React.Dispatch<React.SetStateAction<string[]>>, 
    value: string
  ) => {
    if (filterArray.includes(value)) {
      setFilterArray(filterArray.filter(item => item !== value));
    } else {
      setFilterArray([...filterArray, value]);
    }
  };

  // Reset dependent filters when parent filter changes
  const handleManufacturerChange = (value: string) => {
    toggleFilter(manufacturerFilter, setManufacturerFilter, value);
    // Reset category filter when manufacturer changes
    setCategoryFilter([]);
  };

  // Get dynamic filter arrays based on currently applied filters
  const getFilteredUniqueValues = (field: keyof InventoryItem, appliedFilters: Record<string, string>) => {
    const availableData = items.filter(item => !showSoldCars ? !item.isSold : true);
    
    let filteredData = availableData.filter(item => {
      // Apply search filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          item.chassisNumber?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.trimLevel?.toLowerCase().includes(query) ||
          item.exteriorColor?.toLowerCase().includes(query) ||
          item.interiorColor?.toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query) ||
          item.manufacturer?.toLowerCase().includes(query) ||
          item.engineCapacity?.toLowerCase().includes(query) ||
          item.year?.toString().includes(query) ||
          item.status?.toLowerCase().includes(query) ||
          item.importType?.toLowerCase().includes(query) ||
          item.ownershipType?.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Apply previous filters in hierarchy order
      if (appliedFilters.manufacturer && appliedFilters.manufacturer !== "جميع الصناع" && item.manufacturer !== appliedFilters.manufacturer) return false;
      if (appliedFilters.category && appliedFilters.category !== "جميع الفئات" && item.category !== appliedFilters.category) return false;
      if (appliedFilters.trimLevel && appliedFilters.trimLevel !== "جميع درجات التجهيز" && item.trimLevel !== appliedFilters.trimLevel) return false;
      if (appliedFilters.year && appliedFilters.year !== "جميع السنوات" && String(item.year) !== appliedFilters.year) return false;
      if (appliedFilters.engineCapacity && appliedFilters.engineCapacity !== "جميع السعات" && item.engineCapacity !== appliedFilters.engineCapacity) return false;
      if (appliedFilters.exteriorColor && appliedFilters.exteriorColor !== "جميع الألوان الخارجية" && item.exteriorColor !== appliedFilters.exteriorColor) return false;
      if (appliedFilters.interiorColor && appliedFilters.interiorColor !== "جميع الألوان الداخلية" && item.interiorColor !== appliedFilters.interiorColor) return false;
      if (appliedFilters.status && appliedFilters.status !== "جميع الحالات" && item.status !== appliedFilters.status) return false;
      
      return true;
    });
    
    const values = filteredData
      .map(item => item[field])
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    return values;
  };

  // Dynamic filter arrays based on previously applied filters
  const availableStatuses = ["جميع الحالات", ...getFilteredUniqueValues("status", {
    manufacturer: manufacturerFilter,
    category: categoryFilter,
    trimLevel: trimLevelFilter,
    year: yearFilter,
    engineCapacity: engineCapacityFilter,
    exteriorColor: exteriorColorFilter,
    interiorColor: interiorColorFilter
  })];
  
  const availableImportTypes = ["جميع الأنواع", ...getFilteredUniqueValues("importType", {
    manufacturer: manufacturerFilter,
    category: categoryFilter,
    trimLevel: trimLevelFilter,
    year: yearFilter,
    engineCapacity: engineCapacityFilter,
    exteriorColor: exteriorColorFilter,
    interiorColor: interiorColorFilter,
    status: statusFilter
  })];

  const availableOwnershipTypes = ["جميع أنواع الملكية", ...getFilteredUniqueValues("ownershipType", {
    manufacturer: manufacturerFilter,
    category: categoryFilter,
    trimLevel: trimLevelFilter,
    year: yearFilter,
    engineCapacity: engineCapacityFilter,
    exteriorColor: exteriorColorFilter,
    interiorColor: interiorColorFilter,
    status: statusFilter,
    importType: importTypeFilter
  })];
  
  const availableEngineCapacities = ["جميع السعات", ...getFilteredUniqueValues("engineCapacity", {
    manufacturer: manufacturerFilter,
    category: categoryFilter,
    trimLevel: trimLevelFilter,
    year: yearFilter
  })];
  
  const availableExteriorColors = ["جميع الألوان الخارجية", ...getFilteredUniqueValues("exteriorColor", {
    manufacturer: manufacturerFilter,
    category: categoryFilter,
    trimLevel: trimLevelFilter,
    year: yearFilter,
    engineCapacity: engineCapacityFilter
  })];
  
  const availableInteriorColors = ["جميع الألوان الداخلية", ...getFilteredUniqueValues("interiorColor", {
    manufacturer: manufacturerFilter,
    category: categoryFilter,
    trimLevel: trimLevelFilter,
    year: yearFilter,
    engineCapacity: engineCapacityFilter,
    exteriorColor: exteriorColorFilter
  })];
  
  const availableTrimLevels = ["جميع درجات التجهيز", ...getFilteredUniqueValues("trimLevel", {
    manufacturer: manufacturerFilter,
    category: categoryFilter
  })];
  
  const yearValues = getFilteredUniqueValues("year", {
    manufacturer: manufacturerFilter,
    category: categoryFilter,
    trimLevel: trimLevelFilter
  }).map(year => String(year)).sort((a, b) => parseInt(b) - parseInt(a)); // Sort years in descending order
  
  const availableYears = ["جميع السنوات", ...yearValues];
  
  const years = availableYears;

  const handleExport = () => {
    exportToExcel(items, "تصدير-المخزون.xlsx");
  };

  const handlePrint = () => {
    setPrintDialogOpen(true);
  };



  const handleEdit = (item: InventoryItem) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditItem(undefined);
  };

  const handleImportCarsData = () => {
    importCarsMutation.mutate();
  };

  const handleClearAllItems = () => {
    if (confirm("هل أنت متأكد من حذف جميع العناصر من المخزون؟ لا يمكن التراجع عن هذا الإجراء.")) {
      clearAllItemsMutation.mutate();
    }
  };



  const totalPages = Math.ceil(items.length / itemsPerPage);

  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Company Name */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md overflow-hidden">
                {companyLogo ? (
                  <img 
                    src={companyLogo} 
                    alt="شعار الشركة" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-white font-bold text-lg sm:text-xl">ش</span>
                )}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">{companyName}</h1>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-latin">Inventory System</span>
              </div>
            </div>
            {/* Mobile and Desktop Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
              {/* Navigation Tabs - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-2 space-x-reverse border border-slate-200 rounded-lg p-1">
                <Button variant="default" size="sm" className="bg-custom-primary hover:bg-custom-primary-dark text-white">
                  <Table size={14} className="ml-1" />
                  <span className="hidden lg:inline">جدول</span>
                </Button>
                <Link href="/cards">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                    <LayoutGrid size={14} className="ml-1" />
                    <span className="hidden lg:inline">بطاقات</span>
                  </Button>
                </Link>
              </div>
              
              {/* Mobile Navigation Icons */}
              <div className="flex md:hidden items-center space-x-1 space-x-reverse">
                <Button variant="default" size="sm" className="bg-custom-primary hover:bg-custom-primary-dark text-white p-2">
                  <Table size={16} />
                </Button>
                <Link href="/cards">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800 p-2">
                    <LayoutGrid size={16} />
                  </Button>
                </Link>
              </div>

              {/* Admin Management Buttons - Admin Only */}
              {userRole === "admin" && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Link href="/appearance">
                    <Button variant="outline" size="sm" className="text-custom-primary hover:text-custom-primary-dark hover:bg-blue-50 border-teal-200 transition-colors">
                      <Palette size={16} className="ml-1" />
                      <span className="hidden sm:inline">إدارة المظهر</span>
                      <span className="sm:hidden">المظهر</span>
                    </Button>
                  </Link>
                  
                  <Link href="/user-management">
                    <Button variant="outline" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200 transition-colors">
                      <Users size={16} className="ml-1" />
                      <span className="hidden sm:inline">إدارة المستخدمين</span>
                      <span className="sm:hidden">المستخدمين</span>
                    </Button>
                  </Link>

                </div>
              )}



              {/* User Actions */}
              <div className="flex items-center space-x-1 space-x-reverse">
                {/* Dark Mode Toggle */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100" 
                  onClick={toggleDarkMode}
                  disabled={isUpdatingDarkMode}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
                

                
                {/* Admin Dropdown Menu */}
                {userRole === "admin" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-800">
                        <Settings size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <Link href="/appearance">
                        <DropdownMenuItem>
                          <Palette className="mr-2 h-4 w-4" />
                          إدارة المظهر
                        </DropdownMenuItem>
                      </Link>

                      <Link href="/pdf-appearance">
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          مظهر عرض السعر PDF
                        </DropdownMenuItem>
                      </Link>

                      <DropdownMenuItem onClick={() => setSpecificationsManagerOpen(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        إدارة المواصفات
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setImageManagementOpen(true)}>
                        <FileText className="mr-2 h-4 w-4" />
                        إدارة الصور
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem 
                        onClick={handleImportCarsData}
                        disabled={importCarsMutation.isPending}
                      >
                        <Database className="mr-2 h-4 w-4" />
                        {importCarsMutation.isPending ? "جاري الاستيراد..." : "استيراد بيانات السيارات"}
                      </DropdownMenuItem>

                      <Link href="/user-management">
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          إدارة المستخدمين
                        </DropdownMenuItem>
                      </Link>

                      <Link href="/dynamic-company-control">
                        <DropdownMenuItem>
                          <Building2 className="mr-2 h-4 w-4" />
                          التحكم في الشركة
                        </DropdownMenuItem>
                      </Link>

                      <Link href="/integration-management">
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          إدارة التكامل
                        </DropdownMenuItem>
                      </Link>

                      <DropdownMenuSeparator />

                      <Link href="/comprehensive-lists">
                        <DropdownMenuItem>
                          <Database className="mr-2 h-4 w-4" />
                          تحرير القوائم
                        </DropdownMenuItem>
                      </Link>

                      <DropdownMenuSeparator />

                      <Link href="/reservations">
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          إدارة الحجوزات
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/sold-vehicles">
                        <DropdownMenuItem>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          السيارات المباعة
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                {/* User Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-800">
                      <UserCircle size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="text-sm text-slate-500 cursor-default">
                      <UserCircle className="mr-2 h-4 w-4" />
                      المستخدم: {userRole === "admin" ? "أدمن" : "مستخدم"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 hover:bg-red-50 cursor-pointer"
                      onClick={onLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>



      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <InventoryStats />

        {/* Controls */}
        <Card className="mb-8 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* Search Bar and Filter Toggle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative max-w-md">
                  <Input
                    type="text"
                    placeholder="البحث في المخزون..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
                
                {/* Filter Toggle Button - Right Aligned */}
                <div className="flex items-center justify-end w-full sm:w-auto">
                  <div className="w-full">
                    <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                      <div className="flex justify-end w-full">
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 border-slate-300 dark:border-slate-600 transition-all duration-200"
                          >
                            <Filter size={16} />
                            الفلاتر
                            {filtersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    
                    <CollapsibleContent className="mt-4 w-full">
                      <Card className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shadow-sm w-full">
                        <CardContent className="p-6">
                          {/* Enhanced Filter Controls with Button Design */}
                          <div className="space-y-6 animate-in fade-in duration-300">
                            
                            {/* Multi-Select Filter Component */}
                            {(() => {
                              const MultiSelectFilter = ({ title, items, selectedFilters, onFilterToggle, getCount, showToggle, toggleState, onToggleChange }: {
                                title: string;
                                items: any[];
                                selectedFilters: string[];
                                onFilterToggle: (item: any) => void;
                                getCount: (item: any) => number;
                                showToggle: boolean;
                                toggleState: boolean;
                                onToggleChange: (state: boolean) => void;
                              }) => (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</h3>
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                      <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {selectedFilters.length > 0 ? `(${selectedFilters.length} محدد)` : ""}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onToggleChange(!toggleState)}
                                        className="p-2 h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                      >
                                        {toggleState ? (
                                          <Eye size={16} className="text-blue-600 dark:text-blue-400" />
                                        ) : (
                                          <EyeOff size={16} className="text-slate-400 dark:text-slate-500" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                  {toggleState && (
                                    <div className="relative group">
                                      <ScrollArea className="w-full">
                                        <div className="flex space-x-2 space-x-reverse pb-2">
                                          {items.map((item) => {
                                            const isSelected = selectedFilters.includes(item);
                                            return (
                                              <Button
                                                key={item}
                                                variant={isSelected ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => onFilterToggle(item)}
                                                className={`transition-all duration-200 whitespace-nowrap relative ${
                                                  isSelected
                                                    ? "bg-custom-primary hover:bg-custom-primary-dark text-white"
                                                    : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-custom-primary"
                                                }`}
                                              >
                                                {isSelected && (
                                                  <span className="absolute top-0 left-0 w-2 h-2 bg-green-400 rounded-full transform -translate-x-1 -translate-y-1"></span>
                                                )}
                                                {item} ({getCount(item)})
                                              </Button>
                                            );
                                          })}
                                        </div>
                                      </ScrollArea>
                                      {/* Navigation Arrows */}
                                      <button 
                                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const scrollArea = e.currentTarget.parentElement?.querySelector('[data-radix-scroll-area-viewport]');
                                          if (scrollArea) scrollArea.scrollBy({ left: -200, behavior: 'smooth' });
                                        }}
                                      >
                                        <ChevronLeft size={16} className="text-slate-600 dark:text-slate-400" />
                                      </button>
                                      <button 
                                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const scrollArea = e.currentTarget.parentElement?.querySelector('[data-radix-scroll-area-viewport]');
                                          if (scrollArea) scrollArea.scrollBy({ left: 200, behavior: 'smooth' });
                                        }}
                                      >
                                        <ChevronRight size={16} className="text-slate-600 dark:text-slate-400" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                              
                              return (
                                <div className="space-y-4">
                                  {/* Master Filter Controls */}

                                  
                                  {/* Individual Multiple Selection Filters */}
                                  <div className="space-y-3">
                                    <MultiSelectFilter 
                                      title="الصانع" 
                                      items={manufacturers} 
                                      selectedFilters={manufacturerFilter} 
                                      onFilterToggle={(item) => toggleFilter(manufacturerFilter, setManufacturerFilter, item)} 
                                      getCount={(item) => getFilterCount("manufacturer", item)} 
                                      showToggle={true}
                                      toggleState={showManufacturerFilter}
                                      onToggleChange={setShowManufacturerFilter}
                                    />
                                    <MultiSelectFilter 
                                      title="الفئة" 
                                      items={categories} 
                                      selectedFilters={categoryFilter} 
                                      onFilterToggle={(item) => toggleFilter(categoryFilter, setCategoryFilter, item)} 
                                      getCount={(item) => getFilterCount("category", item)} 
                                      showToggle={true}
                                      toggleState={showCategoryFilter}
                                      onToggleChange={setShowCategoryFilter}
                                    />
                                    <MultiSelectFilter 
                                      title="درجة التجهيز" 
                                      items={availableTrimLevels} 
                                      selectedFilters={trimLevelFilter} 
                                      onFilterToggle={(item) => toggleFilter(trimLevelFilter, setTrimLevelFilter, item)} 
                                      getCount={(item) => getFilterCount("trimLevel", item)} 
                                      showToggle={true}
                                      toggleState={showTrimLevelFilter}
                                      onToggleChange={setShowTrimLevelFilter}
                                    />
                                    <MultiSelectFilter 
                                      title="السنة" 
                                      items={availableYears} 
                                      selectedFilters={yearFilter} 
                                      onFilterToggle={(item) => toggleFilter(yearFilter, setYearFilter, item)} 
                                      getCount={(item) => getFilterCount("year", item)} 
                                      showToggle={true}
                                      toggleState={showYearFilter}
                                      onToggleChange={setShowYearFilter}
                                    />
                                    <MultiSelectFilter 
                                      title="سعة المحرك" 
                                      items={availableEngineCapacities} 
                                      selectedFilters={engineCapacityFilter} 
                                      onFilterToggle={(item) => toggleFilter(engineCapacityFilter, setEngineCapacityFilter, item)} 
                                      getCount={(item) => getFilterCount("engineCapacity", item)} 
                                      showToggle={true}
                                      toggleState={showEngineCapacityFilter}
                                      onToggleChange={setShowEngineCapacityFilter}
                                    />
                                    <MultiSelectFilter 
                                      title="اللون الخارجي" 
                                      items={availableExteriorColors} 
                                      selectedFilters={exteriorColorFilter} 
                                      onFilterToggle={(item) => toggleFilter(exteriorColorFilter, setExteriorColorFilter, item)} 
                                      getCount={(item) => getFilterCount("exteriorColor", item)} 
                                      showToggle={true}
                                      toggleState={showExteriorColorFilter}
                                      onToggleChange={setShowExteriorColorFilter}
                                    />
                                    <MultiSelectFilter 
                                      title="اللون الداخلي" 
                                      items={availableInteriorColors} 
                                      selectedFilters={interiorColorFilter} 
                                      onFilterToggle={(item) => toggleFilter(interiorColorFilter, setInteriorColorFilter, item)} 
                                      getCount={(item) => getFilterCount("interiorColor", item)} 
                                      showToggle={true}
                                      toggleState={showInteriorColorFilter}
                                      onToggleChange={setShowInteriorColorFilter}
                                    />
                                    <MultiSelectFilter 
                                      title="الحالة" 
                                      items={availableStatuses} 
                                      selectedFilters={statusFilter} 
                                      onFilterToggle={(item) => toggleFilter(statusFilter, setStatusFilter, item)} 
                                      getCount={(item) => getFilterCount("status", item)} 
                                      showToggle={true}
                                      toggleState={showStatusFilter}
                                      onToggleChange={setShowStatusFilter}
                                    />
                                    <MultiSelectFilter 
                                      title="نوع الاستيراد" 
                                      items={availableImportTypes} 
                                      selectedFilters={importTypeFilter} 
                                      onFilterToggle={(item) => toggleFilter(importTypeFilter, setImportTypeFilter, item)} 
                                      getCount={(item) => getFilterCount("importType", item)} 
                                      showToggle={true}
                                      toggleState={showImportTypeFilter}
                                      onToggleChange={setShowImportTypeFilter}
                                    />
                                    <MultiSelectFilter 
                                      title="نوع الملكية" 
                                      items={availableOwnershipTypes} 
                                      selectedFilters={ownershipTypeFilter} 
                                      onFilterToggle={(item) => toggleFilter(ownershipTypeFilter, setOwnershipTypeFilter, item)} 
                                      getCount={(item) => getFilterCount("ownershipType", item)} 
                                      showToggle={true}
                                      toggleState={showOwnershipTypeFilter}
                                      onToggleChange={setShowOwnershipTypeFilter}
                                    />
                                  </div>
                                </div>
                              );
                            })()}

                {/* Reset Filters Button */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setManufacturerFilter([]);
                      setCategoryFilter([]);
                      setTrimLevelFilter([]);
                      setYearFilter([]);
                      setEngineCapacityFilter([]);
                      setInteriorColorFilter([]);
                      setExteriorColorFilter([]);
                      setStatusFilter([]);
                      setImportTypeFilter([]);
                      setOwnershipTypeFilter([]);
                    }}
                    className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-900/20"
                  >
                    إعادة تعيين جميع الفلاتر ({
                      (manufacturerFilter?.length || 0) + (categoryFilter?.length || 0) + (trimLevelFilter?.length || 0) + 
                      (yearFilter?.length || 0) + (engineCapacityFilter?.length || 0) + (exteriorColorFilter?.length || 0) + 
                      (interiorColorFilter?.length || 0) + (statusFilter?.length || 0) + (importTypeFilter?.length || 0) + (ownershipTypeFilter?.length || 0)
                    } نشط)
                  </Button>
                </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Admin-only buttons */}
                {userRole === "admin" && (
                  <>
                    <Button 
                      onClick={() => setFormOpen(true)}
                      className="bg-custom-primary hover:bg-custom-primary-dark text-white w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة عنصر
                    </Button>
                    <Button 
                      onClick={() => setSpecificationsManagerOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                    >
                      <FileText className="w-4 h-4 ml-2" />
                      إدارة المواصفات
                    </Button>
                    <Button 
                      onClick={() => setImageManagementOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                    >
                      <FileText className="w-4 h-4 ml-2" />
                      إدارة الصور
                    </Button>
                    <Button 
                      onClick={() => setIsExcelImportOpen(true)}
                      className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                    >
                      <FileSpreadsheet className="w-4 h-4 ml-2" />
                      استيراد من Excel
                    </Button>
                    <Button 
                      onClick={handleClearAllItems}
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600 w-full sm:w-auto"
                      disabled={clearAllItemsMutation.isPending}
                    >
                      <Database className="w-4 h-4 ml-2" />
                      {clearAllItemsMutation.isPending ? "جاري الحذف..." : "حذف جميع العناصر"}
                    </Button>

                  </>
                )}
                

                <Button 
                  onClick={handleExport}
                  variant="outline"
                  className="border-slate-300 text-slate-600 hover:bg-slate-50 w-full sm:w-auto"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تصدير CSV
                </Button>
                <Button 
                  onClick={handlePrint}
                  variant="outline"
                  className="border-slate-300 text-slate-600 hover:bg-slate-50 w-full sm:w-auto"
                >
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة مخصصة
                </Button>
                {/* Show Sold Cars Button - Admin Only */}
                {userRole === "admin" && (
                  <Button 
                    onClick={() => setShowSoldCars(!showSoldCars)}
                    variant={showSoldCars ? "default" : "outline"}
                    className={showSoldCars ? "bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto" : "border-red-300 text-red-600 hover:bg-red-50 w-full sm:w-auto"}
                  >
                    <DollarSign className="w-4 h-4 ml-2" />
                    {showSoldCars ? "إخفاء السيارات المباعة" : "إظهار السيارات المباعة"}
                    {stats?.sold && stats.sold > 0 && (
                      <span className="mr-2 px-2 py-1 text-xs font-semibold rounded-full bg-white bg-opacity-20">
                        {stats.sold}
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <InventoryTable
          searchQuery={searchQuery}
          manufacturerFilter={manufacturerFilter}
          categoryFilter={categoryFilter}
          trimLevelFilter={trimLevelFilter}
          yearFilter={yearFilter}
          engineCapacityFilter={engineCapacityFilter}
          interiorColorFilter={interiorColorFilter}
          exteriorColorFilter={exteriorColorFilter}
          statusFilter={statusFilter}
          importTypeFilter={importTypeFilter}
          ownershipTypeFilter={ownershipTypeFilter}
          showSoldCars={showSoldCars}
          userRole={userRole}
          username={username}
          onEdit={handleEdit}
        />

        {/* Pagination */}
        <div className="flex items-center justify-end mt-8">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              السابق
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
                className={currentPage === i + 1 ? "bg-custom-primary hover:bg-custom-primary-dark" : ""}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      </main>

      {/* Animated Floating Action Button */}
      <InventoryFAB
        onAddItem={userRole === "admin" ? () => setFormOpen(true) : undefined}
        onSearch={() => {
          // Focus on search input if visible, or scroll to search area
          const searchInput = document.querySelector('input[placeholder*="البحث"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
        onExport={handleExport}
        onPrint={handlePrint}
        onVoiceChat={() => setVoiceChatOpen(true)}
        userRole={userRole}
      />

      {/* Add/Edit Form */}
      <InventoryFormSimple 
        open={formOpen} 
        onOpenChange={handleFormClose} 
        editItem={editItem}
      />

      {/* Excel Import Dialog */}
      <ExcelImport 
        open={isExcelImportOpen} 
        onOpenChange={setIsExcelImportOpen} 
      />



      {/* Voice Assistant Dialog */}
      <VoiceAssistant
        open={voiceChatOpen}
        onOpenChange={setVoiceChatOpen}
        onAddItem={() => setFormOpen(true)}
        onEditItem={(item) => {
          setEditItem(item);
          setFormOpen(true);
        }}
        onSellItem={async (itemId) => {
          // Handle sell item
          console.log('Selling item:', itemId);
        }}
        onDeleteItem={async (itemId) => {
          // Handle delete item
          console.log('Deleting item:', itemId);
        }}
        onExtractChassisNumber={(file) => {
          console.log('Extracting chassis number from:', file);
        }}
      />

      {/* Specifications Manager Dialog */}
      <SpecificationsManager
        open={specificationsManagerOpen}
        onOpenChange={setSpecificationsManagerOpen}
      />
      
      {/* Specifications Management Dialog */}
      <SpecificationsManagement
        open={specificationsManagerOpen}
        onOpenChange={setSpecificationsManagerOpen}
      />

      {/* Advanced Print Dialog */}
      <AdvancedPrintDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
      />

      {/* Image Management Dialog */}
      <ImageManagement
        open={imageManagementOpen}
        onOpenChange={setImageManagementOpen}
        manufacturers={getSimpleManufacturers()}
        categories={getSimpleCategories()}
        trimLevels={getSimpleTrimLevels()}
        colors={getSimpleColors()}
      />
    </div>
  );
}
