import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Building2, Copy, Share2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Bank } from "@shared/schema";

export default function CompanyBanks() {
  const [expandedBanks, setExpandedBanks] = useState<Set<number>>(new Set());
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: banks = [], isLoading } = useQuery({
    queryKey: ["/api/banks/type/شركة"],
    queryFn: async () => {
      const response = await fetch("/api/banks/type/شركة");
      if (!response.ok) throw new Error("Failed to fetch company banks");
      return response.json() as Promise<Bank[]>;
    }
  });

  const { data: appearance } = useQuery({
    queryKey: ["/api/appearance"],
    queryFn: async () => {
      const response = await fetch("/api/appearance");
      if (!response.ok) throw new Error("Failed to fetch appearance settings");
      return response.json();
    }
  });

  const toggleExpanded = (bankId: number) => {
    const newExpanded = new Set(expandedBanks);
    if (newExpanded.has(bankId)) {
      newExpanded.delete(bankId);
    } else {
      newExpanded.add(bankId);
    }
    setExpandedBanks(newExpanded);
  };

  const copyToClipboard = async (text: string, label: string, elementId?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      
      if (elementId) {
        setCopiedText(elementId);
        setTimeout(() => setCopiedText(null), 1000);
      }
      
      toast({
        title: "تم النسخ",
        description: `تم نسخ ${label} بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في نسخ النص",
        variant: "destructive"
      });
    }
  };

  const shareBank = async (bank: Bank) => {
    const shareText = `
بيانات بنك الشركة
🏦 ${bank.bankName}
🏢 ${bank.accountName}
💳 رقم الحساب: ${bank.accountNumber}
🏧 الآيبان: ${bank.iban}
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `بيانات ${bank.bankName}`,
          text: shareText
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
    <div className="min-h-screen" style={{ background: 'var(--dark-bg-primary)' }} dir="rtl">
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {banks.map((bank) => {
              const isExpanded = expandedBanks.has(bank.id);
              
              return (
                <Card 
                  key={bank.id} 
                  className="glass-container rounded-2xl hover:scale-105 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      {/* Bank Header */}
                      <div 
                        className="w-full flex justify-between items-center cursor-pointer group"
                        onClick={() => toggleExpanded(bank.id)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-4 space-x-reverse">
                            <div className="flex items-center space-x-3 space-x-reverse">
                              {bank.logo ? (
                                <img 
                                  src={bank.logo} 
                                  alt={bank.bankName} 
                                  className="h-18 w-18 object-contain drop-shadow-lg"
                                  style={{ height: '4.5rem', width: '4.5rem' }}
                                />
                              ) : (
                                <div className="h-18 w-18 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                                  <Building2 className="w-8 h-8 text-white" />
                                </div>
                              )}
                              <h3 className="text-lg font-bold text-white drop-shadow-md">
                                {bank.bankName}
                              </h3>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              shareBank(bank);
                            }}
                            className="p-2 hover:bg-[#00627F]/20 rounded-lg transition-all duration-300 backdrop-blur-sm border border-[#00627F]/30"
                            title="مشاركة معلومات البنك"
                          >
                            <Share2 className="w-4 h-4 text-[#00627F]" />
                          </Button>
                        </div>
                        
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-white drop-shadow-md transform transition-all duration-300 group-hover:scale-110" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-white drop-shadow-md transform transition-all duration-300 group-hover:scale-110" />
                        )}
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="w-full space-y-4 animate-in slide-in-from-top-2 duration-300">
                          <Separator className="bg-white/30" />

                          <div className="space-y-6">
                            {/* Account Name */}
                            <div className="text-center">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-bold text-white">{bank.accountName}</h3>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(bank.accountName, "اسم الحساب", `accountName-${bank.id}`);
                                  }}
                                  className={`${
                                    copiedText === `accountName-${bank.id}` 
                                      ? 'bg-green-500/20 scale-110' 
                                      : 'hover:bg-white/20'
                                  } p-2 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20`}
                                  title={copiedText === `accountName-${bank.id}` ? 'تم النسخ ✓' : 'نسخ اسم الحساب'}
                                >
                                  <Copy className="w-4 h-4 text-white" />
                                </Button>
                              </div>
                            </div>

                            {/* Account Number */}
                            <div className="text-center">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-white/70 text-sm">رقم الحساب</p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(bank.accountNumber, "رقم الحساب", `accountNumber-${bank.id}`);
                                  }}
                                  className={`${
                                    copiedText === `accountNumber-${bank.id}` 
                                      ? 'bg-green-500/20 scale-110' 
                                      : 'hover:bg-white/20'
                                  } p-2 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20`}
                                  title={copiedText === `accountNumber-${bank.id}` ? 'تم النسخ ✓' : 'نسخ رقم الحساب'}
                                >
                                  <Copy className="w-4 h-4 text-white" />
                                </Button>
                              </div>
                              <p className="text-lg font-mono text-white mb-3 bg-white/10 rounded-lg p-3 border border-white/20">
                                {bank.accountNumber}
                              </p>
                            </div>

                            {/* IBAN */}
                            <div className="text-center">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-white/70 text-sm">رقم الآيبان</p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(bank.iban, "الآيبان", `iban-${bank.id}`);
                                  }}
                                  className={`${
                                    copiedText === `iban-${bank.id}` 
                                      ? 'bg-green-500/20 scale-110' 
                                      : 'hover:bg-white/20'
                                  } p-2 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20`}
                                  title={copiedText === `iban-${bank.id}` ? 'تم النسخ ✓' : 'نسخ الآيبان'}
                                >
                                  <Copy className="w-4 h-4 text-white" />
                                </Button>
                              </div>
                              <p className="text-lg font-mono text-white mb-3 bg-white/10 rounded-lg p-3 border border-white/20 break-all">
                                {bank.iban}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
  );
}