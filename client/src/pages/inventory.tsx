import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Plus, Download, Printer, Bell, UserCircle, FileSpreadsheet, LayoutGrid, Table, DollarSign, Settings, LogOut, Palette, Users, MapPin, Building2, MessageSquare, Moon, Sun, FileText, Database, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, EyeOff, Calendar, ShoppingCart, Landmark, CreditCard, LayoutDashboard, Package, Activity, BarChart3, Calculator, UserCheck, Image, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { apiRequest } from "@/lib/queryClient";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

import InventoryStats from "@/components/inventory-stats";
import InventoryTable from "@/components/inventory-table";
import InventoryForm from "@/components/inventory-form";
import { ExcelImportDialog } from "@/components/excel-import-dialog";

import ScrollableFilter from "@/components/scrollable-filter";





import { AdvancedPrintDialog } from "@/components/advanced-print-dialog";
import SystemGlassWrapper from "@/components/system-glass-wrapper";
import { exportToCSV, exportToExcel, printTable, printTableWithSettings } from "@/lib/utils";
import type { InventoryItem } from "@shared/schema";
import { canCreateItem, canDeleteItem, UserRole } from "@/utils/permissions";

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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | undefined>(undefined);




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
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [excelImportDialogOpen, setExcelImportDialogOpen] = useState(false);

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

  // Simple filter arrays - just get unique values from data
  const availableStatuses = ["جميع الحالات", ...Array.from(new Set(items.filter(item => !showSoldCars ? !item.isSold : true).map(item => item.status).filter(Boolean))).sort()];
  
  const availableImportTypes = ["جميع الأنواع", ...Array.from(new Set(items.filter(item => !showSoldCars ? !item.isSold : true).map(item => item.importType).filter(Boolean))).sort()];

  const availableOwnershipTypes = ["جميع أنواع الملكية", ...Array.from(new Set(items.filter(item => !showSoldCars ? !item.isSold : true).map(item => item.ownershipType).filter(Boolean))).sort()];
  
  const availableEngineCapacities = ["جميع السعات", ...Array.from(new Set(items.filter(item => !showSoldCars ? !item.isSold : true).map(item => item.engineCapacity).filter(Boolean))).sort()];
  
  const availableExteriorColors = ["جميع الألوان الخارجية", ...Array.from(new Set(items.filter(item => !showSoldCars ? !item.isSold : true).map(item => item.exteriorColor).filter(Boolean))).sort()];
  
  const availableInteriorColors = ["جميع الألوان الداخلية", ...Array.from(new Set(items.filter(item => !showSoldCars ? !item.isSold : true).map(item => item.interiorColor).filter(Boolean))).sort()];
  
  const availableTrimLevels = ["جميع درجات التجهيز", ...Array.from(new Set(items.filter(item => !showSoldCars ? !item.isSold : true).map(item => item.trimLevel).filter(Boolean))).sort()];
  
  const yearValues = Array.from(new Set(items.filter(item => !showSoldCars ? !item.isSold : true).map(item => String(item.year)).filter(Boolean))).sort((a, b) => parseInt(b) - parseInt(a));
  
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





  const totalPages = Math.ceil(items.length / itemsPerPage);

  return (
    <SystemGlassWrapper>
      <div className="relative z-10" dir="rtl">



      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pr-24">
        {/* Stats Cards */}
        <InventoryStats />

        {/* Controls */}
        <Card className="glass-container mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* Main Control Bar */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search Input */}
                <div className="relative max-w-md flex-shrink-0">
                  <Input
                    type="text"
                    placeholder="البحث في المخزون..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="glass-search pr-10"
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-white/60" />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Add Item Button */}
                  {canCreateItem(userRole as UserRole, "inventory") && (
                    <Button 
                      onClick={() => setFormOpen(true)}
                      className="glass-button-primary"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة عنصر
                    </Button>
                  )}
                  
                  {/* Excel Import Button */}
                  {canCreateItem(userRole as UserRole, "inventory") && (
                    <Button 
                      onClick={() => setExcelImportDialogOpen(true)}
                      variant="outline"
                      size="sm"
                      className="glass-button glass-text-primary"
                    >
                      <FileSpreadsheet className="w-4 h-4 ml-2" />
                      استيراد من Excel
                    </Button>
                  )}
                  
                  {/* Export Button */}
                  <Button 
                    onClick={handleExport}
                    variant="outline"
                    size="sm"
                    className="glass-button glass-text-primary"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    تصدير
                  </Button>
                  
                  {/* Print Button */}
                  <Button 
                    onClick={handlePrint}
                    variant="outline"
                    size="sm"
                    className="glass-button glass-text-primary"
                  >
                    <Printer className="w-4 h-4 ml-2" />
                    طباعة مخصصة
                  </Button>





                  {/* Show Sold Cars Button - Admin Only */}
                  {userRole === "admin" && (
                    <Button 
                      onClick={() => setShowSoldCars(!showSoldCars)}
                      variant={showSoldCars ? "default" : "outline"}
                      size="sm"
                      className={showSoldCars ? "glass-button-primary" : "glass-button glass-text-primary"}
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      {showSoldCars ? "إخفاء المباعة" : "إظهار المباعة"}
                      {(stats as any)?.sold && (stats as any).sold > 0 && (
                        <span className="glass-badge mr-2 px-2 py-1 text-xs font-semibold rounded-full">
                          {(stats as any).sold}
                        </span>
                      )}
                    </Button>
                  )}

                  {/* Enhanced Filter Toggle Button */}
                  <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant={filtersOpen ? "default" : "outline"}
                        size="sm" 
                        className={`glass-toggle-button flex items-center gap-2 transition-all duration-300 hover:scale-105 ${
                          filtersOpen 
                            ? "glass-button-primary shadow-lg" 
                            : "glass-button hover:shadow-md"
                        }`}
                      >
                        <Filter size={16} className={filtersOpen ? "text-white" : ""} />
                        الفلاتر
                        <div className={`transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`}>
                          <ChevronDown size={16} className={filtersOpen ? "text-white" : ""} />
                        </div>
                        {/* Active Filters Indicator */}
                        {((manufacturerFilter?.length || 0) + (categoryFilter?.length || 0) + (trimLevelFilter?.length || 0) + 
                          (yearFilter?.length || 0) + (engineCapacityFilter?.length || 0) + (exteriorColorFilter?.length || 0) + 
                          (interiorColorFilter?.length || 0) + (statusFilter?.length || 0) + (importTypeFilter?.length || 0) + (ownershipTypeFilter?.length || 0)) > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1 animate-pulse">
                            {(manufacturerFilter?.length || 0) + (categoryFilter?.length || 0) + (trimLevelFilter?.length || 0) + 
                             (yearFilter?.length || 0) + (engineCapacityFilter?.length || 0) + (exteriorColorFilter?.length || 0) + 
                             (interiorColorFilter?.length || 0) + (statusFilter?.length || 0) + (importTypeFilter?.length || 0) + (ownershipTypeFilter?.length || 0)}
                          </span>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-4 w-full">
                      <Card className="glass-collapsible w-full border-0 shadow-xl backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 dark:from-slate-800/20 dark:to-slate-900/10">
                        <CardContent className="p-6 relative overflow-hidden">
                          {/* Decorative Elements */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-custom-primary/10 to-transparent rounded-full blur-3xl"></div>
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-2xl"></div>
                          {/* Enhanced Filter Controls with Desktop-Optimized Layout */}
                          <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-top-5 relative z-10"
                            style={{ minHeight: "400px" }} // Ensure adequate space for desktop viewing
                          >
                            
                            {/* Filter Header */}
                            <div className="flex items-center justify-between border-b border-white/20 dark:border-slate-700/50 pb-3">
                              <h2 className="text-lg font-semibold glass-text-primary flex items-center gap-2">
                                <Filter size={20} className="text-custom-primary" />
                                فلاتر البحث المتقدم
                              </h2>
                              <div className="flex items-center gap-2 text-sm glass-text-secondary">
                                <span className="animate-pulse">🔍</span>
                                <span>اختر الفلاتر المطلوبة</span>
                              </div>
                            </div>
                            
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
                                    <h3 className="text-sm font-medium glass-text-primary">{title}</h3>
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                      <span className="text-xs glass-text-secondary">
                                        {selectedFilters.length > 0 ? `(${selectedFilters.length} محدد)` : ""}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onToggleChange(!toggleState)}
                                        className="glass-button p-2 h-8 w-8"
                                      >
                                        {toggleState ? (
                                          <Eye size={16} className="glass-text-accent" />
                                        ) : (
                                          <EyeOff size={16} className="glass-text-secondary" />
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
                                                className={`glass-button transition-all duration-200 whitespace-nowrap relative ${
                                                  isSelected
                                                    ? "glass-button-primary"
                                                    : "glass-button"
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
                                <div className="space-y-6">
                                  {/* Master Filter Controls */}

                                  
                                  {/* Single Row Filters Layout */}
                                  <div className="flex flex-wrap gap-3 items-center">
                                    {/* Manufacturer Filter */}
                                    <div className="min-w-[150px]">
                                      <Select
                                        value={manufacturerFilter.length > 0 ? `${manufacturerFilter.length} محدد` : ""}
                                        onValueChange={() => {}}
                                      >
                                        <SelectTrigger className="glass-button border-white/20 text-white">
                                          <SelectValue placeholder="الصانع" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800/95 border-white/20 backdrop-blur-xl">
                                          {manufacturers.map((manufacturer) => (
                                            <SelectItem
                                              key={manufacturer}
                                              value={manufacturer}
                                              className="text-white hover:bg-white/20 cursor-pointer"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                toggleFilter(manufacturerFilter, setManufacturerFilter, manufacturer);
                                              }}
                                            >
                                              <div className="flex items-center justify-between w-full">
                                                <span>{manufacturer}</span>
                                                <div className="flex items-center gap-2">
                                                  {manufacturerFilter.includes(manufacturer) && (
                                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                  )}
                                                  <span className="text-xs text-white/60">({getFilterCount("manufacturer", manufacturer)})</span>
                                                </div>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Category Filter */}
                                    <div className="min-w-[150px]">
                                      <Select
                                        value={categoryFilter.length > 0 ? `${categoryFilter.length} محدد` : ""}
                                        onValueChange={() => {}}
                                      >
                                        <SelectTrigger className="glass-button border-white/20 text-white">
                                          <SelectValue placeholder="الفئة" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800/95 border-white/20 backdrop-blur-xl">
                                          {categories.map((category) => (
                                            <SelectItem
                                              key={category}
                                              value={category}
                                              className="text-white hover:bg-white/20 cursor-pointer"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                toggleFilter(categoryFilter, setCategoryFilter, category);
                                              }}
                                            >
                                              <div className="flex items-center justify-between w-full">
                                                <span>{category}</span>
                                                <div className="flex items-center gap-2">
                                                  {categoryFilter.includes(category) && (
                                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                  )}
                                                  <span className="text-xs text-white/60">({getFilterCount("category", category)})</span>
                                                </div>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Trim Level Filter */}
                                    <div className="min-w-[150px]">
                                      <Select
                                        value={trimLevelFilter.length > 0 ? `${trimLevelFilter.length} محدد` : ""}
                                        onValueChange={() => {}}
                                      >
                                        <SelectTrigger className="glass-button border-white/20 text-white">
                                          <SelectValue placeholder="درجة التجهيز" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800/95 border-white/20 backdrop-blur-xl">
                                          {availableTrimLevels.map((trimLevel) => (
                                            <SelectItem
                                              key={trimLevel}
                                              value={trimLevel}
                                              className="text-white hover:bg-white/20 cursor-pointer"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                toggleFilter(trimLevelFilter, setTrimLevelFilter, trimLevel);
                                              }}
                                            >
                                              <div className="flex items-center justify-between w-full">
                                                <span>{trimLevel}</span>
                                                <div className="flex items-center gap-2">
                                                  {trimLevelFilter.includes(trimLevel) && (
                                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                  )}
                                                  <span className="text-xs text-white/60">({getFilterCount("trimLevel", trimLevel)})</span>
                                                </div>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Year Filter */}
                                    <div className="min-w-[120px]">
                                      <Select
                                        value={yearFilter.length > 0 ? `${yearFilter.length} محدد` : ""}
                                        onValueChange={() => {}}
                                      >
                                        <SelectTrigger className="glass-button border-white/20 text-white">
                                          <SelectValue placeholder="السنة" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800/95 border-white/20 backdrop-blur-xl">
                                          {availableYears.map((year) => (
                                            <SelectItem
                                              key={year}
                                              value={year}
                                              className="text-white hover:bg-white/20 cursor-pointer"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                toggleFilter(yearFilter, setYearFilter, year);
                                              }}
                                            >
                                              <div className="flex items-center justify-between w-full">
                                                <span>{year}</span>
                                                <div className="flex items-center gap-2">
                                                  {yearFilter.includes(year) && (
                                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                  )}
                                                  <span className="text-xs text-white/60">({getFilterCount("year", year)})</span>
                                                </div>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Engine Capacity Filter */}
                                    <div className="min-w-[150px]">
                                      <Select
                                        value={engineCapacityFilter.length > 0 ? `${engineCapacityFilter.length} محدد` : ""}
                                        onValueChange={() => {}}
                                      >
                                        <SelectTrigger className="glass-button border-white/20 text-white">
                                          <SelectValue placeholder="سعة المحرك" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800/95 border-white/20 backdrop-blur-xl">
                                          {availableEngineCapacities.map((capacity) => (
                                            <SelectItem
                                              key={capacity}
                                              value={capacity}
                                              className="text-white hover:bg-white/20 cursor-pointer"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                toggleFilter(engineCapacityFilter, setEngineCapacityFilter, capacity);
                                              }}
                                            >
                                              <div className="flex items-center justify-between w-full">
                                                <span>{capacity}</span>
                                                <div className="flex items-center gap-2">
                                                  {engineCapacityFilter.includes(capacity) && (
                                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                  )}
                                                  <span className="text-xs text-white/60">({getFilterCount("engineCapacity", capacity)})</span>
                                                </div>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    {/* Exterior Color Filter */}
                                    <div className="min-w-[150px]">
                                      <Select
                                        value={exteriorColorFilter.length > 0 ? `${exteriorColorFilter.length} محدد` : ""}
                                        onValueChange={() => {}}
                                      >
                                        <SelectTrigger className="glass-button border-white/20 text-white">
                                          <SelectValue placeholder="اللون الخارجي" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800/95 border-white/20 backdrop-blur-xl">
                                          {availableExteriorColors.map((color) => (
                                            <SelectItem
                                              key={color}
                                              value={color}
                                              className="text-white hover:bg-white/20 cursor-pointer"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                toggleFilter(exteriorColorFilter, setExteriorColorFilter, color);
                                              }}
                                            >
                                              <div className="flex items-center justify-between w-full">
                                                <span>{color}</span>
                                                <div className="flex items-center gap-2">
                                                  {exteriorColorFilter.includes(color) && (
                                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                  )}
                                                  <span className="text-xs text-white/60">({getFilterCount("exteriorColor", color)})</span>
                                                </div>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Interior Color Filter */}
                                    <div className="min-w-[150px]">
                                      <Select
                                        value={interiorColorFilter.length > 0 ? `${interiorColorFilter.length} محدد` : ""}
                                        onValueChange={() => {}}
                                      >
                                        <SelectTrigger className="glass-button border-white/20 text-white">
                                          <SelectValue placeholder="اللون الداخلي" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800/95 border-white/20 backdrop-blur-xl">
                                          {availableInteriorColors.map((color) => (
                                            <SelectItem
                                              key={color}
                                              value={color}
                                              className="text-white hover:bg-white/20 cursor-pointer"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                toggleFilter(interiorColorFilter, setInteriorColorFilter, color);
                                              }}
                                            >
                                              <div className="flex items-center justify-between w-full">
                                                <span>{color}</span>
                                                <div className="flex items-center gap-2">
                                                  {interiorColorFilter.includes(color) && (
                                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                  )}
                                                  <span className="text-xs text-white/60">({getFilterCount("interiorColor", color)})</span>
                                                </div>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    {/* Status Filter */}
                                    <div className="min-w-[120px]">
                                      <Select
                                        value={statusFilter.length > 0 ? `${statusFilter.length} محدد` : ""}
                                        onValueChange={() => {}}
                                      >
                                        <SelectTrigger className="glass-button border-white/20 text-white">
                                          <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800/95 border-white/20 backdrop-blur-xl">
                                          {availableStatuses.map((status) => (
                                            <SelectItem
                                              key={status}
                                              value={status}
                                              className="text-white hover:bg-white/20 cursor-pointer"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                toggleFilter(statusFilter, setStatusFilter, status);
                                              }}
                                            >
                                              <div className="flex items-center justify-between w-full">
                                                <span>{status}</span>
                                                <div className="flex items-center gap-2">
                                                  {statusFilter.includes(status) && (
                                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                  )}
                                                  <span className="text-xs text-white/60">({getFilterCount("status", status)})</span>
                                                </div>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Import Type Filter */}
                                    <div className="min-w-[150px]">
                                      <Select
                                        value={importTypeFilter.length > 0 ? `${importTypeFilter.length} محدد` : ""}
                                        onValueChange={() => {}}
                                      >
                                        <SelectTrigger className="glass-button border-white/20 text-white">
                                          <SelectValue placeholder="نوع الاستيراد" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800/95 border-white/20 backdrop-blur-xl">
                                          {availableImportTypes.map((importType) => (
                                            <SelectItem
                                              key={importType}
                                              value={importType}
                                              className="text-white hover:bg-white/20 cursor-pointer"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                toggleFilter(importTypeFilter, setImportTypeFilter, importType);
                                              }}
                                            >
                                              <div className="flex items-center justify-between w-full">
                                                <span>{importType}</span>
                                                <div className="flex items-center gap-2">
                                                  {importTypeFilter.includes(importType) && (
                                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                  )}
                                                  <span className="text-xs text-white/60">({getFilterCount("importType", importType)})</span>
                                                </div>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Ownership Type Filter */}
                                    <div className="min-w-[150px]">
                                      <Select
                                        value={ownershipTypeFilter.length > 0 ? `${ownershipTypeFilter.length} محدد` : ""}
                                        onValueChange={() => {}}
                                      >
                                        <SelectTrigger className="glass-button border-white/20 text-white">
                                          <SelectValue placeholder="نوع الملكية" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800/95 border-white/20 backdrop-blur-xl">
                                          {availableOwnershipTypes.map((ownershipType) => (
                                            <SelectItem
                                              key={ownershipType}
                                              value={ownershipType}
                                              className="text-white hover:bg-white/20 cursor-pointer"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                toggleFilter(ownershipTypeFilter, setOwnershipTypeFilter, ownershipType);
                                              }}
                                            >
                                              <div className="flex items-center justify-between w-full">
                                                <span>{ownershipType}</span>
                                                <div className="flex items-center gap-2">
                                                  {ownershipTypeFilter.includes(ownershipType) && (
                                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                  )}
                                                  <span className="text-xs text-white/60">({getFilterCount("ownershipType", ownershipType)})</span>
                                                </div>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Date Range Filter */}
                                    <div className="min-w-[280px] space-y-2">
                                      <div className="text-sm text-white mb-2">المدة من والي</div>
                                      <div className="flex gap-2">
                                        <div className="flex-1">
                                          <input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-custom-primary focus:border-transparent"
                                            placeholder="من تاريخ"
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-custom-primary focus:border-transparent"
                                            placeholder="إلى تاريخ"
                                          />
                                        </div>
                                      </div>
                                      {(fromDate || toDate) && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setFromDate("");
                                            setToDate("");
                                          }}
                                          className="text-red-400 hover:text-red-300 text-xs p-1 h-6"
                                        >
                                          مسح التواريخ
                                        </Button>
                                      )}
                                    </div>

                                    {/* Clear All Filters Button */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setManufacturerFilter([]);
                                        setCategoryFilter([]);
                                        setTrimLevelFilter([]);
                                        setYearFilter([]);
                                        setEngineCapacityFilter([]);
                                        setExteriorColorFilter([]);
                                        setInteriorColorFilter([]);
                                        setStatusFilter([]);
                                        setImportTypeFilter([]);
                                        setOwnershipTypeFilter([]);
                                        setFromDate("");
                                        setToDate("");
                                      }}
                                      className="glass-button border-red-400/30 text-red-300 hover:bg-red-500/20 min-w-[100px]"
                                    >
                                      مسح الكل
                                    </Button>
                                  </div>
                                </div>
                              );
                            })()}

                {/* Reset Filters Button - Enhanced for Desktop */}
                <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      إجمالي الفلاتر النشطة: {
                        (manufacturerFilter?.length || 0) + (categoryFilter?.length || 0) + (trimLevelFilter?.length || 0) + 
                        (yearFilter?.length || 0) + (engineCapacityFilter?.length || 0) + (exteriorColorFilter?.length || 0) + 
                        (interiorColorFilter?.length || 0) + (statusFilter?.length || 0) + (importTypeFilter?.length || 0) + (ownershipTypeFilter?.length || 0) + 
                        (fromDate ? 1 : 0) + (toDate ? 1 : 0)
                      } فلتر
                    </div>
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
                        setFromDate("");
                        setToDate("");
                      }}
                      className="glass-button hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-900/20 min-w-[140px]"
                    >
                      إعادة تعيين الفلاتر
                    </Button>
                  </div>
                </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                    </Collapsible>
                </div>
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
          fromDate={fromDate}
          toDate={toDate}
          showSoldCars={showSoldCars}
          userRole={userRole}
          username={username}
          onEdit={handleEdit}
        />

        {/* Filtered Vehicles Statistics */}
        <Card className="glass-container mt-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(() => {
                // Apply the same filtering logic as InventoryTable
                const filteredItems = items.filter((item: InventoryItem) => {
                  const matchesSearch = !searchQuery || 
                    Object.values(item).some(value => 
                      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
                    );
                  const matchesManufacturer = manufacturerFilter.length === 0 || manufacturerFilter.includes(item.manufacturer || "");
                  const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(item.category || "");
                  const matchesTrimLevel = trimLevelFilter.length === 0 || trimLevelFilter.includes(item.trimLevel || "");
                  const matchesYear = yearFilter.length === 0 || yearFilter.includes(String(item.year));
                  const matchesEngineCapacity = engineCapacityFilter.length === 0 || engineCapacityFilter.includes(item.engineCapacity || "");
                  const matchesInteriorColor = interiorColorFilter.length === 0 || interiorColorFilter.includes(item.interiorColor || "");
                  const matchesExteriorColor = exteriorColorFilter.length === 0 || exteriorColorFilter.includes(item.exteriorColor || "");
                  const matchesStatus = statusFilter.length === 0 || statusFilter.includes(item.status || "");
                  const matchesImportType = importTypeFilter.length === 0 || importTypeFilter.includes(item.importType || "");
                  const matchesOwnershipType = ownershipTypeFilter.length === 0 || ownershipTypeFilter.includes(item.ownershipType || "");
                  
                  // Date range filter
                  const matchesDateRange = (() => {
                    if (!fromDate && !toDate) return true;
                    
                    const itemDate = new Date(item.entryDate);
                    const from = fromDate ? new Date(fromDate) : null;
                    const to = toDate ? new Date(toDate) : null;
                    
                    if (from && to) {
                      return itemDate >= from && itemDate <= to;
                    } else if (from) {
                      return itemDate >= from;
                    } else if (to) {
                      return itemDate <= to;
                    }
                    return true;
                  })();
                  
                  const matchesSoldFilter = showSoldCars ? true : item.status !== "مباع";
                  
                  // إخفاء السيارات ذات الحالة "خاص" أو "تشغيل" عن الأدوار المحدودة
                  const restrictedRoles = ['salesperson', 'user', 'bank_accountant', 'seller'];
                  const isRestrictedVehicle = item.status === "خاص" || item.status === "تشغيل";
                  const matchesRoleFilter = restrictedRoles.includes(userRole) ? !isRestrictedVehicle : true;
                  
                  return matchesSearch && matchesManufacturer && matchesCategory && matchesTrimLevel && matchesYear && matchesEngineCapacity && matchesInteriorColor && matchesExteriorColor && matchesStatus && matchesImportType && matchesOwnershipType && matchesDateRange && matchesSoldFilter && matchesRoleFilter;
                });

                const stats = {
                  total: filteredItems.length,
                  available: filteredItems.filter(item => item.status === "متوفر").length,
                  inTransit: filteredItems.filter(item => item.status === "في الطريق").length,
                  maintenance: filteredItems.filter(item => item.status === "صيانة").length,
                  reserved: filteredItems.filter(item => item.status === "محجوز").length,
                  sold: filteredItems.filter(item => item.status === "مباع").length,
                };

                return (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white drop-shadow-lg">{stats.total}</div>
                      <div className="text-sm text-white/80 drop-shadow">الإجمالي</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400 drop-shadow-lg">{stats.available}</div>
                      <div className="text-sm text-white/80 drop-shadow">متوفر</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400 drop-shadow-lg">{stats.inTransit}</div>
                      <div className="text-sm text-white/80 drop-shadow">في الطريق</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400 drop-shadow-lg">{stats.maintenance}</div>
                      <div className="text-sm text-white/80 drop-shadow">صيانة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400 drop-shadow-lg">{stats.reserved}</div>
                      <div className="text-sm text-white/80 drop-shadow">محجوز</div>
                    </div>
                    {showSoldCars && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400 drop-shadow-lg">{stats.sold}</div>
                        <div className="text-sm text-white/80 drop-shadow">مباع</div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="text-center text-sm text-white/70 drop-shadow">
                إحصائيات السيارات الظاهرة في الجدول حسب الفلاتر المطبقة
              </div>
            </div>
          </CardContent>
        </Card>


      </main>



      {/* Add/Edit Form */}
      <InventoryForm 
        open={formOpen} 
        onOpenChange={handleFormClose} 
        editItem={editItem}
      />







      {/* Advanced Print Dialog */}
      <AdvancedPrintDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
      />

      {/* Excel Import Dialog */}
      <ExcelImportDialog
        open={excelImportDialogOpen}
        onOpenChange={setExcelImportDialogOpen}
      />
      </div>
    </SystemGlassWrapper>
  );
}
