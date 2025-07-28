import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Copy, Share2, ChevronDown, ChevronUp, ArrowLeft, Info, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Bank } from "@shared/schema";

export default function PersonalBanks() {
  const [expandedBanks, setExpandedBanks] = useState<Set<number>>(new Set());
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [hiddenBanks, setHiddenBanks] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('hiddenBanks');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Listen for bank visibility changes from management page
  useEffect(() => {
    const handleVisibilityChange = (event: CustomEvent) => {
      const saved = localStorage.getItem('hiddenBanks');
      const newHiddenBanks = saved ? new Set<number>(JSON.parse(saved)) : new Set<number>();
      setHiddenBanks(newHiddenBanks);
      
      // Refresh the query to get updated data
      queryClient.invalidateQueries({ queryKey: ["/api/banks/type/شخصي"] });
    };

    window.addEventListener('bankVisibilityChanged', handleVisibilityChange as EventListener);
    
    return () => {
      window.removeEventListener('bankVisibilityChanged', handleVisibilityChange as EventListener);
    };
  }, [queryClient]);

  const { data: allBanks = [], isLoading } = useQuery({
    queryKey: ["/api/banks/type/شخصي"],
    queryFn: async () => {
      const response = await fetch("/api/banks/type/شخصي");
      if (!response.ok) throw new Error("Failed to fetch personal banks");
      return response.json() as Promise<Bank[]>;
    }
  });

  // Filter out hidden banks
  const banks = allBanks.filter(bank => !hiddenBanks.has(bank.id));

  // Fetch company logo from appearance settings
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

  const handleLongPressStart = (bank: Bank) => {
    const timer = setTimeout(() => {
      shareBank(bank);
      toast({
        title: "تم مشاركة البيانات",
        description: `تمت مشاركة بيانات ${bank.bankName}`,
      });
    }, 800); // 800ms for long press
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-purple-950 relative overflow-hidden">
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-teal-500 to-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        <div className="text-white text-xl font-semibold drop-shadow-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-950 relative overflow-hidden" dir="rtl">
      {/* Animated Mesh Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-teal-500 to-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-10 right-20 w-72 h-72 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/20">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للرئيسية
            </Button>
          </Link>
          
          <div className="flex-1 flex justify-center">
            {appearance?.companyLogo ? (
              <img 
                src={appearance.companyLogo} 
                alt="شعار الشركة" 
                className="w-32 h-32 object-contain drop-shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <img 
                src="/company-logo.svg" 
                alt="شعار شركة البريمي للسيارة" 
                className="w-32 h-32 object-contain drop-shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
          </div>
          
          <div className="flex-1"></div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3 drop-shadow-lg">
            <User className="w-10 h-10" />
            شركة البريمي للسيارة
          </h1>
          <p className="text-white/80 text-lg">معلومات الحسابات البنكية الشخصية</p>
        </div>

        {/* Banks Grid */}
        {banks.length > 0 ? (
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
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-4 space-x-reverse">
                            {bank.logo ? (
                              <div className="flex items-center space-x-3 space-x-reverse">
                                <img 
                                  src={bank.logo} 
                                  alt={bank.bankName} 
                                  className="h-18 w-18 object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                                  style={{ height: '4.5rem', width: '4.5rem' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    shareBank(bank);
                                  }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    handleLongPressStart(bank);
                                  }}
                                  onMouseUp={(e) => {
                                    e.stopPropagation();
                                    handleLongPressEnd();
                                  }}
                                  onMouseLeave={(e) => {
                                    e.stopPropagation();
                                    handleLongPressEnd();
                                  }}
                                  onTouchStart={(e) => {
                                    e.stopPropagation();
                                    handleLongPressStart(bank);
                                  }}
                                  onTouchEnd={(e) => {
                                    e.stopPropagation();
                                    handleLongPressEnd();
                                  }}
                                  onTouchCancel={(e) => {
                                    e.stopPropagation();
                                    handleLongPressEnd();
                                  }}
                                />
                                <h3 className="text-lg font-bold text-white drop-shadow-md">
                                  {bank.bankName}
                                </h3>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-3 space-x-reverse">
                                <div 
                                  className="h-18 w-18 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    shareBank(bank);
                                  }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    handleLongPressStart(bank);
                                  }}
                                  onMouseUp={(e) => {
                                    e.stopPropagation();
                                    handleLongPressEnd();
                                  }}
                                  onMouseLeave={(e) => {
                                    e.stopPropagation();
                                    handleLongPressEnd();
                                  }}
                                  onTouchStart={(e) => {
                                    e.stopPropagation();
                                    handleLongPressStart(bank);
                                  }}
                                  onTouchEnd={(e) => {
                                    e.stopPropagation();
                                    handleLongPressEnd();
                                  }}
                                  onTouchCancel={(e) => {
                                    e.stopPropagation();
                                    handleLongPressEnd();
                                  }}
                                >
                                  <User className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white drop-shadow-md">
                                  {bank.bankName}
                                </h3>
                              </div>
                            )}
                          </div>
                          
                          {/* Quick Share Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              shareBank(bank);
                            }}
                            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 flex items-center gap-1 backdrop-blur-sm border border-white/20"
                            title="مشاركة معلومات البنك"
                          >
                            <Share2 className="w-4 h-4 text-white" />
                            <span className="text-xs text-white hidden sm:inline">مشاركة</span>
                          </Button>
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

                          {/* Bank Details Container - Remove borders */}
                          <div className="space-y-4">
                            {/* Account Name */}
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-base font-bold text-white drop-shadow-sm">اسم الحساب</span>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Info className="w-3 h-3 text-white/60 hover:text-white/80" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-black/90 text-white border-white/20">
                                      <p className="text-xs">انقر للنسخ أو اضغط على الشعار للمشاركة السريعة</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(bank.accountName, "اسم الحساب");
                                  }}
                                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 flex items-center gap-1 backdrop-blur-sm border border-white/20"
                                >
                                  <Copy className="w-4 h-4 text-white" />
                                  <span className="text-xs text-white">نسخ</span>
                                </Button>
                              </div>
                              <p className="text-sm text-white/90">{bank.accountName}</p>
                            </div>

                            {/* Account Number */}
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-base font-bold text-white drop-shadow-sm">رقم الحساب</span>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Info className="w-3 h-3 text-white/60 hover:text-white/80" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-black/90 text-white border-white/20">
                                      <p className="text-xs">رقم الحساب البنكي للتحويلات المحلية</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(bank.accountNumber, "رقم الحساب");
                                  }}
                                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 flex items-center gap-1 backdrop-blur-sm border border-white/20"
                                >
                                  <Copy className="w-4 h-4 text-white" />
                                  <span className="text-xs text-white">نسخ</span>
                                </Button>
                              </div>
                              <p className="text-sm text-white/90">{bank.accountNumber}</p>
                            </div>

                            {/* IBAN */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-base font-bold text-white drop-shadow-sm">الآيبان</span>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Info className="w-3 h-3 text-white/60 hover:text-white/80" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-black/90 text-white border-white/20">
                                      <p className="text-xs">رقم الحساب الدولي للتحويلات الخارجية</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(bank.iban, "الآيبان");
                                  }}
                                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 flex items-center gap-1 backdrop-blur-sm border border-white/20"
                                >
                                  <Copy className="w-4 h-4 text-white" />
                                  <span className="text-xs text-white">نسخ</span>
                                </Button>
                              </div>
                              <p className="text-sm break-all text-white/90">{bank.iban}</p>
                            </div>
                          </div>

                          {/* Actions Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20"
                              >
                                <MoreVertical className="w-5 h-5" />
                                <span className="font-semibold">الإجراءات</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white/90 backdrop-blur-sm border-white/20" align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  shareBank(bank);
                                }}
                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100/50"
                              >
                                <Share2 className="w-4 h-4" />
                                <span>مشاركة بيانات البنك</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(`${bank.bankName}\nاسم الحساب: ${bank.accountName}\nرقم الحساب: ${bank.accountNumber}\nالآيبان: ${bank.iban}`, "بيانات البنك");
                                }}
                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100/50"
                              >
                                <Copy className="w-4 h-4" />
                                <span>نسخ كامل البيانات</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            <User className="w-20 h-20 text-white/50 mx-auto mb-6 drop-shadow-lg" />
            <h3 className="text-2xl font-semibold text-white mb-4 drop-shadow-md">لا توجد بنوك شخصية</h3>
            <p className="text-white/70 text-lg">لم يتم إضافة أي بنوك شخصية حتى الآن</p>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 flex justify-center">
          <Link href="/banks-company">
            <Button 
              variant="outline" 
              className="backdrop-blur-xl bg-white/10 text-white border-white/30 hover:bg-white/20 px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              عرض بنوك الشركات
            </Button>
          </Link>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}