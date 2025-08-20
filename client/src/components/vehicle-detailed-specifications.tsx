import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Car, Edit3, Save, X, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface VehicleDetailedSpecificationsProps {
  manufacturer?: string;
  category?: string;
  trimLevel?: string;
  year?: string;
  engineCapacity?: string;
  chassisNumber?: string;
  onSpecificationsUpdate?: (specifications: any) => void;
}

interface VehicleSpecification {
  id?: number;
  manufacturer: string;
  category: string;
  trimLevel?: string;
  year: number;
  engineCapacity: string;
  chassisNumber?: string;
  specifications?: string | object;
  specificationsEn?: string;
}

export function VehicleDetailedSpecifications({
  manufacturer,
  category,
  trimLevel,
  year,
  engineCapacity,
  chassisNumber,
  onSpecificationsUpdate
}: VehicleDetailedSpecificationsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableSpecs, setEditableSpecs] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vehicle specifications from database with priority for chassis number
  const { data: specifications, isLoading, error } = useQuery({
    queryKey: ['vehicle-specifications', manufacturer, category, trimLevel, year, engineCapacity, chassisNumber],
    queryFn: async () => {
      let foundSpec = null;
      
      // Priority 1: Search by chassis number (highest priority)
      if (chassisNumber && chassisNumber.trim()) {
        console.log(`🔍 Searching specifications by chassis number: ${chassisNumber}`);
        try {
          const response = await fetch(`/api/vehicle-specifications?chassisNumber=${encodeURIComponent(chassisNumber.trim())}`);
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              console.log(`✅ Found specification by chassis number:`, data[0]);
              return data[0];
            }
          }
        } catch (error) {
          console.log('Error searching by chassis number:', error);
        }
      }
      
      // Priority 2: Search by vehicle details (manufacturer, category, year, engine)
      if (manufacturer && category && year && engineCapacity) {
        console.log(`🔍 Searching specifications by vehicle details: ${manufacturer} ${category} ${year} ${engineCapacity}`);
        try {
          const queryParams = new URLSearchParams({
            manufacturer: manufacturer,
            category: category,
            year: year.toString(),
            engineCapacity: engineCapacity
          });
          
          if (trimLevel && trimLevel.trim()) {
            queryParams.append('trimLevel', trimLevel);
          }
          
          const response = await fetch(`/api/vehicle-specifications?${queryParams}`);
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              console.log(`✅ Found specification by vehicle details:`, data[0]);
              return data[0];
            }
          }
        } catch (error) {
          console.log('Error searching by vehicle details:', error);
        }
      }
      
      console.log('❌ No specifications found in database');
      return null;
    },
    enabled: Boolean(chassisNumber || (manufacturer && category && year && engineCapacity))
  });

  // Update specifications mutation
  const updateSpecificationsMutation = useMutation({
    mutationFn: async (newSpecs: string) => {
      const specData: Partial<VehicleSpecification> = {
        manufacturer: manufacturer || '',
        category: category || '',
        trimLevel: trimLevel || undefined,
        year: parseInt(year || '2024'),
        engineCapacity: engineCapacity || '',
        chassisNumber: chassisNumber || undefined,
        specifications: newSpecs
      };

      if (specifications?.id) {
        // Update existing specification
        const response = await fetch(`/api/vehicle-specifications/${specifications.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(specData)
        });
        if (!response.ok) throw new Error('Failed to update specifications');
        return response.json();
      } else {
        // Create new specification
        const response = await fetch('/api/vehicle-specifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(specData)
        });
        if (!response.ok) throw new Error('Failed to create specifications');
        return response.json();
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-specifications'] });
      setIsEditing(false);
      setIsCreating(false);
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ المواصفات التفصيلية بنجاح",
      });
      onSpecificationsUpdate?.(data);
    },
    onError: (error) => {
      toast({
        title: "خطأ في الحفظ",
        description: "فشل في حفظ المواصفات التفصيلية",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (specifications?.specifications) {
      const specs = typeof specifications.specifications === 'string' 
        ? specifications.specifications 
        : JSON.stringify(specifications.specifications, null, 2);
      setEditableSpecs(specs);
    } else {
      // Set default template
      const defaultSpecs = `المواصفات التفصيلية:
• نوع المحرك: ${engineCapacity || 'غير محدد'}
• سنة الصنع: ${year || 'غير محدد'}
• الفئة: ${category || 'غير محدد'}
• درجة التجهيز: ${trimLevel || 'قياسي'}
• نوع الوقود: بنزين
• ناقل الحركة: أوتوماتيك
• عدد الأبواب: 4 أبواب
• الدفع: دفع رباعي

المواصفات الإضافية:
• نظام الترفيه والمعلومات
• نظام السلامة والأمان
• المقاعد والراحة
• التجهيزات الخارجية`;
      setEditableSpecs(defaultSpecs);
    }
  }, [specifications, manufacturer, category, trimLevel, year, engineCapacity]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editableSpecs.trim()) {
      updateSpecificationsMutation.mutate(editableSpecs.trim());
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    // Reset to original specifications
    if (specifications?.specifications) {
      const specs = typeof specifications.specifications === 'string' 
        ? specifications.specifications 
        : JSON.stringify(specifications.specifications, null, 2);
      setEditableSpecs(specs);
    }
  };

  const displaySpecs = () => {
    if (!editableSpecs) return "انقر مرتين لإضافة المواصفات التفصيلية";
    return editableSpecs;
  };

  if (isLoading) {
    return (
      <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <span className="ml-2 text-green-700 dark:text-green-300">جاري تحميل المواصفات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Car className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h4 className="font-semibold text-lg text-green-900 dark:text-green-100">المواصفات التفصيلية</h4>
          {specifications?.id && (
            <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
              {specifications.chassisNumber ? 
                `مربوطة برقم الهيكل: ${specifications.chassisNumber}` : 
                'مربوطة ببيانات المركبة'
              }
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          {isEditing ? (
            <>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateSpecificationsMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4 ml-1" />
                حفظ
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4 ml-1" />
                إلغاء
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/30"
            >
              <Edit3 className="h-4 w-4 ml-1" />
              تحرير
            </Button>
          )}
        </div>
      </div>

      {/* Specifications Content */}
      <div 
        className="relative min-h-[200px] bg-white/50 dark:bg-black/10 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50"
        onDoubleClick={!isEditing ? handleDoubleClick : undefined}
        style={{ cursor: !isEditing ? 'pointer' : 'default' }}
      >
        {isEditing ? (
          <Textarea
            value={editableSpecs}
            onChange={(e) => setEditableSpecs(e.target.value)}
            className="w-full min-h-[180px] text-sm text-gray-800 dark:text-gray-200 resize-none border-0 bg-transparent focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="أدخل المواصفات التفصيلية للمركبة..."
            style={{ 
              fontFamily: '"Noto Sans Arabic", Arial, sans-serif', 
              direction: 'rtl',
              lineHeight: '1.6'
            }}
            autoFocus
          />
        ) : (
          <div className="space-y-2">
            {editableSpecs ? (
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-sans">
                {displaySpecs()}
              </pre>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">لا توجد مواصفات تفصيلية</p>
                <p className="text-xs mt-1">انقر مرتين للإضافة</p>
              </div>
            )}
            
            {!isEditing && editableSpecs && (
              <div className="absolute bottom-2 left-2">
                <span className="text-xs text-gray-400 bg-white/80 dark:bg-black/80 px-2 py-1 rounded">
                  انقر مرتين للتحرير
                </span>
              </div>
            )}
          </div>
        )}

        {updateSpecificationsMutation.isPending && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded-lg">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span className="text-sm text-green-700 dark:text-green-300">جاري الحفظ...</span>
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Info Summary */}
      <div className="mt-3 pt-3 border-t border-green-200/50 dark:border-green-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-400">
          {manufacturer && (
            <div>
              <span className="font-medium">الصانع:</span> {manufacturer}
            </div>
          )}
          {category && (
            <div>
              <span className="font-medium">الفئة:</span> {category}
            </div>
          )}
          {year && (
            <div>
              <span className="font-medium">السنة:</span> {year}
            </div>
          )}
          {engineCapacity && (
            <div>
              <span className="font-medium">المحرك:</span> {engineCapacity}
            </div>
          )}
          {chassisNumber && (
            <div className="col-span-2">
              <span className="font-medium">رقم الهيكل:</span> {chassisNumber}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-xs">
          <AlertCircle className="h-4 w-4 inline ml-1" />
          خطأ في تحميل المواصفات: {error.message}
        </div>
      )}
    </div>
  );
}