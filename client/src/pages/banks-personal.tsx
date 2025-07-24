import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Copy, Share2, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Bank } from "@shared/schema";

export default function PersonalBanks() {
  const [expandedBanks, setExpandedBanks] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const { data: banks = [], isLoading } = useQuery({
    queryKey: ["/api/banks/type/شخصي"],
    queryFn: async () => {
      const response = await fetch("/api/banks/type/شخصي");
      if (!response.ok) throw new Error("Failed to fetch personal banks");
      return response.json() as Promise<Bank[]>;
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

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
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
بيانات البنك الشخصي
🏦 ${bank.bankName}
👤 ${bank.accountName}
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
      <div className="min-h-screen bg-[#00627f] flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#00627f] transition-colors duration-200" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للرئيسية
            </Button>
          </Link>
          
          <div className="flex-1 flex justify-center">
            <img 
              src="/albarimi.png" 
              alt="شعار الشركة" 
              className="w-35 h-35 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          
          <div className="flex-1"></div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <User className="w-8 h-8" />
            البنوك الشخصية
          </h1>
          <p className="text-white/80">معلومات الحسابات البنكية الشخصية</p>
        </div>

        {/* Banks Grid */}
        {banks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
            {banks.map((bank) => {
              const isExpanded = expandedBanks.has(bank.id);
              
              return (
                <Card 
                  key={bank.id} 
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-3">
                      {/* Bank Header */}
                      <div 
                        className="w-full flex justify-between items-center cursor-pointer"
                        onClick={() => toggleExpanded(bank.id)}
                      >
                        {bank.logo ? (
                          <img 
                            src={bank.logo} 
                            alt={bank.bankName} 
                            className="h-12 w-12 object-contain"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#00627F] transform transition-transform duration-200" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#00627F] transform transition-transform duration-200" />
                        )}
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="w-full space-y-3">
                          {/* Account Name */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold text-[#00627F]">اسم الحساب</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(bank.accountName, "اسم الحساب");
                                }}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-300 flex items-center gap-1"
                              >
                                <Copy className="w-4 h-4 text-[#00627F]" />
                                <span className="text-xs text-[#00627F]">نسخ</span>
                              </Button>
                            </div>
                            <p className="text-sm text-[#00627F]">{bank.accountName}</p>
                          </div>

                          <Separator />

                          {/* Account Number */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold text-[#00627F]">رقم الحساب</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(bank.accountNumber, "رقم الحساب");
                                }}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-300 flex items-center gap-1"
                              >
                                <Copy className="w-4 h-4 text-[#00627F]" />
                                <span className="text-xs text-[#00627F]">نسخ</span>
                              </Button>
                            </div>
                            <p className="text-sm text-[#00627F]">{bank.accountNumber}</p>
                          </div>

                          <Separator />

                          {/* IBAN */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold text-[#00627F]">الآيبان</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(bank.iban, "الآيبان");
                                }}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-300 flex items-center gap-1"
                              >
                                <Copy className="w-4 h-4 text-[#00627F]" />
                                <span className="text-xs text-[#00627F]">نسخ</span>
                              </Button>
                            </div>
                            <p className="text-sm break-all text-[#00627F]">{bank.iban}</p>
                          </div>

                          <Separator />

                          {/* Bank Name */}
                          <h3 className="text-lg font-bold text-center text-[#00627F]">
                            {bank.bankName}
                          </h3>

                          <Badge className="bg-green-100 text-green-800 justify-center">
                            <User className="w-3 h-3 ml-1" />
                            {bank.type}
                          </Badge>
                        </div>
                      )}

                      {/* Share Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          shareBank(bank);
                        }}
                        className="w-full mt-3 bg-[#00627F] text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#005266] active:scale-95 transition duration-300 animate-pulse hover:animate-none"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>مشاركة</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">لا توجد بنوك شخصية</h3>
            <p className="text-white/70">لم يتم إضافة أي بنوك شخصية حتى الآن</p>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 flex justify-center">
          <Link href="/banks-company">
            <Button 
              variant="outline" 
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              عرض بنوك الشركات
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}