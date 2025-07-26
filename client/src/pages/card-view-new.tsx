import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Bell, 
  Settings, 
  Users, 
  Palette, 
  Building2,
  LogOut,
  Home,
  MessageSquare,
  Filter,
  Edit3,
  Edit2,
  ShoppingCart,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Moon,
  Sun,
  Calendar,
  X,
  Share2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  CreditCard,
  Plus
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import { CardViewFAB } from "@/components/animated-fab";
import InventoryFormSimple from "@/components/inventory-form-simple";
import VehicleShare from "@/components/vehicle-share";
import SpecificationsManagement from "@/components/specifications-management";
import QuotationManagement from "@/components/quotation-management";
import { ManufacturerLogo } from "@/components/manufacturer-logo";
import MultiSelectFilter from "@/components/multi-select-filter";
import { ReservationDialog } from "@/components/reservation-dialog";
import SystemGlassWrapper from "@/components/system-glass-wrapper";

import type { InventoryItem } from "@shared/schema";

interface CardViewPageProps {
  userRole: string;
  username: string;
  onLogout: () => void;
}

export default function CardViewPage({ userRole, username, onLogout }: CardViewPageProps) {
  const { companyName, companyLogo, darkMode, toggleDarkMode, isUpdatingDarkMode } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [expandedManufacturer, setExpandedManufacturer] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [sellingItemId, setSellingItemId] = useState<number | null>(null);
  const [cancelingReservationId, setCancelingReservationId] = useState<number | null>(null);
  const [reserveItem, setReserveItem] = useState<InventoryItem | undefined>();
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Multiple selection filter arrays
  const [selectedManufacturer, setSelectedManufacturer] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedTrimLevel, setSelectedTrimLevel] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string[]>([]);
  const [selectedEngineCapacity, setSelectedEngineCapacity] = useState<string[]>([]);
  const [selectedInteriorColor, setSelectedInteriorColor] = useState<string[]>([]);
  const [selectedExteriorColor, setSelectedExteriorColor] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedImportType, setSelectedImportType] = useState<string[]>([]);
  const [selectedOwnershipType, setSelectedOwnershipType] = useState<string[]>([]);
  const [showSoldCars, setShowSoldCars] = useState<boolean>(false);
  const [shareVehicle, setShareVehicle] = useState<InventoryItem | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [specificationsOpen, setSpecificationsOpen] = useState(false);
  const [quotationManagementOpen, setQuotationManagementOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Toggle states for individual filters - default to false (closed)
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

  // Toggle filter function for multiple selection
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

  const { data: inventoryData = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: manufacturerStats = [] } = useQuery<Array<{
    manufacturer: string;
    total: number;
    personal: number;
    company: number;
    usedPersonal: number;
    logo: string | null;
  }>>({
    queryKey: ["/api/inventory/manufacturer-stats"],
  });

  // Filter out sold cars from display unless showSoldCars is true
  const availableItems = showSoldCars ? inventoryData : inventoryData.filter(item => item.status !== "مباع");

  // Function to get import type icon based on data
  const getImportTypeIcon = (importType: string) => {
    if (importType.includes("مستعمل")) return "/import-type-secondhand.svg";
    if (importType.includes("شركة")) return "/import-type-company.svg";
    if (importType.includes("شخصي")) return "/import-type-personal.svg"; 
    return "/import-type.svg"; // fallback
  };

  // Get count for each filter option - dynamically based on previously applied filters
  const getFilterCount = (field: keyof InventoryItem, value: string) => {
    const availableData = showSoldCars ? inventoryData : inventoryData.filter(item => item.status !== "مباع");
    
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
        if (selectedManufacturer.length > 0 && !selectedManufacturer.includes(item.manufacturer || "")) return false;
        return true;
      }
      
      if (field === "trimLevel") {
        // Apply manufacturer and category filters
        if (selectedManufacturer.length > 0 && !selectedManufacturer.includes(item.manufacturer || "")) return false;
        if (selectedCategory.length > 0 && !selectedCategory.includes(item.category || "")) return false;
        return true;
      }
      
      if (field === "year") {
        // Apply manufacturer, category, trimLevel filters
        if (selectedManufacturer.length > 0 && !selectedManufacturer.includes(item.manufacturer || "")) return false;
        if (selectedCategory.length > 0 && !selectedCategory.includes(item.category || "")) return false;
        if (selectedTrimLevel.length > 0 && !selectedTrimLevel.includes(item.trimLevel || "")) return false;
        return true;
      }
      
      if (field === "engineCapacity") {
        // Apply all previous filters
        if (selectedManufacturer.length > 0 && !selectedManufacturer.includes(item.manufacturer || "")) return false;
        if (selectedCategory.length > 0 && !selectedCategory.includes(item.category || "")) return false;
        if (selectedTrimLevel.length > 0 && !selectedTrimLevel.includes(item.trimLevel || "")) return false;
        if (selectedYear.length > 0 && !selectedYear.includes(String(item.year))) return false;
        return true;
      }
      
      if (field === "exteriorColor") {
        if (selectedManufacturer.length > 0 && !selectedManufacturer.includes(item.manufacturer || "")) return false;
        if (selectedCategory.length > 0 && !selectedCategory.includes(item.category || "")) return false;
        if (selectedTrimLevel.length > 0 && !selectedTrimLevel.includes(item.trimLevel || "")) return false;
        if (selectedYear.length > 0 && !selectedYear.includes(String(item.year))) return false;
        if (selectedEngineCapacity.length > 0 && !selectedEngineCapacity.includes(item.engineCapacity || "")) return false;
        return true;
      }
      
      if (field === "interiorColor") {
        if (selectedManufacturer.length > 0 && !selectedManufacturer.includes(item.manufacturer || "")) return false;
        if (selectedCategory.length > 0 && !selectedCategory.includes(item.category || "")) return false;
        if (selectedTrimLevel.length > 0 && !selectedTrimLevel.includes(item.trimLevel || "")) return false;
        if (selectedYear.length > 0 && !selectedYear.includes(String(item.year))) return false;
        if (selectedEngineCapacity.length > 0 && !selectedEngineCapacity.includes(item.engineCapacity || "")) return false;
        if (selectedExteriorColor.length > 0 && !selectedExteriorColor.includes(item.exteriorColor || "")) return false;
        return true;
      }
      
      if (field === "status") {
        if (selectedManufacturer.length > 0 && !selectedManufacturer.includes(item.manufacturer || "")) return false;
        if (selectedCategory.length > 0 && !selectedCategory.includes(item.category || "")) return false;
        if (selectedTrimLevel.length > 0 && !selectedTrimLevel.includes(item.trimLevel || "")) return false;
        if (selectedYear.length > 0 && !selectedYear.includes(String(item.year))) return false;
        if (selectedEngineCapacity.length > 0 && !selectedEngineCapacity.includes(item.engineCapacity || "")) return false;
        if (selectedExteriorColor.length > 0 && !selectedExteriorColor.includes(item.exteriorColor || "")) return false;
        if (selectedInteriorColor.length > 0 && !selectedInteriorColor.includes(item.interiorColor || "")) return false;
        return true;
      }
      
      if (field === "importType") {
        // Apply all previous filters
        if (selectedManufacturer.length > 0 && !selectedManufacturer.includes(item.manufacturer || "")) return false;
        if (selectedCategory.length > 0 && !selectedCategory.includes(item.category || "")) return false;
        if (selectedTrimLevel.length > 0 && !selectedTrimLevel.includes(item.trimLevel || "")) return false;
        if (selectedYear.length > 0 && !selectedYear.includes(String(item.year))) return false;
        if (selectedEngineCapacity.length > 0 && !selectedEngineCapacity.includes(item.engineCapacity || "")) return false;
        if (selectedExteriorColor.length > 0 && !selectedExteriorColor.includes(item.exteriorColor || "")) return false;
        if (selectedInteriorColor.length > 0 && !selectedInteriorColor.includes(item.interiorColor || "")) return false;
        if (selectedStatus.length > 0 && !selectedStatus.includes(item.status || "")) return false;
        return true;
      }
      
      return true;
    });
    
    // Return count based on value
    if (value === "الكل") {
      return filteredData.length;
    }
    
    // Special handling for year field to handle number/string comparison
    if (field === "year") {
      return filteredData.filter(item => String(item.year) === String(value)).length;
    }
    
    return filteredData.filter(item => item[field] === value).length;
  };

  // Apply search filter
  const searchFilteredItems = searchQuery.trim() === "" 
    ? availableItems 
    : availableItems.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
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
          item.notes?.toLowerCase().includes(query)
        );
      });

  // Filter Arrays - removed, now using dynamic data
  
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
  
  // Get dynamic filter arrays based on currently applied filters
  const getFilteredUniqueValues = (field: keyof InventoryItem, appliedFilters: Record<string, string>) => {
    const availableData = inventoryData.filter(item => !showSoldCars ? !item.isSold : true);
    
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
      if (appliedFilters.manufacturer && appliedFilters.manufacturer !== "الكل" && item.manufacturer !== appliedFilters.manufacturer) return false;
      if (appliedFilters.category && appliedFilters.category !== "الكل" && item.category !== appliedFilters.category) return false;
      if (appliedFilters.trimLevel && appliedFilters.trimLevel !== "الكل" && item.trimLevel !== appliedFilters.trimLevel) return false;
      if (appliedFilters.year && appliedFilters.year !== "الكل" && String(item.year) !== appliedFilters.year) return false;
      if (appliedFilters.engineCapacity && appliedFilters.engineCapacity !== "الكل" && item.engineCapacity !== appliedFilters.engineCapacity) return false;
      if (appliedFilters.exteriorColor && appliedFilters.exteriorColor !== "الكل" && item.exteriorColor !== appliedFilters.exteriorColor) return false;
      if (appliedFilters.interiorColor && appliedFilters.interiorColor !== "الكل" && item.interiorColor !== appliedFilters.interiorColor) return false;
      if (appliedFilters.status && appliedFilters.status !== "الكل" && item.status !== appliedFilters.status) return false;
      
      return true;
    });
    
    const values = filteredData
      .map(item => item[field])
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    return values;
  };

  // Get dynamic available options based on current filter selections
  const getFilteredAvailableOptions = (field: keyof InventoryItem): string[] => {
    const availableData = showSoldCars ? inventoryData : inventoryData.filter(item => item.status !== "مباع");
    
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

      // Apply filters based on hierarchy - each filter depends on previous ones
      if (field !== "manufacturer" && selectedManufacturer.length > 0 && !selectedManufacturer.includes(item.manufacturer || "")) return false;
      if (field !== "category" && field !== "manufacturer" && selectedCategory.length > 0 && !selectedCategory.includes(item.category || "")) return false;
      if (field !== "trimLevel" && field !== "category" && field !== "manufacturer" && selectedTrimLevel.length > 0 && !selectedTrimLevel.includes(item.trimLevel || "")) return false;
      if (field !== "year" && field !== "trimLevel" && field !== "category" && field !== "manufacturer" && selectedYear.length > 0 && !selectedYear.includes(String(item.year))) return false;
      if (field !== "engineCapacity" && field !== "year" && field !== "trimLevel" && field !== "category" && field !== "manufacturer" && selectedEngineCapacity.length > 0 && !selectedEngineCapacity.includes(item.engineCapacity || "")) return false;
      if (field !== "exteriorColor" && field !== "engineCapacity" && field !== "year" && field !== "trimLevel" && field !== "category" && field !== "manufacturer" && selectedExteriorColor.length > 0 && !selectedExteriorColor.includes(item.exteriorColor || "")) return false;
      if (field !== "interiorColor" && field !== "exteriorColor" && field !== "engineCapacity" && field !== "year" && field !== "trimLevel" && field !== "category" && field !== "manufacturer" && selectedInteriorColor.length > 0 && !selectedInteriorColor.includes(item.interiorColor || "")) return false;
      if (field !== "status" && field !== "interiorColor" && field !== "exteriorColor" && field !== "engineCapacity" && field !== "year" && field !== "trimLevel" && field !== "category" && field !== "manufacturer" && selectedStatus.length > 0 && !selectedStatus.includes(item.status || "")) return false;
      if (field !== "importType" && field !== "status" && field !== "interiorColor" && field !== "exteriorColor" && field !== "engineCapacity" && field !== "year" && field !== "trimLevel" && field !== "category" && field !== "manufacturer" && selectedImportType.length > 0 && !selectedImportType.includes(item.importType || "")) return false;
      
      return true;
    });
    
    const values = filteredData
      .map(item => field === "year" ? String(item[field]) : item[field])
      .filter((value, index, self) => value != null && value !== "" && self.indexOf(value) === index)
      .sort();
      
    return values as string[];
  };

  const availableManufacturers = getFilteredAvailableOptions("manufacturer");
  const availableCategories = getFilteredAvailableOptions("category");
  const availableTrimLevels = getFilteredAvailableOptions("trimLevel");
  const availableYears = getFilteredAvailableOptions("year").sort((a: string, b: string) => parseInt(b) - parseInt(a));
  const availableEngineCapacities = getFilteredAvailableOptions("engineCapacity");
  const availableExteriorColors = getFilteredAvailableOptions("exteriorColor");
  const availableInteriorColors = getFilteredAvailableOptions("interiorColor");
  const availableStatuses = getFilteredAvailableOptions("status");
  const availableImportTypes = getFilteredAvailableOptions("importType");
  const availableOwnershipTypes = getFilteredAvailableOptions("ownershipType");
  
  // Count active filters
  const getActiveFilterCount = () => {
    return selectedManufacturer.length + selectedCategory.length + selectedTrimLevel.length + 
           selectedYear.length + selectedEngineCapacity.length + selectedExteriorColor.length + 
           selectedInteriorColor.length + selectedStatus.length + selectedImportType.length + 
           selectedOwnershipType.length;
  };

  const activeFiltersCount = getActiveFilterCount();
  
  // Reset category filter when manufacturer changes
  const handleManufacturerChange = (value: string) => {
    toggleFilter(selectedManufacturer, setSelectedManufacturer, value);
    setSelectedCategory([]);
  };

  // Apply all multiple selection filters
  const filteredItems = searchFilteredItems.filter(item => {
    return (
      (selectedManufacturer.length === 0 || selectedManufacturer.includes(item.manufacturer || "")) &&
      (selectedCategory.length === 0 || selectedCategory.includes(item.category || "")) &&
      (selectedTrimLevel.length === 0 || selectedTrimLevel.includes(item.trimLevel || "")) &&
      (selectedYear.length === 0 || selectedYear.includes(String(item.year))) &&
      (selectedEngineCapacity.length === 0 || selectedEngineCapacity.includes(item.engineCapacity || "")) &&
      (selectedInteriorColor.length === 0 || selectedInteriorColor.includes(item.interiorColor || "")) &&
      (selectedExteriorColor.length === 0 || selectedExteriorColor.includes(item.exteriorColor || "")) &&
      (selectedStatus.length === 0 || selectedStatus.includes(item.status || "")) &&
      (selectedImportType.length === 0 || selectedImportType.includes(item.importType || "")) &&
      (selectedOwnershipType.length === 0 || selectedOwnershipType.includes(item.ownershipType || ""))
    );
  });

  // Group ALL items by manufacturer first (including sold cars for count calculation)
  const allGroupedData = inventoryData.reduce((acc, item) => {
    if (!acc[item.manufacturer]) {
      acc[item.manufacturer] = {
        items: [],
        logo: null,
      };
    }
    acc[item.manufacturer].items.push(item);
    return acc;
  }, {} as Record<string, { items: InventoryItem[], logo: string | null }>);

  // Then filter for display (only available items)
  const groupedData = filteredItems.reduce((acc, item) => {
    if (!acc[item.manufacturer]) {
      acc[item.manufacturer] = {
        items: [],
        logo: null,
      };
    }
    acc[item.manufacturer].items.push(item);
    return acc;
  }, {} as Record<string, { items: InventoryItem[], logo: string | null }>);

  // Get manufacturer logo
  const getManufacturerLogo = (manufacturerName: string) => {
    if (!manufacturerStats || !Array.isArray(manufacturerStats)) return null;
    const manufacturer = manufacturerStats.find((m: any) => m.manufacturer === manufacturerName);
    return manufacturer?.logo || null;
  };

  // Toggle manufacturer expansion
  const toggleManufacturer = (manufacturerName: string) => {
    setExpandedManufacturer(expandedManufacturer === manufacturerName ? null : manufacturerName);
  };

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/inventory/${id}`),
    onSuccess: () => {
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المركبة من المخزون",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      setItemToDelete(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف المركبة",
        variant: "destructive",
      });
    }
  });

  // Sell item mutation
  const sellItemMutation = useMutation({
    mutationFn: (id: number) => {
      setSellingItemId(id);
      return apiRequest("POST", `/api/inventory/${id}/sell`);
    },
    onSuccess: () => {
      toast({
        title: "تم البيع بنجاح",
        description: "تم تسجيل بيع المركبة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      setSellingItemId(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تسجيل بيع المركبة",
        variant: "destructive",
      });
      setSellingItemId(null);
    }
  });

  // Reserve item mutation
  // Reservation success handler
  const handleReservationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
  };

  // Cancel reservation mutation
  const cancelReservationMutation = useMutation({
    mutationFn: (id: number) => {
      setCancelingReservationId(id);
      return apiRequest("POST", `/api/inventory/${id}/cancel-reservation`);
    },
    onSuccess: () => {
      toast({
        title: "تم إلغاء الحجز",
        description: "تم إلغاء حجز المركبة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      setCancelingReservationId(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إلغاء حجز المركبة",
        variant: "destructive",
      });
      setCancelingReservationId(null);
    }
  });

  // Handle delete confirmation
  const handleDeleteItem = (item: InventoryItem) => {
    setItemToDelete(item);
  };

  // Handle sell item
  const handleSellItem = (item: InventoryItem) => {
    // Prevent multiple calls by checking if already processing
    if (sellingItemId !== null) return;
    sellItemMutation.mutate(item.id);
  };

  // Handle reserve item
  const handleReserveItem = (item: InventoryItem) => {
    setReserveItem(item);
    setReserveDialogOpen(true);
  };

  // Handle cancel reservation
  const handleCancelReservation = (item: InventoryItem) => {
    if (cancelingReservationId !== null) return;
    cancelReservationMutation.mutate(item.id);
  };

  // Handle edit item
  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleShareItem = (item: InventoryItem) => {
    setShareVehicle(item);
    setShareDialogOpen(true);
  };

  const handleCreateQuote = (item: InventoryItem) => {
    // Store vehicle data in localStorage for the quotation creation page
    localStorage.setItem('selectedVehicleForQuote', JSON.stringify(item));
    // Navigate to quotation creation page
    window.location.href = '/quotation-creation';
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case "متوفر":
        return "bg-green-100 text-green-800 border-green-200";
      case "في الطريق":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "قيد الصيانة":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "محجوز":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-950 relative overflow-hidden" dir="rtl">
      {/* Animated Mesh Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-teal-500 to-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-10 right-20 w-72 h-72 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000"></div>
      </div>
      <div className="relative z-10" dir="rtl">
      {/* Header */}
      <header className="glass-container sticky top-0 z-50 border-b border-white/20 dark:border-slate-700/30">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Company Name */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shadow-lg overflow-hidden hover:scale-110 transition-all duration-300" style={{ backgroundColor: '#00627F' }}>
                  {companyLogo ? (
                    <img 
                      src={companyLogo} 
                      alt="شعار الشركة" 
                      className="w-full h-full object-contain hover:animate-none transition-all duration-[3s]"
                      style={{ animation: 'bounce 3s infinite' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img 
                        src="/copmany logo.svg" 
                        alt="شعار البريمي للسيارات" 
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain hover:animate-none transition-all duration-[3s]"
                        style={{ animation: 'spin 4s linear infinite' }}
                      />
                    </div>
                  )}
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg hover:text-amber-400 transition-colors duration-300">{companyName}</h1>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2 space-x-reverse">
              {/* Add Item Button */}
              <Button 
                variant="default" 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setEditingItem(null);
                  setShowEditDialog(true);
                }}
              >
                <Plus size={16} className="ml-1" />
                <span className="hidden sm:inline">إضافة عنصر</span>
                <span className="sm:hidden">إضافة</span>
              </Button>

              {/* Home Button */}
              <Link href="/">
                <Button variant="outline" size="sm" className="glass-button glass-text-primary">
                  <Home size={16} className="ml-1" />
                  <span className="hidden sm:inline">الرئيسية</span>
                </Button>
              </Link>

              {/* Appearance Management Button - Admin Only */}
              {userRole === "admin" && (
                <Link href="/appearance">
                  <Button variant="outline" size="sm" className="glass-button glass-text-primary">
                    <Palette size={16} className="ml-1" />
                    <span className="hidden sm:inline">إدارة المظهر</span>
                    <span className="sm:hidden">المظهر</span>
                  </Button>
                </Link>
              )}

              {/* Admin Dropdown Menu */}
              {userRole === "admin" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="glass-button glass-text-primary p-2">
                      <Settings size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-dropdown-content w-56">
                    <Link href="/appearance">
                      <DropdownMenuItem>
                        <Palette className="mr-2 h-4 w-4" />
                        إدارة المظهر
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/user-management">
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        إدارة المستخدمين
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => setSpecificationsOpen(true)}>
                      <FileText className="mr-2 h-4 w-4" />
                      إدارة المواصفات
                    </DropdownMenuItem>
                    <Link href="/quotation-management">
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        العروض المحفوظة
                      </DropdownMenuItem>
                    </Link>
                    
                    <Link href="/integration-management">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        إدارة التكامل
                      </DropdownMenuItem>
                    </Link>

                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Bank Header Icons */}
              <div className="flex items-center space-x-1 space-x-reverse">
                <Link href="/banks-company">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="glass-button glass-text-primary p-2" 
                    title="بنوك الشركة"
                    onMouseDown={(e) => {
                      const longPressTimer = setTimeout(() => {
                        const currentUrl = window.location.origin + "/banks-company";
                        if (navigator.share) {
                          navigator.share({
                            title: "بنوك الشركة",
                            text: "صفحة بنوك الشركة",
                            url: currentUrl
                          }).catch(() => {
                            navigator.clipboard.writeText(currentUrl);
                            toast({
                              title: "تم نسخ الرابط",
                              description: "تم نسخ رابط صفحة بنوك الشركة"
                            });
                          });
                        } else {
                          navigator.clipboard.writeText(currentUrl);
                          toast({
                            title: "تم نسخ الرابط",
                            description: "تم نسخ رابط صفحة بنوك الشركة"
                          });
                        }
                      }, 800);
                      
                      const clearTimer = () => {
                        clearTimeout(longPressTimer);
                        document.removeEventListener('mouseup', clearTimer);
                        document.removeEventListener('mouseleave', clearTimer);
                      };
                      
                      document.addEventListener('mouseup', clearTimer);
                      document.addEventListener('mouseleave', clearTimer);
                    }}
                  >
                    <Building2 size={18} />
                  </Button>
                </Link>
                <Link href="/banks-personal">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="glass-button glass-text-primary p-2" 
                    title="البنوك الشخصية"
                    onMouseDown={(e) => {
                      const longPressTimer = setTimeout(() => {
                        const currentUrl = window.location.origin + "/banks-personal";
                        if (navigator.share) {
                          navigator.share({
                            title: "البنوك الشخصية",
                            text: "صفحة البنوك الشخصية",
                            url: currentUrl
                          }).catch(() => {
                            navigator.clipboard.writeText(currentUrl);
                            toast({
                              title: "تم نسخ الرابط",
                              description: "تم نسخ رابط صفحة البنوك الشخصية"
                            });
                          });
                        } else {
                          navigator.clipboard.writeText(currentUrl);
                          toast({
                            title: "تم نسخ الرابط",
                            description: "تم نسخ رابط صفحة البنوك الشخصية"
                          });
                        }
                      }, 800);
                      
                      const clearTimer = () => {
                        clearTimeout(longPressTimer);
                        document.removeEventListener('mouseup', clearTimer);
                        document.removeEventListener('mouseleave', clearTimer);
                      };
                      
                      document.addEventListener('mouseup', clearTimer);
                      document.addEventListener('mouseleave', clearTimer);
                    }}
                  >
                    <CreditCard size={18} />
                  </Button>
                </Link>
              </div>

              {/* Dark Mode Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="glass-button glass-text-primary p-2" 
                onClick={toggleDarkMode}
                disabled={isUpdatingDarkMode}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </Button>

              {/* Logout Button */}
              <Button onClick={onLogout} variant="outline" size="sm" className="glass-button glass-text-primary">
                <LogOut size={16} className="ml-1" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 pr-28">
        <div className="mb-8 text-right">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2 text-right">عرض البطاقات التفصيلي</h1>
          <p className="text-slate-600 dark:text-slate-400 text-right">عرض جميع تفاصيل السيارات مجمعة حسب الصانع</p>
          
          {/* Search and Filter Section */}
          <div className="mt-6">
            {/* Search Input and Filter Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="relative max-w-md">
                <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="البحث في رقم الهيكل، الفئة، درجة التجهيز، اللون، الموقع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-search pr-10 pl-4 py-2 w-full text-right"
                />
              </div>
              
              {/* Filter Toggle Button - Right Aligned */}
              <div className="flex items-center justify-start w-full sm:w-auto">
                <div className="w-full">
                  <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <div className="flex justify-start w-full">
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="glass-toggle-button flex items-center gap-2"
                        >
                          <Filter size={16} />
                          الفلاتر
                          {activeFiltersCount > 0 && (
                            <span className="glass-badge text-xs px-2 py-1 rounded-full">
                              {activeFiltersCount}
                            </span>
                          )}
                          {filtersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  
                  <CollapsibleContent className="mt-4 w-full">
                    <Card className="glass-collapsible w-full">
                      <CardContent className="p-6 w-full">
                        {/* Enhanced Filter Controls with Button Design */}
                        <div className="space-y-6 animate-in fade-in duration-300">
                          
                          {/* Multi-Select Filter Component */}
                          {(() => {
                            const MultiSelectFilter = ({ title, items, selectedFilters, onFilterToggle, getCount, toggleState, onToggleChange }: {
                              title: string;
                              items: string[];
                              selectedFilters: string[];
                              onFilterToggle: (item: string) => void;
                              getCount: (item: string) => number;
                              toggleState: boolean;
                              onToggleChange: (state: boolean) => void;
                            }) => (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-medium text-white drop-shadow-md">{title}</h3>
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <span className="text-xs text-white/70 drop-shadow-sm">
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
                                                ? "glass-button-primary text-white drop-shadow-md"
                                                : "glass-text-primary hover:glass-button-secondary"
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
                                
                                {/* Individual Multiple Selection Filters */}
                                <div className="space-y-3">
                                  <MultiSelectFilter 
                                    title="الصانع" 
                                    items={availableManufacturers} 
                                    selectedFilters={selectedManufacturer} 
                                    onFilterToggle={(item) => toggleFilter(selectedManufacturer, setSelectedManufacturer, item)} 
                                    getCount={(item) => getFilterCount("manufacturer", item)} 
                                    toggleState={showManufacturerFilter}
                                    onToggleChange={setShowManufacturerFilter}
                                  />
                                  <MultiSelectFilter 
                                    title="الفئة" 
                                    items={availableCategories} 
                                    selectedFilters={selectedCategory} 
                                    onFilterToggle={(item) => toggleFilter(selectedCategory, setSelectedCategory, item)} 
                                    getCount={(item) => getFilterCount("category", item)} 
                                    toggleState={showCategoryFilter}
                                    onToggleChange={setShowCategoryFilter}
                                  />
                                  <MultiSelectFilter 
                                    title="درجة التجهيز" 
                                    items={availableTrimLevels} 
                                    selectedFilters={selectedTrimLevel} 
                                    onFilterToggle={(item) => toggleFilter(selectedTrimLevel, setSelectedTrimLevel, item)} 
                                    getCount={(item) => getFilterCount("trimLevel", item)} 
                                    toggleState={showTrimLevelFilter}
                                    onToggleChange={setShowTrimLevelFilter}
                                  />
                                  <MultiSelectFilter 
                                    title="السنة" 
                                    items={availableYears} 
                                    selectedFilters={selectedYear} 
                                    onFilterToggle={(item) => toggleFilter(selectedYear, setSelectedYear, item)} 
                                    getCount={(item) => getFilterCount("year", item)} 
                                    toggleState={showYearFilter}
                                    onToggleChange={setShowYearFilter}
                                  />
                                  <MultiSelectFilter 
                                    title="سعة المحرك" 
                                    items={availableEngineCapacities} 
                                    selectedFilters={selectedEngineCapacity} 
                                    onFilterToggle={(item) => toggleFilter(selectedEngineCapacity, setSelectedEngineCapacity, item)} 
                                    getCount={(item) => getFilterCount("engineCapacity", item)} 
                                    toggleState={showEngineCapacityFilter}
                                    onToggleChange={setShowEngineCapacityFilter}
                                  />
                                  <MultiSelectFilter 
                                    title="اللون الخارجي" 
                                    items={availableExteriorColors} 
                                    selectedFilters={selectedExteriorColor} 
                                    onFilterToggle={(item) => toggleFilter(selectedExteriorColor, setSelectedExteriorColor, item)} 
                                    getCount={(item) => getFilterCount("exteriorColor", item)} 
                                    toggleState={showExteriorColorFilter}
                                    onToggleChange={setShowExteriorColorFilter}
                                  />
                                  <MultiSelectFilter 
                                    title="اللون الداخلي" 
                                    items={availableInteriorColors} 
                                    selectedFilters={selectedInteriorColor} 
                                    onFilterToggle={(item) => toggleFilter(selectedInteriorColor, setSelectedInteriorColor, item)} 
                                    getCount={(item) => getFilterCount("interiorColor", item)} 
                                    toggleState={showInteriorColorFilter}
                                    onToggleChange={setShowInteriorColorFilter}
                                  />
                                  <MultiSelectFilter 
                                    title="الحالة" 
                                    items={availableStatuses} 
                                    selectedFilters={selectedStatus} 
                                    onFilterToggle={(item) => toggleFilter(selectedStatus, setSelectedStatus, item)} 
                                    getCount={(item) => getFilterCount("status", item)} 
                                    toggleState={showStatusFilter}
                                    onToggleChange={setShowStatusFilter}
                                  />
                                  <MultiSelectFilter 
                                    title="نوع الاستيراد" 
                                    items={availableImportTypes} 
                                    selectedFilters={selectedImportType} 
                                    onFilterToggle={(item) => toggleFilter(selectedImportType, setSelectedImportType, item)} 
                                    getCount={(item) => getFilterCount("importType", item)} 
                                    toggleState={showImportTypeFilter}
                                    onToggleChange={setShowImportTypeFilter}
                                  />
                                  <MultiSelectFilter 
                                    title="نوع الملكية" 
                                    items={availableOwnershipTypes} 
                                    selectedFilters={selectedOwnershipType} 
                                    onFilterToggle={(item) => toggleFilter(selectedOwnershipType, setSelectedOwnershipType, item)} 
                                    getCount={(item) => getFilterCount("ownershipType", item)} 
                                    toggleState={showOwnershipTypeFilter}
                                    onToggleChange={setShowOwnershipTypeFilter}
                                  />
                                  
                                  {/* Reset Filters Button */}
                                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedManufacturer([]);
                                        setSelectedCategory([]);
                                        setSelectedTrimLevel([]);
                                        setSelectedYear([]);
                                        setSelectedEngineCapacity([]);
                                        setSelectedInteriorColor([]);
                                        setSelectedExteriorColor([]);
                                        setSelectedStatus([]);
                                        setSelectedImportType([]);
                                        setSelectedOwnershipType([]);
                                      }}
                                      className="w-full hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-900/20"
                                    >
                                      إعادة تعيين جميع الفلاتر
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Search Results Indicator */}
        {searchQuery.trim() !== "" && (
          <div className="mb-6 p-4 bg-dynamic-card border border-dynamic rounded-lg">
            <div className="flex items-center gap-2 text-dynamic-primary">
              <Search size={18} />
              <span className="font-medium">
                نتائج البحث عن "{searchQuery}": {filteredItems.length} نتيجة
              </span>
              {filteredItems.length === 0 && (
                <span className="text-slate-600 mr-2">- لم يتم العثور على نتائج</span>
              )}
            </div>
            {filteredItems.length > 0 && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-sm text-custom-primary hover:text-custom-primary-dark underline"
              >
                مسح البحث
              </button>
            )}
          </div>
        )}

        {/* Vehicle Cards by Manufacturer */}
        <div className="space-y-8 p-6">
          
          {Object.entries(groupedData)
            .filter(([manufacturer]) => selectedManufacturer.length === 0 || selectedManufacturer.includes(manufacturer))
            .map(([manufacturer, data]) => {
            const logo = getManufacturerLogo(manufacturer);
            
            return (
              <div key={manufacturer} className="space-y-4 relative z-10">
                {/* Manufacturer Header - Clickable */}
                <div 
                  className="glass-card dark:glass-card-dark rounded-lg p-6 cursor-pointer border-0 transition-all duration-200"
                  onClick={() => toggleManufacturer(manufacturer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 space-x-reverse">
                      {/* Manufacturer Logo with Interactive Hover Effect */}
                      <div className="relative group">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                          <ManufacturerLogo 
                            manufacturerName={manufacturer} 
                            size="lg" 
                            className="w-12 h-12 transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-md" 
                          />
                        </div>
                        
                        {/* Hover Ring Effect */}
                        <div className="absolute inset-0 rounded-full border-2 border-dynamic-primary opacity-0 scale-125 transition-all duration-300 group-hover:opacity-50 group-hover:scale-110 pointer-events-none"></div>
                        
                        {/* Pulse Effect */}
                        <div className="absolute inset-0 rounded-full bg-dynamic-primary opacity-0 scale-150 transition-all duration-500 group-hover:opacity-20 group-hover:scale-125 group-hover:animate-pulse pointer-events-none"></div>
                      </div>
                      
                      {/* Manufacturer Name and Count */}
                      <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-white dark:text-white mb-2 drop-shadow-lg">{manufacturer}</h2>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Badge variant="secondary" className="bg-white/20 text-white dark:text-white px-3 py-1 text-sm font-semibold backdrop-blur-sm border border-white/30">
                            {showSoldCars 
                              ? allGroupedData[manufacturer]?.items.length || 0 
                              : allGroupedData[manufacturer]?.items.filter(item => item.status !== "مباع").length || 0} مركبة
                          </Badge>
                          <Badge variant="outline" className="border-green-300/40 text-green-200 bg-green-500/20 dark:bg-green-900/40 backdrop-blur-sm px-3 py-1 text-sm font-semibold">
                            {data.items.filter(item => item.status === "متوفر").length} متوفر
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="text-white/60">
                      {expandedManufacturer === manufacturer ? (
                        <ChevronUp size={24} className="text-white drop-shadow-lg" />
                      ) : (
                        <ChevronDown size={24} className="text-white/80 drop-shadow-lg" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Vehicle Cards Grid - Conditionally Rendered with Animation */}
                {expandedManufacturer === manufacturer && (
                  <div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in slide-in-from-top-2 fade-in duration-300"
                  >
                  {data.items.map((item) => (
                    <Card key={item.id} className="glass-card dark:glass-card-dark rounded-2xl overflow-hidden border-0 relative">
                      <CardHeader className="pb-3 relative z-10">
                        <div className="flex items-center justify-between">
                          {/* Category and Trim Level Row */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <img src="/car.svg" alt="Category" className="w-9 h-9" style={{filter: 'brightness(0) saturate(100%) invert(53%) sepia(82%) saturate(423%) hue-rotate(9deg) brightness(98%) contrast(88%)'}} />
                              <span className="font-bold text-sm drop-shadow-sm" style={{color: '#C49632'}}>{item.category}</span>
                            </div>
                            {item.trimLevel && (
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-sm drop-shadow-sm" style={{color: '#C49632'}}>{item.trimLevel}</span>
                              </div>
                            )}
                          </div>
                          
                          <Badge variant="secondary" className={`${getStatusColor(item.status)} text-xs`}>
                            {item.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 relative z-10">
                        <div className="space-y-3 text-sm">
                          {/* Row 1: Engine Capacity, Year, Exterior Color */}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex items-center gap-1">
                              <img src="/car-engine.svg" alt="Engine" className="w-6 h-6 filter drop-shadow-sm" style={{filter: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%) drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}} />
                              <span className="font-semibold font-latin text-white dark:text-slate-100 text-xs drop-shadow-sm">{item.engineCapacity}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <img src="/year.svg" alt="Year" className="w-5 h-5 filter drop-shadow-sm" style={{filter: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%) drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}} />
                              <span className="font-semibold font-latin text-white dark:text-slate-100 text-xs drop-shadow-sm">{item.year}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <img src="/exterior-color.svg" alt="Exterior Color" className="w-6 h-6 filter drop-shadow-sm" style={{filter: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%) drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}} />
                              <span className="font-semibold text-white dark:text-slate-100 text-xs drop-shadow-sm">{item.exteriorColor}</span>
                            </div>
                          </div>
                          
                          {/* Row 2: Interior Color, Import Type, Ownership Type */}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex items-center gap-1">
                              <img src="/interior-color.svg" alt="Interior Color" className="w-6 h-6 filter drop-shadow-sm" style={{filter: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%) drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}} />
                              <span className="font-semibold text-white dark:text-slate-100 text-xs drop-shadow-sm">{item.interiorColor}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <img src={getImportTypeIcon(item.importType)} alt="Import Type" className="w-6 h-6 filter drop-shadow-sm" style={{filter: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%) drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}} />
                              <span className="font-semibold text-white dark:text-slate-100 text-xs drop-shadow-sm">{item.importType}</span>
                            </div>
                            {item.ownershipType && (
                              <div className="flex items-center gap-1">
                                <img src="/logos/ownerchip.svg" alt="Ownership Type" className="w-6 h-6 filter drop-shadow-sm" style={{filter: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%) drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}} />
                                <span className="font-semibold text-white dark:text-slate-100 text-xs drop-shadow-sm">{item.ownershipType}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Row 3: Location and Chassis Number */}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex items-center gap-1">
                              <img src="/location.svg" alt="Location" className="w-6 h-6 filter drop-shadow-sm" style={{filter: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%) drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}} />
                              <span className="font-semibold text-white dark:text-slate-100 text-xs drop-shadow-sm">{item.location}</span>
                            </div>
                            {item.chassisNumber && (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-white drop-shadow-sm">VIN:</span>
                                <span className="font-medium font-latin text-white dark:text-slate-100 text-xs drop-shadow-sm">{item.chassisNumber}</span>
                              </div>
                            )}
                            <div></div> {/* Empty cell for alignment */}
                          </div>
                          

                          
                          {/* Price and Mileage Row */}
                          {(item.price || ((item.importType === "مستعمل" || item.importType === "مستعمل شخصي") && (item as any).mileage)) && (
                            <div className="flex justify-between items-center py-2 border-t border-white/20 dark:border-slate-500/20 mt-3">
                              {item.price && (
                                <div className="flex items-center gap-1">
                                  <span className="text-white/80 dark:text-slate-300 font-medium text-sm drop-shadow-sm">السعر:</span>
                                  <span className="font-bold font-latin text-yellow-300 dark:text-yellow-300 text-sm drop-shadow-sm">{item.price}</span>
                                </div>
                              )}
                              {(item.importType === "مستعمل" || item.importType === "مستعمل شخصي") && (item as any).mileage && (
                                <div className="flex items-center gap-1">
                                  <span className="text-white/80 dark:text-slate-300 font-medium text-sm drop-shadow-sm">ممشي:</span>
                                  <span className="font-bold text-orange-300 dark:text-orange-300 text-sm drop-shadow-sm">{(item as any).mileage?.toLocaleString()} كم</span>
                                </div>
                              )}
                            </div>
                          )}


                          
                          {item.reservationDate && (
                            <div className="flex justify-between text-xs pt-2 border-t border-blue-100 mt-2 bg-blue-50 p-2 rounded">
                              <span className="text-blue-600 font-medium">تاريخ الحجز:</span>
                              <span className="font-medium text-blue-700">
                                {new Date(item.reservationDate).toLocaleDateString('en-US')}
                              </span>
                            </div>
                          )}
                          
                          {item.notes && (
                            <div className="pt-2 border-t border-slate-100 mt-2">
                              <span className="text-slate-500 text-xs">ملاحظات:</span>
                              <p className="text-xs text-slate-700 mt-1">{item.notes}</p>
                            </div>
                          )}

                          {/* Action Buttons - Single Row Icons Only */}
                          <div className="pt-3 mt-3 border-t border-slate-200">
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="px-3 h-8 hover:bg-yellow-50 border-yellow-300"
                                style={{color: '#BF9231'}}
                                onClick={() => handleShareItem(item)}
                                title="مشاركة"
                              >
                                <Share2 size={14} />
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="px-3 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                                onClick={() => handleCreateQuote(item)}
                                title="إنشاء عرض سعر"
                              >
                                <FileText size={14} />
                              </Button>

                              {item.status === "محجوز" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="px-3 h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-300"
                                  onClick={() => handleCancelReservation(item)}
                                  disabled={cancelingReservationId === item.id}
                                  title="إلغاء الحجز"
                                >
                                  <X size={14} />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="px-3 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                                  onClick={() => handleReserveItem(item)}
                                  disabled={item.status === "محجوز" || item.isSold}
                                  title="حجز"
                                >
                                  <Calendar size={14} />
                                </Button>
                              )}

                              {userRole === "admin" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="px-3 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                                    onClick={() => {
                                      setEditingItem(item);
                                      setShowEditDialog(true);
                                    }}
                                    title="تحرير"
                                  >
                                    <Edit2 size={14} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="px-3 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                    onClick={() => setItemToDelete(item)}
                                    title="حذف"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {Object.keys(groupedData).length === 0 && (
          <div className="text-center py-12 relative z-10">
            <div className="text-white/60 text-6xl mb-4 drop-shadow-lg">🚗</div>
            <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg">لا توجد مركبات متوفرة</h3>
            <p className="text-white/80 drop-shadow-sm">قم بإضافة مركبات جديدة لعرضها هنا</p>
          </div>
        )}
      </div>

      {/* Animated Floating Action Button */}
      <CardViewFAB
        onVoiceChat={() => {}}
        onSettings={() => {
          // Could add settings dialog for card view preferences
          console.log("Card view settings clicked");
        }}
      />



      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent className="sm:max-w-md" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              تأكيد حذف المركبة
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              هل أنت متأكد من حذف هذه المركبة؟ لا يمكن التراجع عن هذا الإجراء.
              <br />
              <br />
              <span className="font-semibold">
                {itemToDelete?.manufacturer} {itemToDelete?.category} - {itemToDelete?.year}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && deleteItemMutation.mutate(itemToDelete.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteItemMutation.isPending}
            >
              {deleteItemMutation.isPending ? "جاري الحذف..." : "تأكيد الحذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Item Form */}
      <InventoryFormSimple
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        editItem={editingItem || undefined}
      />

      {/* Vehicle Share Dialog */}
      {shareVehicle && (
        <VehicleShare
          vehicle={shareVehicle}
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
        />
      )}

      {/* Specifications Management Dialog */}
      <SpecificationsManagement
        open={specificationsOpen}
        onOpenChange={setSpecificationsOpen}
      />

      {/* Quotation Management Dialog */}
      <QuotationManagement
        open={quotationManagementOpen}
        onOpenChange={setQuotationManagementOpen}
      />

      {/* Reservation Dialog */}
      <ReservationDialog
        open={reserveDialogOpen}
        onOpenChange={setReserveDialogOpen}
        item={reserveItem}
        onSuccess={handleReservationSuccess}
      />
      </div>
    </div>
  );
}