import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Palette, Check, RotateCcw, Download, Upload } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ThemeConfig {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  gradient: string;
  preview: string;
  variables: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
}

const predefinedThemes: ThemeConfig[] = [
  {
    id: 'monochrome-gradient',
    name: 'Monochrome Gradient',
    nameAr: 'التدرج الأحادي',
    description: 'Same hue, lighter tones',
    descriptionAr: 'نفس اللون بدرجات أفتح',
    gradient: 'linear-gradient(90deg, #00627F 0%, #00A3CC 100%)',
    preview: 'bg-gradient-to-r from-[#00627F] to-[#00A3CC]',
    variables: {
      primary: '#00627F',
      secondary: '#00A3CC',
      accent: '#0081A3',
      background: '#f8fafc',
      foreground: '#1e293b'
    }
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    nameAr: 'المحيط العميق',
    description: 'Navy and teal depths',
    descriptionAr: 'أعماق البحرية والتيل',
    gradient: 'linear-gradient(90deg, #00627F 0%, #001F33 100%)',
    preview: 'bg-gradient-to-r from-[#00627F] to-[#001F33]',
    variables: {
      primary: '#00627F',
      secondary: '#001F33',
      accent: '#003D59',
      background: '#f1f5f9',
      foreground: '#0f172a'
    }
  },
  {
    id: 'elegant-teal-white',
    name: 'Elegant Teal to White',
    nameAr: 'التيل الأنيق للأبيض',
    description: 'Clean modern gradient',
    descriptionAr: 'تدرج حديث ونظيف',
    gradient: 'linear-gradient(90deg, #00627F 0%, #ffffff 100%)',
    preview: 'bg-gradient-to-r from-[#00627F] to-white',
    variables: {
      primary: '#00627F',
      secondary: '#ffffff',
      accent: '#64748b',
      background: '#ffffff',
      foreground: '#1e293b'
    }
  },
  {
    id: 'teal-warm-contrast',
    name: 'Teal with Warm Contrast',
    nameAr: 'التيل مع التباين الدافئ',
    description: 'Cool to warm transition',
    descriptionAr: 'انتقال من البارد للدافئ',
    gradient: 'linear-gradient(90deg, #00627F 0%, #FDB813 100%)',
    preview: 'bg-gradient-to-r from-[#00627F] to-[#FDB813]',
    variables: {
      primary: '#00627F',
      secondary: '#FDB813',
      accent: '#F59E0B',
      background: '#fffbeb',
      foreground: '#92400e'
    }
  }
];

