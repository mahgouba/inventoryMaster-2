import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
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
  ChevronRight
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import VoiceAssistant from "@/components/voice-assistant";
import { CardViewFAB } from "@/components/animated-fab";
import InventoryFormSimple from "@/components/inventory-form-simple";
import VehicleShare from "@/components/vehicle-share";
import SpecificationsManagement from "@/components/specifications-management";
import QuotationManagement from "@/components/quotation-management";

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
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("الكل");
  const [expandedManufacturer, setExpandedManufacturer] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [sellingItemId, setSellingItemId] = useState<number | null>(null);
  const [reservingItemId, setReservingItemId] = useState<number | null>(null);
  const [cancelingReservationId, setCancelingReservationId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [selectedTrimLevel, setSelectedTrimLevel] = useState<string>("الكل");
  const [selectedYear, setSelectedYear] = useState<string>("الكل");
  const [selectedEngineCapacity, setSelectedEngineCapacity] = useState<string>("الكل");
  const [selectedInteriorColor, setSelectedInteriorColor] = useState<string>("الكل");
  const [selectedExteriorColor, setSelectedExteriorColor] = useState<string>("الكل");
  const [selectedStatus, setSelectedStatus] = useState<string>("الكل");
  const [selectedImportType, setSelectedImportType] = useState<string>("الكل");
  const [selectedOwnershipType, setSelectedOwnershipType] = useState<string>("الكل");
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
        if (selectedManufacturer !== "الكل" && item.manufacturer !== selectedManufacturer) return false;
        return true;
      }
      
      if (field === "trimLevel") {
        // Apply manufacturer and category filters
        if (selectedManufacturer !== "الكل" && item.manufacturer !== selectedManufacturer) return false;
        if (selectedCategory !== "الكل" && item.category !== selectedCategory) return false;
        return true;
      }
      
      if (field === "year") {
        // Apply manufacturer, category, trimLevel filters
        if (selectedManufacturer !== "الكل" && item.manufacturer !== selectedManufacturer) return false;
        if (selectedCategory !== "الكل" && item.category !== selectedCategory) return false;
        if (selectedTrimLevel !== "الكل" && item.trimLevel !== selectedTrimLevel) return false;
        return true;
      }
      
      if (field === "engineCapacity") {
        // Apply all previous filters
        if (selectedManufacturer !== "الكل" && item.manufacturer !== selectedManufacturer) return false;
        if (selectedCategory !== "الكل" && item.category !== selectedCategory) return false;
        if (selectedTrimLevel !== "الكل" && item.trimLevel !== selectedTrimLevel) return false;
        if (selectedYear !== "الكل" && String(item.year) !== selectedYear) return false;
        return true;
      }
      
      if (field === "exteriorColor") {
        if (selectedManufacturer !== "الكل" && item.manufacturer !== selectedManufacturer) return false;
        if (selectedCategory !== "الكل" && item.category !== selectedCategory) return false;
        if (selectedTrimLevel !== "الكل" && item.trimLevel !== selectedTrimLevel) return false;
        if (selectedYear !== "الكل" && String(item.year) !== selectedYear) return false;
        if (selectedEngineCapacity !== "الكل" && item.engineCapacity !== selectedEngineCapacity) return false;
        return true;
      }
      
      if (field === "interiorColor") {
        if (selectedManufacturer !== "الكل" && item.manufacturer !== selectedManufacturer) return false;
        if (selectedCategory !== "الكل" && item.category !== selectedCategory) return false;
        if (selectedTrimLevel !== "الكل" && item.trimLevel !== selectedTrimLevel) return false;
        if (selectedYear !== "الكل" && String(item.year) !== selectedYear) return false;
        if (selectedEngineCapacity !== "الكل" && item.engineCapacity !== selectedEngineCapacity) return false;
        if (selectedExteriorColor !== "الكل" && item.exteriorColor !== selectedExteriorColor) return false;
        return true;
      }
      
      if (field === "status") {
        if (selectedManufacturer !== "الكل" && item.manufacturer !== selectedManufacturer) return false;
        if (selectedCategory !== "الكل" && item.category !== selectedCategory) return false;
        if (selectedTrimLevel !== "الكل" && item.trimLevel !== selectedTrimLevel) return false;
        if (selectedYear !== "الكل" && String(item.year) !== selectedYear) return false;
        if (selectedEngineCapacity !== "الكل" && item.engineCapacity !== selectedEngineCapacity) return false;
        if (selectedExteriorColor !== "الكل" && item.exteriorColor !== selectedExteriorColor) return false;
        if (selectedInteriorColor !== "الكل" && item.interiorColor !== selectedInteriorColor) return false;
        return true;
      }
      
      if (field === "importType") {
        // Apply all previous filters
        if (selectedManufacturer !== "الكل" && item.manufacturer !== selectedManufacturer) return false;
        if (selectedCategory !== "الكل" && item.category !== selectedCategory) return false;
        if (selectedTrimLevel !== "الكل" && item.trimLevel !== selectedTrimLevel) return false;
        if (selectedYear !== "الكل" && String(item.year) !== selectedYear) return false;
        if (selectedEngineCapacity !== "الكل" && item.engineCapacity !== selectedEngineCapacity) return false;
        if (selectedExteriorColor !== "الكل" && item.exteriorColor !== selectedExteriorColor) return false;
        if (selectedInteriorColor !== "الكل" && item.interiorColor !== selectedInteriorColor) return false;
        if (selectedStatus !== "الكل" && item.status !== selectedStatus) return false;
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

  // Dynamic filter arrays based on previously applied filters
  const manufacturers = ["الكل", ...getFilteredUniqueValues("manufacturer", {})];
  
  const categories = ["الكل", ...getFilteredUniqueValues("category", {
    manufacturer: selectedManufacturer
  })];
  
  const availableTrimLevels = ["الكل", ...getFilteredUniqueValues("trimLevel", {
    manufacturer: selectedManufacturer,
    category: selectedCategory
  })];
  
  const yearValues = getFilteredUniqueValues("year", {
    manufacturer: selectedManufacturer,
    category: selectedCategory,
    trimLevel: selectedTrimLevel
  }).map(year => String(year)).sort((a, b) => parseInt(b) - parseInt(a)); // Sort years in descending order
  
  const availableYears = ["الكل", ...yearValues];
  
  const availableEngineCapacities = ["الكل", ...getFilteredUniqueValues("engineCapacity", {
    manufacturer: selectedManufacturer,
    category: selectedCategory,
    trimLevel: selectedTrimLevel,
    year: selectedYear
  }).map(capacity => String(capacity))];
  
  const availableExteriorColors = ["الكل", ...getFilteredUniqueValues("exteriorColor", {
    manufacturer: selectedManufacturer,
    category: selectedCategory,
    trimLevel: selectedTrimLevel,
    year: selectedYear,
    engineCapacity: selectedEngineCapacity
  })];
  
  const availableInteriorColors = ["الكل", ...getFilteredUniqueValues("interiorColor", {
    manufacturer: selectedManufacturer,
    category: selectedCategory,
    trimLevel: selectedTrimLevel,
    year: selectedYear,
    engineCapacity: selectedEngineCapacity,
    exteriorColor: selectedExteriorColor
  })];
  
  const availableStatuses = ["الكل", ...getFilteredUniqueValues("status", {
    manufacturer: selectedManufacturer,
    category: selectedCategory,
    trimLevel: selectedTrimLevel,
    year: selectedYear,
    engineCapacity: selectedEngineCapacity,
    exteriorColor: selectedExteriorColor,
    interiorColor: selectedInteriorColor
  })];
  
  const availableImportTypes = ["الكل", ...getFilteredUniqueValues("importType", {
    manufacturer: selectedManufacturer,
    category: selectedCategory,
    trimLevel: selectedTrimLevel,
    year: selectedYear,
    engineCapacity: selectedEngineCapacity,
    exteriorColor: selectedExteriorColor,
    interiorColor: selectedInteriorColor,
    status: selectedStatus
  })];
  
  const availableOwnershipTypes = ["الكل", ...getFilteredUniqueValues("ownershipType", {
    manufacturer: selectedManufacturer,
    category: selectedCategory,
    trimLevel: selectedTrimLevel,
    year: selectedYear,
    engineCapacity: selectedEngineCapacity,
    exteriorColor: selectedExteriorColor,
    interiorColor: selectedInteriorColor,
    status: selectedStatus,
    importType: selectedImportType
  })];
  
  // Reset category filter when manufacturer changes
  const handleManufacturerChange = (value: string) => {
    setSelectedManufacturer(value);
    setSelectedCategory("الكل");
  };

  // Apply all filters
  const filteredItems = searchFilteredItems.filter(item => {
    return (
      (selectedManufacturer === "الكل" || item.manufacturer === selectedManufacturer) &&
      (selectedCategory === "الكل" || item.category === selectedCategory) &&
      (selectedTrimLevel === "الكل" || item.trimLevel === selectedTrimLevel) &&
      (selectedYear === "الكل" || item.year?.toString() === selectedYear) &&
      (selectedEngineCapacity === "الكل" || item.engineCapacity === selectedEngineCapacity) &&
      (selectedInteriorColor === "الكل" || item.interiorColor === selectedInteriorColor) &&
      (selectedExteriorColor === "الكل" || item.exteriorColor === selectedExteriorColor) &&
      (selectedStatus === "الكل" || item.status === selectedStatus) &&
      (selectedImportType === "الكل" || item.importType === selectedImportType) &&
      (selectedOwnershipType === "الكل" || item.ownershipType === selectedOwnershipType)
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
  const reserveItemMutation = useMutation({
    mutationFn: (data: { id: number; reservedBy: string; reservationNote?: string }) => {
      setReservingItemId(data.id);
      return apiRequest("POST", `/api/inventory/${data.id}/reserve`, {
        reservedBy: data.reservedBy,
        reservationNote: data.reservationNote
      });
    },
    onSuccess: () => {
      toast({
        title: "تم الحجز بنجاح",
        description: "تم حجز المركبة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      setReservingItemId(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حجز المركبة",
        variant: "destructive",
      });
      setReservingItemId(null);
    }
  });

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
    if (reservingItemId !== null) return;
    reserveItemMutation.mutate({
      id: item.id,
      reservedBy: username,
      reservationNote: `حجز بواسطة ${username} من واجهة البطاقات - ${new Date().toLocaleDateString('en-US')}`
    });
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
    <div className="bg-slate-50 dark:bg-black min-h-screen" dir="rtl">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Company Name */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dynamic-gradient rounded-lg flex items-center justify-center shadow-md overflow-hidden">
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
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2 space-x-reverse">
              {/* Home Button */}
              <Link href="/">
                <Button variant="outline" size="sm" className="text-slate-600 hover:text-slate-800">
                  <Home size={16} className="ml-1" />
                  <span className="hidden sm:inline">الرئيسية</span>
                </Button>
              </Link>

              {/* Appearance Management Button - Admin Only */}
              {userRole === "admin" && (
                <Link href="/appearance">
                  <Button variant="outline" size="sm" className="text-dynamic-primary hover:text-dynamic-primary-hover hover:bg-dynamic-card border-dynamic hover:border-dynamic">
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

              {/* Logout Button */}
              <Button onClick={onLogout} variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                <LogOut size={16} className="ml-1" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
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
                  className="pr-10 pl-4 py-2 w-full border-slate-300 focus:border-custom-primary focus:ring-custom-primary text-right"
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
                      <CardContent className="p-6 w-full">
                        {/* Enhanced Filter Controls with Toggle Switches */}
                        <div className="space-y-6 animate-in fade-in duration-300">
                          
                          {/* Filter Slider Component */}
                          {(() => {
                            const FilterSlider = ({ title, items, currentFilter, onFilterChange, getCount, toggleState, onToggleChange }) => (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</h3>
                                  <Switch 
                                    checked={toggleState} 
                                    onCheckedChange={onToggleChange}
                                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-400"
                                  />
                                </div>
                                {toggleState && (
                                  <div className="relative group">
                                    <ScrollArea className="w-full">
                                      <div className="flex space-x-2 space-x-reverse pb-2">
                                        {items.map((item) => (
                                          <Button
                                            key={String(item)}
                                            variant={currentFilter === item ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => onFilterChange(String(item))}
                                            className={`transition-all duration-200 whitespace-nowrap ${
                                              currentFilter === item
                                                ? "bg-custom-primary hover:bg-custom-primary-dark text-white"
                                                : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-custom-primary"
                                            }`}
                                          >
                                            {String(item)} ({getCount(String(item))})
                                          </Button>
                                        ))}
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
                                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                  <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">التحكم في جميع الفلاتر</span>
                                  <div className="flex space-x-3 space-x-reverse">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setShowManufacturerFilter(true);
                                        setShowCategoryFilter(true);
                                        setShowTrimLevelFilter(true);
                                        setShowYearFilter(true);
                                        setShowEngineCapacityFilter(true);
                                        setShowExteriorColorFilter(true);
                                        setShowInteriorColorFilter(true);
                                        setShowStatusFilter(true);
                                        setShowImportTypeFilter(true);
                                        setShowOwnershipTypeFilter(true);
                                      }}
                                      className="text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-600 dark:hover:bg-green-900/20"
                                    >
                                      إظهار الكل
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setShowManufacturerFilter(false);
                                        setShowCategoryFilter(false);
                                        setShowTrimLevelFilter(false);
                                        setShowYearFilter(false);
                                        setShowEngineCapacityFilter(false);
                                        setShowExteriorColorFilter(false);
                                        setShowInteriorColorFilter(false);
                                        setShowStatusFilter(false);
                                        setShowImportTypeFilter(false);
                                        setShowOwnershipTypeFilter(false);
                                      }}
                                      className="text-red-700 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                                    >
                                      إخفاء الكل
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* Individual Filters with Toggles */}
                                <div className="space-y-3">
                                  <FilterSlider 
                                    title="الصانع" 
                                    items={manufacturers} 
                                    currentFilter={selectedManufacturer} 
                                    onFilterChange={handleManufacturerChange} 
                                    getCount={(item) => getFilterCount("manufacturer", item)} 
                                    toggleState={showManufacturerFilter}
                                    onToggleChange={setShowManufacturerFilter}
                                  />

                                  <FilterSlider 
                                    title="الفئة" 
                                    items={categories} 
                                    currentFilter={selectedCategory} 
                                    onFilterChange={setSelectedCategory} 
                                    getCount={(item) => getFilterCount("category", item)} 
                                    toggleState={showCategoryFilter}
                                    onToggleChange={setShowCategoryFilter}
                                  />

                                  <FilterSlider 
                                    title="درجة التجهيز" 
                                    items={availableTrimLevels} 
                                    currentFilter={selectedTrimLevel} 
                                    onFilterChange={setSelectedTrimLevel} 
                                    getCount={(item) => getFilterCount("trimLevel", item)} 
                                    toggleState={showTrimLevelFilter}
                                    onToggleChange={setShowTrimLevelFilter}
                                  />

                                  <FilterSlider 
                                    title="السنة" 
                                    items={availableYears} 
                                    currentFilter={selectedYear} 
                                    onFilterChange={setSelectedYear} 
                                    getCount={(item) => getFilterCount("year", item)} 
                                    toggleState={showYearFilter}
                                    onToggleChange={setShowYearFilter}
                                  />

                                  <FilterSlider 
                                    title="سعة المحرك" 
                                    items={availableEngineCapacities} 
                                    currentFilter={selectedEngineCapacity} 
                                    onFilterChange={setSelectedEngineCapacity} 
                                    getCount={(item) => getFilterCount("engineCapacity", item)} 
                                    toggleState={showEngineCapacityFilter}
                                    onToggleChange={setShowEngineCapacityFilter}
                                  />

                                  <FilterSlider 
                                    title="اللون الخارجي" 
                                    items={availableExteriorColors} 
                                    currentFilter={selectedExteriorColor} 
                                    onFilterChange={setSelectedExteriorColor} 
                                    getCount={(item) => getFilterCount("exteriorColor", item)} 
                                    toggleState={showExteriorColorFilter}
                                    onToggleChange={setShowExteriorColorFilter}
                                  />

                                  <FilterSlider 
                                    title="اللون الداخلي" 
                                    items={availableInteriorColors} 
                                    currentFilter={selectedInteriorColor} 
                                    onFilterChange={setSelectedInteriorColor} 
                                    getCount={(item) => getFilterCount("interiorColor", item)} 
                                    toggleState={showInteriorColorFilter}
                                    onToggleChange={setShowInteriorColorFilter}
                                  />

                                  <FilterSlider 
                                    title="الحالة" 
                                    items={availableStatuses} 
                                    currentFilter={selectedStatus} 
                                    onFilterChange={setSelectedStatus} 
                                    getCount={(item) => getFilterCount("status", item)} 
                                    toggleState={showStatusFilter}
                                    onToggleChange={setShowStatusFilter}
                                  />

                                  <FilterSlider 
                                    title="نوع الاستيراد" 
                                    items={availableImportTypes} 
                                    currentFilter={selectedImportType} 
                                    onFilterChange={setSelectedImportType} 
                                    getCount={(item) => getFilterCount("importType", item)} 
                                    toggleState={showImportTypeFilter}
                                    onToggleChange={setShowImportTypeFilter}
                                  />

                                  <FilterSlider 
                                    title="نوع الملكية" 
                                    items={availableOwnershipTypes} 
                                    currentFilter={selectedOwnershipType} 
                                    onFilterChange={setSelectedOwnershipType} 
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
                                        setSelectedManufacturer("الكل");
                                        setSelectedCategory("الكل");
                                        setSelectedTrimLevel("الكل");
                                        setSelectedYear("الكل");
                                        setSelectedEngineCapacity("الكل");
                                        setSelectedInteriorColor("الكل");
                                        setSelectedExteriorColor("الكل");
                                        setSelectedStatus("الكل");
                                        setSelectedImportType("الكل");
                                        setSelectedOwnershipType("الكل");
                                      }}
                                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-900/20"
                                    >
                                      إعادة تعيين الفلاتر
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
        <div className="space-y-8">
          {Object.entries(groupedData)
            .filter(([manufacturer]) => selectedManufacturer === "الكل" || manufacturer === selectedManufacturer)
            .map(([manufacturer, data]) => {
            const logo = getManufacturerLogo(manufacturer);
            
            return (
              <div key={manufacturer} className="space-y-4">
                {/* Manufacturer Header - Clickable */}
                <div 
                  className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-md hover:border-custom-primary transition-all duration-200"
                  onClick={() => toggleManufacturer(manufacturer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 space-x-reverse">
                      {/* Manufacturer Logo with Interactive Hover Effect */}
                      <div className="relative group">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:border-custom-primary group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:to-blue-50">
                          {logo ? (
                            <img 
                              src={logo} 
                              alt={manufacturer}
                              className="w-12 h-12 object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-md"
                            />
                          ) : (
                            <span className="text-xl font-bold text-slate-600 transition-all duration-300 group-hover:text-custom-primary-dark group-hover:scale-110">
                              {manufacturer.charAt(0)}
                            </span>
                          )}
                        </div>
                        
                        {/* Hover Ring Effect */}
                        <div className="absolute inset-0 rounded-full border-2 border-dynamic-primary opacity-0 scale-125 transition-all duration-300 group-hover:opacity-50 group-hover:scale-110 pointer-events-none"></div>
                        
                        {/* Pulse Effect */}
                        <div className="absolute inset-0 rounded-full bg-dynamic-primary opacity-0 scale-150 transition-all duration-500 group-hover:opacity-20 group-hover:scale-125 group-hover:animate-pulse pointer-events-none"></div>
                      </div>
                      
                      {/* Manufacturer Name and Count */}
                      <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">{manufacturer}</h2>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Badge variant="secondary" className="bg-dynamic-card text-dynamic-primary dark:text-slate-300 px-3 py-1 text-sm font-semibold">
                            {showSoldCars 
                              ? allGroupedData[manufacturer]?.items.length || 0 
                              : allGroupedData[manufacturer]?.items.filter(item => item.status !== "مباع").length || 0} مركبة
                          </Badge>
                          <Badge variant="outline" className="border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 text-sm font-semibold">
                            {data.items.filter(item => item.status === "متوفر").length} متوفر
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="text-slate-400">
                      {expandedManufacturer === manufacturer ? (
                        <ChevronUp size={24} className="text-dynamic-primary" />
                      ) : (
                        <ChevronDown size={24} />
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
                    <Card key={item.id} className="card-dynamic">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">{item.category}</CardTitle>
                          <Badge variant="secondary" className={`${getStatusColor(item.status)} text-xs`}>
                            {item.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                          {item.trimLevel && (
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400 font-medium">درجة التجهيز:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{item.trimLevel}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">سعة المحرك:</span>
                            <span className="font-semibold font-latin text-slate-800 dark:text-slate-200">{item.engineCapacity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">السنة:</span>
                            <span className="font-semibold font-latin text-slate-800 dark:text-slate-200">{item.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">اللون الخارجي:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.exteriorColor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">اللون الداخلي:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.interiorColor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">نوع الاستيراد:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.importType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">نوع الملكية:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.ownershipType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">الموقع:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.location}</span>
                          </div>
                          
                          {item.price && (
                            <div className="flex justify-between py-2 border-t border-slate-200 dark:border-slate-700 mt-3">
                              <span className="text-slate-600 dark:text-slate-400 font-medium">السعر:</span>
                              <span className="font-bold font-latin text-teal-700 dark:text-teal-400">{item.price}</span>
                            </div>
                          )}
                          
                          {item.chassisNumber && (
                            <div className="flex justify-between">
                              <span className="text-slate-600 font-medium">رقم الهيكل:</span>
                              <span className="font-medium font-latin text-xs text-slate-700">{item.chassisNumber}</span>
                            </div>
                          )}
                          
                          {item.entryDate && (
                            <div className="flex justify-between text-xs pt-2 border-t border-slate-100 mt-2">
                              <span className="text-slate-500">تاريخ الإدخال:</span>
                              <span className="font-medium text-slate-600">
                                {new Date(item.entryDate).toLocaleDateString('en-US')}
                              </span>
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

                          {/* Action Buttons */}
                          <div className="pt-3 mt-3 border-t border-slate-200 space-y-2">
                            {/* Share, Quote and Reserve buttons */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="px-3 h-9 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                                onClick={() => handleShareItem(item)}
                              >
                                <Share2 size={14} />
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="px-3 h-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                                onClick={() => handleCreateQuote(item)}
                                title="إنشاء عرض سعر"
                              >
                                <FileText size={14} />
                              </Button>

                              {item.status === "محجوز" ? (
                                userRole === "admin" ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 h-9 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-300"
                                    onClick={() => handleCancelReservation(item)}
                                    disabled={cancelingReservationId === item.id}
                                  >
                                    <X size={14} className="ml-1" />
                                    {cancelingReservationId === item.id ? "جاري الإلغاء..." : "إلغاء الحجز"}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 h-9 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-300"
                                    onClick={() => {
                                      toast({
                                        title: "غير مسموح",
                                        description: "لا يمكنك إلغاء الحجز إلا إذا كنت مديرًا بكامل الصلاحيات.",
                                        variant: "destructive",
                                      });
                                    }}
                                  >
                                    <X size={14} className="ml-1" />
                                    إلغاء الحجز
                                  </Button>
                                )
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-9 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                                  onClick={() => handleReserveItem(item)}
                                  disabled={reservingItemId === item.id || item.status !== "متوفر" || item.isSold}
                                >
                                  <Calendar size={14} className="ml-1" />
                                  {reservingItemId === item.id ? "جاري الحجز..." : "حجز"}
                                </Button>
                              )}
                            </div>

                            {/* Edit and Delete buttons (Admin only) */}
                            {userRole === "admin" && (
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-9 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                                  onClick={() => {
                                    setEditingItem(item);
                                    setShowEditDialog(true);
                                  }}
                                >
                                  <Edit2 size={14} className="ml-1" />
                                  تحرير
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-9 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                  onClick={() => setItemToDelete(item)}
                                >
                                  <Trash2 size={14} className="ml-1" />
                                  حذف
                                </Button>
                              </div>
                            )}
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
          <div className="text-center py-12">
            <div className="text-slate-400 text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">لا توجد مركبات متوفرة</h3>
            <p className="text-slate-500">قم بإضافة مركبات جديدة لعرضها هنا</p>
          </div>
        )}
      </div>

      {/* Animated Floating Action Button */}
      <CardViewFAB
        onVoiceChat={() => setVoiceChatOpen(true)}
        onSettings={() => {
          // Could add settings dialog for card view preferences
          console.log("Card view settings clicked");
        }}
      />

      {/* Voice Assistant Dialog */}
      <VoiceAssistant
        open={voiceChatOpen}
        onOpenChange={setVoiceChatOpen}
        onAddItem={() => {
          // Navigate to inventory page to add item
          window.location.href = '/inventory';
        }}
        onEditItem={(item) => {
          console.log('Editing item:', item);
        }}
        onSellItem={async (itemId) => {
          console.log('Selling item:', itemId);
        }}
        onDeleteItem={async (itemId) => {
          console.log('Deleting item:', itemId);
        }}
        onExtractChassisNumber={(file) => {
          console.log('Extracting chassis number from:', file);
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
    </div>
  );
}