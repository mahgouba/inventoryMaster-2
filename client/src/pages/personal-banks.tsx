import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, CreditCard, Copy, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Bank } from "@shared/schema";

export default function PersonalBanksPage() {
  const { toast } = useToast();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [expandedBanks, setExpandedBanks] = useState<Set<number>>(new Set());

  const toggleExpanded = (bankId: number) => {
    const newExpanded = new Set(expandedBanks);
    if (newExpanded.has(bankId)) {
      newExpanded.delete(bankId);
    } else {
      newExpanded.add(bankId);
    }
    setExpandedBanks(newExpanded);
  };

  const { data: banks = [], isLoading } = useQuery<Bank[]>({
    queryKey: ['/api/banks/type/شخصي'],
  });

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      toast({
        title: "تم النسخ",
        description: `تم نسخ ${label} بنجاح`,
      });
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      toast({
        title: "خطأ في النسخ",
        description: "فشل في نسخ النص",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen glass-background p-6" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-white drop-shadow-lg">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-background p-6" dir="rtl">
      {/* Background Animation Removed */}

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="glass-header p-6 rounded-xl">
          <div className="flex items-center gap-4 mb-8">
            <User className="w-8 h-8 text-white drop-shadow-lg" />
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                البنوك الشخصية
              </h1>
              <p className="text-white/80 drop-shadow-lg">
                عرض الحسابات المصرفية الشخصية
              </p>
            </div>
          </div>
        </div>

        {/* Banks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {banks.map((bank) => {
            const isExpanded = expandedBanks.has(bank.id);
            
            return (
              <Card 
                key={bank.id} 
                className="backdrop-blur-xl bg-black/30 border border-white/20 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:bg-black/40"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    {/* Bank Header - Dropdown Style */}
                    <div 
                      className="w-full flex justify-between items-center cursor-pointer group"
                      onClick={() => toggleExpanded(bank.id)}
                    >
                      <div className="flex items-center space-x-4 space-x-reverse">
                        {bank.logo ? (
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <img 
                              src={bank.logo} 
                              alt={bank.bankName} 
                              className="h-18 w-18 object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                              style={{ height: '4.5rem', width: '4.5rem' }}
                            />
                            <h3 className="text-lg font-bold text-white drop-shadow-md">
                              {bank.bankName}
                            </h3>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="h-18 w-18 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                              <User className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white drop-shadow-md">
                              {bank.bankName}
                            </h3>
                          </div>
                        )}
                      </div>
                      
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6 text-white drop-shadow-md transform transition-all duration-300 group-hover:scale-110" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-white drop-shadow-md transform transition-all duration-300 group-hover:scale-110" />
                      )}
                    </div>

                    {/* Expanded Content - Dropdown */}
                    {isExpanded && (
                      <div className="w-full space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <Separator className="bg-white/30" />

                        {/* Bank Details Container */}
                        <div className="space-y-4">
                          {/* Account Name */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold text-white drop-shadow-sm">اسم الحساب</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(bank.accountName, "اسم الحساب");
                                }}
                                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 flex items-center gap-1 backdrop-blur-sm border border-white/20"
                              >
                                {copiedItem === "اسم الحساب" ? (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-white" />
                                )}
                              </Button>
                            </div>
                            <p className="text-white text-right font-medium">{bank.accountName}</p>
                          </div>

                          {/* Account Number */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold text-white drop-shadow-sm">رقم الحساب</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(bank.accountNumber, "رقم الحساب");
                                }}
                                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 flex items-center gap-1 backdrop-blur-sm border border-white/20"
                              >
                                {copiedItem === "رقم الحساب" ? (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-white" />
                                )}
                              </Button>
                            </div>
                            <p className="text-white text-right font-mono">{bank.accountNumber}</p>
                          </div>

                          {/* IBAN */}
                          {bank.iban && (
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center justify-between">
                                <span className="text-base font-bold text-white drop-shadow-sm">رقم الآيبان</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(bank.iban!, "رقم الآيبان");
                                  }}
                                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 flex items-center gap-1 backdrop-blur-sm border border-white/20"
                                >
                                  {copiedItem === "رقم الآيبان" ? (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-white" />
                                  )}
                                </Button>
                              </div>
                              <p className="text-white text-right font-mono">{bank.iban}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {banks.length === 0 && (
          <div className="text-center py-12 glass-container rounded-xl">
            <User className="w-16 h-16 text-white/60 mx-auto mb-4 drop-shadow-lg" />
            <h3 className="text-lg font-medium text-white drop-shadow-lg mb-2">
              لا توجد بنوك شخصية
            </h3>
            <p className="text-white/80 drop-shadow-lg">
              لم يتم العثور على أي حسابات مصرفية شخصية
            </p>
          </div>
        )}
      </div>
    </div>
  );
}