export default function ThemeManagement() {
  const [selectedTheme, setSelectedTheme] = useState<string>('monochrome-gradient');
  const [customColors, setCustomColors] = useState({
    primary: '#00627F',
    secondary: '#00A3CC',
    accent: '#0081A3',
    background: '#f8fafc',
    foreground: '#1e293b'
  });
  
  const queryClient = useQueryClient();

  // Fetch current theme
  const { data: currentTheme, isLoading } = useQuery({
    queryKey: ['/api/appearance/theme'],
    queryFn: () => fetch('/api/appearance/theme').then(res => res.json())
  });

  // Apply theme mutation
  const applyThemeMutation = useMutation({
    mutationFn: (theme: ThemeConfig) => 
      apiRequest('POST', '/api/appearance/theme', theme),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appearance'] });
      toast({
        title: "تم تطبيق الثيم",
        description: "تم تحديث ألوان النظام بنجاح",
      });
      // Apply CSS variables immediately
      const themeToApply = predefinedThemes.find(t => t.id === selectedTheme);
      if (themeToApply) {
        applyThemeToDOM(themeToApply);
      }
    },
    onError: () => {
      toast({
        title: "خطأ في التطبيق",
        description: "فشل في تطبيق الثيم",
        variant: "destructive"
      });
    }
  });

  // Apply theme to DOM
  const applyThemeToDOM = (theme: ThemeConfig) => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.variables.primary);
    root.style.setProperty('--theme-secondary', theme.variables.secondary);
    root.style.setProperty('--theme-accent', theme.variables.accent);
    root.style.setProperty('--theme-background', theme.variables.background);
    root.style.setProperty('--theme-foreground', theme.variables.foreground);
    root.style.setProperty('--theme-gradient', theme.gradient);
  };

  // Handle theme selection
  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    const theme = predefinedThemes.find(t => t.id === themeId);
    if (theme) {
      setCustomColors(theme.variables);
    }
  };

  // Apply selected theme
  const handleApplyTheme = () => {
    const theme = predefinedThemes.find(t => t.id === selectedTheme);
    if (theme) {
      applyThemeMutation.mutate(theme);
    }
  };

  // Reset to default
  const handleReset = () => {
    const defaultTheme = predefinedThemes[0];
    setSelectedTheme(defaultTheme.id);
    setCustomColors(defaultTheme.variables);
    applyThemeMutation.mutate(defaultTheme);
  };

  // Export theme
  const handleExport = () => {
    const theme = predefinedThemes.find(t => t.id === selectedTheme);
    if (theme) {
      const dataStr = JSON.stringify(theme, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `theme-${theme.id}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "تم التصدير",
        description: "تم تصدير الثيم بنجاح",
      });
    }
  };

  useEffect(() => {
    // Apply current theme on load
    if (currentTheme) {
      setSelectedTheme(currentTheme.id || 'monochrome-gradient');
      if (currentTheme.variables) {
        setCustomColors(currentTheme.variables);
        applyThemeToDOM(currentTheme);
      }
    }
  }, [currentTheme]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--dark-bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">جاري تحميل إعدادات الثيمات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--dark-bg-primary)' }}>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8 text-center p-8 rounded-2xl backdrop-blur-xl" style={{ background: 'var(--theme-gradient)' }}>
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3 text-white drop-shadow-lg">
            <Palette className="w-10 h-10" />
            إدارة الثيمات
          </h1>
          <p className="text-white/90 text-lg drop-shadow-md">تخصيص مظهر وألوان النظام بالكامل</p>
        </div>

        {/* Predefined Themes Section */}
        <Card className="mb-8 backdrop-blur-xl bg-white/5 border border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-xl">الثيمات المحددة مسبقاً</CardTitle>
            <p className="text-white/80">اختر من بين الثيمات المصممة خصيصاً</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {predefinedThemes.map((theme) => (
                <div
                  key={theme.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 backdrop-blur-sm ${
                    selectedTheme === theme.id 
                      ? 'border-white scale-105 shadow-2xl' 
                      : 'border-white/30 hover:border-white/60'
                  }`}
                  onClick={() => handleThemeSelect(theme.id)}
                >
                  <div 
                    className={`h-20 rounded-lg mb-3 ${theme.preview}`}
                  ></div>
                  <h3 className="font-bold text-white mb-1">{theme.nameAr}</h3>
                  <p className="text-sm text-white/70">{theme.descriptionAr}</p>
                  {selectedTheme === theme.id && (
                    <div className="mt-2 flex justify-center">
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Color Customization Section */}
        <Card className="mb-8 backdrop-blur-xl bg-white/5 border border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-xl">تخصيص الألوان</CardTitle>
            <p className="text-white/80">تخصيص ألوان الثيم المختار</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(customColors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium text-white block">
                    {key === 'primary' ? 'اللون الأساسي' :
                     key === 'secondary' ? 'اللون الثانوي' :
                     key === 'accent' ? 'لون التمييز' :
                     key === 'background' ? 'لون الخلفية' :
                     'لون النص'}
                  </label>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => setCustomColors(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))}
                      className="w-12 h-10 rounded border border-white/30 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setCustomColors(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))}
                      className="flex-1 px-3 py-2 text-sm rounded border border-white/30 bg-white/10 text-white placeholder-white/50"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={handleApplyTheme}
            disabled={applyThemeMutation.isPending}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-xl"
          >
            {applyThemeMutation.isPending ? 'جاري التطبيق...' : 'تطبيق الثيم'}
            <Check className="w-4 h-4 mr-2" />
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            إعادة تعيين
          </Button>

          <Button
            onClick={handleExport}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-xl"
          >
            <Download className="w-4 h-4 mr-2" />
            تصدير الثيم
          </Button>
        </div>
      </div>
    </div>
  );
}