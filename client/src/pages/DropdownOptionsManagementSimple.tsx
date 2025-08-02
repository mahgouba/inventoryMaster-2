import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Settings, Save, X } from "lucide-react";

// Schema definitions for different option types
const manufacturerSchema = z.object({
  id: z.string().min(1, "معرف الصانع مطلوب"),
  nameAr: z.string().min(1, "الاسم العربي مطلوب"),
  nameEn: z.string().optional(),
  logo: z.string().optional(),
});

const locationSchema = z.object({
  name: z.string().min(1, "اسم الموقع مطلوب"),
  description: z.string().optional(),
  address: z.string().optional(),
  manager: z.string().optional(),
  phone: z.string().optional(),
});

type OptionType = "manufacturers" | "locations" | "statuses" | "importTypes" | "engineCapacities";

interface DropdownOption {
  id?: string | number;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  [key: string]: any;
}

export default function DropdownOptionsManagementSimple() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOptionType, setSelectedOptionType] = useState<OptionType>("manufacturers");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DropdownOption | null>(null);
  const [newStaticOption, setNewStaticOption] = useState("");

  // Static options that don't come from database
  const [staticOptions, setStaticOptions] = useState({
    statuses: ["متوفر", "في الطريق", "قيد الصيانة", "محجوز", "مباع"],
    importTypes: ["شخصي", "شركة", "مستعمل شخصي"],
    engineCapacities: ["1.0L", "1.2L", "1.4L", "1.5L", "1.6L", "1.8L", "2.0L", "2.2L", "2.4L", "2.5L", "2.7L", "3.0L", "3.5L", "4.0L", "4.4L", "5.0L", "6.2L", "V6", "V8", "V12"]
  });

  // Fetch data based on selected option type
  const { data: options = [], isLoading } = useQuery({
    queryKey: [`/api/hierarchical/${selectedOptionType}`],
    enabled: !["statuses", "importTypes", "engineCapacities"].includes(selectedOptionType)
  });

  // Get form schema based on option type
  const getFormSchema = () => {
    switch (selectedOptionType) {
      case "manufacturers":
        return manufacturerSchema;
      case "locations":
        return locationSchema;
      default:
        return z.object({ name: z.string().min(1, "الاسم مطلوب") });
    }
  };

  const form = useForm<any>({
    resolver: zodResolver(getFormSchema()),
    defaultValues: {}
  });

  const handleAddStaticOption = (optionType: keyof typeof staticOptions) => {
    if (newStaticOption.trim()) {
      setStaticOptions(prev => ({
        ...prev,
        [optionType]: [...prev[optionType], newStaticOption.trim()]
      }));
      setNewStaticOption("");
      toast({
        title: "تم بنجاح",
        description: "تم إضافة الخيار بنجاح"
      });
    }
  };

  const handleRemoveStaticOption = (optionType: keyof typeof staticOptions, index: number) => {
    setStaticOptions(prev => ({
      ...prev,
      [optionType]: prev[optionType].filter((_, i) => i !== index)
    }));
    toast({
      title: "تم بنجاح",
      description: "تم حذف الخيار بنجاح"
    });
  };

  const renderStaticOptions = (optionType: keyof typeof staticOptions, title: string) => (
    <Card className="glass-container">
      <CardHeader className="glass-header">
        <CardTitle className="text-white text-right">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newStaticOption}
            onChange={(e) => setNewStaticOption(e.target.value)}
            placeholder="إضافة خيار جديد..."
            className="flex-1"
            dir="rtl"
          />
          <Button
            onClick={() => handleAddStaticOption(optionType)}
            disabled={!newStaticOption.trim()}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {staticOptions[optionType].map((option, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-2">
              {option}
              <button
                onClick={() => handleRemoveStaticOption(optionType, index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderDatabaseOptions = () => {
    if (isLoading) {
      return <div className="text-center text-white">جاري التحميل...</div>;
    }

    if (!options || options.length === 0) {
      return <div className="text-center text-white">لا توجد عناصر</div>;
    }

    return (
      <div className="grid gap-4">
        {options.map((item: DropdownOption, index: number) => (
          <Card key={item.id || index} className="glass-container">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1 text-right">
                  <div className="text-white font-medium">
                    {item.nameAr || item.name}
                  </div>
                  {item.nameEn && (
                    <div className="text-sm text-gray-300">{item.nameEn}</div>
                  )}
                  {item.description && (
                    <div className="text-sm text-gray-400">{item.description}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const optionTypeNames = {
    manufacturers: "الصانعين",
    locations: "المواقع",
    statuses: "الحالات",
    importTypes: "أنواع الاستيراد",
    engineCapacities: "سعات المحرك"
  };

  return (
    <div className="space-y-6 p-6">
      <div className="glass-header p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-white text-right flex items-center gap-2">
          <Settings className="h-6 w-6" />
          إدارة خيارات القوائم المنسدلة
        </h1>
        <p className="text-gray-300 text-right mt-2">
          يمكنك إدارة جميع الخيارات المتاحة في القوائم المنسدلة عند إضافة العناصر
        </p>
      </div>

      {/* Option Type Selector */}
      <Card className="glass-container">
        <CardHeader className="glass-header">
          <CardTitle className="text-white text-right">اختر نوع الخيارات</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedOptionType} onValueChange={(value) => setSelectedOptionType(value as OptionType)}>
            <SelectTrigger className="w-full" dir="rtl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(optionTypeNames).map(([key, name]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Content based on selected option type */}
      <div className="space-y-6">
        {["statuses", "importTypes", "engineCapacities"].includes(selectedOptionType) ? (
          // Static options
          <div>
            {selectedOptionType === "statuses" && renderStaticOptions("statuses", "حالات المركبات")}
            {selectedOptionType === "importTypes" && renderStaticOptions("importTypes", "أنواع الاستيراد")}
            {selectedOptionType === "engineCapacities" && renderStaticOptions("engineCapacities", "سعات المحرك")}
          </div>
        ) : (
          // Database options
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white text-right">
                {optionTypeNames[selectedOptionType]}
              </h2>
            </div>
            {renderDatabaseOptions()}
          </div>
        )}
      </div>
    </div>
  );
}