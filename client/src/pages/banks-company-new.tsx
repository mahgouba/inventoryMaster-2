import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Building2, Copy, Share2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Bank {
  id: number;
  bankName: string;
  nameEn: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  type: string;
  isActive: boolean;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

interface AppearanceSettings {
  companyLogo?: string;
}

export default function BanksCompany() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch banks data
  const { data: banks = [], isLoading } = useQuery<Bank[]>({
    queryKey: ['/api/banks/type/شركة'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch appearance settings
  const { data: appearance } = useQuery<AppearanceSettings>({
    queryKey: ['/api/appearance'],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: `تم نسخ ${label}`,
        description: `تم نسخ ${label} إلى الحافظة بنجاح`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "خطأ في النسخ",
        description: "فشل في نسخ البيانات إلى الحافظة",
        variant: "destructive",
      });
    }
  };

  const shareBank = async (bank: Bank) => {
    const shareText = `بيانات ${bank.bankName}:
اسم الحساب: ${bank.accountName}
رقم الحساب: ${bank.accountNumber}
الآيبان: ${bank.iban}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `بيانات ${bank.bankName}`,
          text: shareText,
        });
      } catch (error) {
        await copyToClipboard(shareText, "بيانات البنك");
      }
    } else {
      await copyToClipboard(shareText, "بيانات البنك");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--dark-bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">جاري تحميل البنوك...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen" style={{ background: 'var(--dark-bg-primary)' }} dir="rtl">
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header with Company Logo and Title - Compact Style */}
          <div className="glass-container mb-6 p-4">
            <div className="flex items-center justify-center gap-4">
              {appearance?.companyLogo ? (
                <img 
                  src={appearance.companyLogo} 
                  alt="شعار الشركة" 
                  className="w-16 h-16 object-contain drop-shadow-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <img 
                  src="/copmany logo.svg" 
                  alt="شعار شركة البريمي للسيارات" 
                  className="w-16 h-16 object-contain drop-shadow-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
              
              <h1 className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-lg">
                <Building2 className="w-6 h-6" />
                بنوك شركة البريمي للسيارات
              </h1>
            </div>
          </div>

          {/* Banks Grid */}
          {banks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banks.map((bank) => (
                <Card 
                  key={bank.id} 
                  className="glass-container rounded-2xl hover:scale-105 transition-all duration-300"
                >
                  <CardContent className="p-5">
                    {/* Bank Header */}
                    <div className="flex items-center gap-3 mb-4">
                      {bank.logo ? (
                        <img 
                          src={bank.logo} 
                          alt={bank.bankName} 
                          className="h-14 w-14 object-contain drop-shadow-lg"
                        />
                      ) : (
                        <div className="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                          <Building2 className="w-7 h-7 text-white" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white drop-shadow-md">
                          {bank.bankName}
                        </h3>
                        <p className="text-sm text-white/70">{bank.accountName}</p>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => shareBank(bank)}
                        className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-300 backdrop-blur-sm"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Bank Details */}
                    <div className="space-y-3">
                      {/* Account Number */}
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-white/80">رقم الحساب</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(bank.accountNumber, "رقم الحساب")}
                            className="p-1 hover:bg-white/20 rounded text-xs"
                          >
                            <Copy className="w-3 h-3 text-white" />
                          </Button>
                        </div>
                        <p className="text-sm text-white font-mono bg-white/10 rounded px-3 py-2 text-center">
                          {bank.accountNumber}
                        </p>
                      </div>
                      
                      {/* IBAN */}
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-white/80">الآيبان</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(bank.iban, "الآيبان")}
                            className="p-1 hover:bg-white/20 rounded text-xs"
                          >
                            <Copy className="w-3 h-3 text-white" />
                          </Button>
                        </div>
                        <p className="text-xs text-white font-mono bg-white/10 rounded px-3 py-2 break-all text-center">
                          {bank.iban}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20">
              <Building2 className="w-20 h-20 text-white/50 mx-auto mb-6 drop-shadow-lg" />
              <h3 className="text-2xl font-semibold text-white mb-4 drop-shadow-md">لا توجد بنوك شركات</h3>
              <p className="text-white/70 text-lg">لم يتم إضافة أي بنوك شركات حتى الآن</p>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}