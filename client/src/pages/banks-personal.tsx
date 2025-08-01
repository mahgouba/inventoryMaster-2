import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Copy, Share2, ChevronDown, ChevronUp, MoreVertical, Edit3, Trash2, EyeOff, Plus } from "lucide-react";
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

  // Listen for bank data changes from management page
  useEffect(() => {
    const handleDataChange = () => {
      // Update hidden banks from localStorage
      const saved = localStorage.getItem('hiddenBanks');
      const newHiddenBanks = saved ? new Set<number>(JSON.parse(saved)) : new Set<number>();
      setHiddenBanks(newHiddenBanks);
      
      // Refresh the query to get updated data
      queryClient.invalidateQueries({ queryKey: ["/api/banks/type/شخصي"] });
    };

    const handleVisibilityChange = handleDataChange;

    // Listen to both events for comprehensive updates
    window.addEventListener('bankDataChanged', handleDataChange);
    window.addEventListener('bankVisibilityChanged', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('bankDataChanged', handleDataChange);
      window.removeEventListener('bankVisibilityChanged', handleVisibilityChange);
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

  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string, elementId?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Trigger animation for specific element
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

  // Delete bank mutation
  const deleteBankMutation = useMutation({
    mutationFn: async (bankId: number) => {
      const response = await fetch(`/api/banks/${bankId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete bank');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banks/type/شخصي"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف البنك بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في الحذف",
        description: "فشل في حذف البنك",
        variant: "destructive"
      });
    }
  });

  // Hide bank function
  const hideBank = (bankId: number) => {
    const newHiddenBanks = new Set(hiddenBanks);
    newHiddenBanks.add(bankId);
    setHiddenBanks(newHiddenBanks);
    localStorage.setItem('hiddenBanks', JSON.stringify(Array.from(newHiddenBanks)));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('bankVisibilityChanged'));
    
    toast({
      title: "تم إخفاء البنك",
      description: "تم إخفاء البنك من العرض",
    });
  };

  // Delete bank function
  const deleteBank = async (bankId: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا البنك؟')) {
      try {
        deleteBankMutation.mutate(bankId);
      } catch (error) {
        toast({
          title: "خطأ في الحذف",
          description: "فشل في حذف البنك",
          variant: "destructive"
        });
      }
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
              <User className="w-6 h-6" />
              البنوك الشخصية - شركة البريمي للسيارات
            </h1>
          </div>
        </div>

        {/* Banks Grid - Match Inventory Style */}
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
                          
                          {/* Share Icon Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              shareBank(bank);
                            }}
                            className="p-2 hover:bg-purple-500/20 rounded-lg transition-all duration-300 backdrop-blur-sm border border-purple-500/30"
                            title="مشاركة معلومات البنك"
                          >
                            <Share2 className="w-4 h-4 text-purple-400" />
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

                          {/* Share Button - Large */}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              shareBank(bank);
                            }}
                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg py-3 px-6 font-medium transition-all duration-300 backdrop-blur-sm shadow-lg"
                          >
                            <Share2 className="w-5 h-5 ml-2" />
                            مشاركة بيانات البنك
                          </Button>

                          {/* Bank Details Container - Clean Layout */}
                          <div className="space-y-6">
                            {/* Account Name */}
                            <div className="text-center">
                              <h3 className="text-xl font-bold text-white mb-3">{bank.accountName}</h3>
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
                                } p-2 rounded-lg transition-all duration-300 flex items-center gap-2 backdrop-blur-sm border border-white/20`}
                              >
                                <Copy className="w-4 h-4 text-white" />
                                <span className="text-sm text-white">
                                  {copiedText === `accountName-${bank.id}` ? 'تم النسخ ✓' : 'نسخ اسم الحساب'}
                                </span>
                              </Button>
                            </div>

                            {/* Account Number */}
                            <div className="text-center">
                              <p className="text-white/70 text-sm mb-2">رقم الحساب</p>
                              <p className="text-lg font-mono text-white mb-3 bg-white/10 rounded-lg p-3 border border-white/20">
                                {bank.accountNumber}
                              </p>
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
                                } p-2 rounded-lg transition-all duration-300 flex items-center gap-2 backdrop-blur-sm border border-white/20`}
                              >
                                <Copy className="w-4 h-4 text-white" />
                                <span className="text-sm text-white">
                                  {copiedText === `accountNumber-${bank.id}` ? 'تم النسخ ✓' : 'نسخ رقم الحساب'}
                                </span>
                              </Button>
                            </div>

                            {/* IBAN */}
                            <div className="text-center">
                              <p className="text-white/70 text-sm mb-2">رقم الآيبان</p>
                              <p className="text-lg font-mono text-white mb-3 bg-white/10 rounded-lg p-3 border border-white/20 break-all">
                                {bank.iban}
                              </p>
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
                                } p-2 rounded-lg transition-all duration-300 flex items-center gap-2 backdrop-blur-sm border border-white/20`}
                              >
                                <Copy className="w-4 h-4 text-white" />
                                <span className="text-sm text-white">
                                  {copiedText === `iban-${bank.id}` ? 'تم النسخ ✓' : 'نسخ الآيبان'}
                                </span>
                              </Button>
                            </div>
                          </div>

                          {/* Management Actions Dropdown */}
                          <div className="pt-4 border-t border-white/20">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-between hover:bg-white/10 text-white"
                                >
                                  <span className="flex items-center gap-2">
                                    <MoreVertical className="w-4 h-4" />
                                    إدارة البنك
                                  </span>
                                  <ChevronDown className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-48 bg-black/90 border-white/20">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    shareBank(bank);
                                  }}
                                  className="text-white hover:bg-white/10 cursor-pointer"
                                >
                                  <Share2 className="w-4 h-4 ml-2" />
                                  مشاركة
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(`${bank.bankName}\n${bank.accountName}\n${bank.accountNumber}\n${bank.iban}`, "بيانات البنك");
                                  }}
                                  className="text-white hover:bg-white/10 cursor-pointer"
                                >
                                  <Copy className="w-4 h-4 ml-2" />
                                  نسخ الكل
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    hideBank(bank.id);
                                  }}
                                  className="text-white hover:bg-white/10 cursor-pointer"
                                >
                                  <EyeOff className="w-4 h-4 ml-2" />
                                  إخفاء
                                </DropdownMenuItem>
                                <Link href="/bank-management">
                                  <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                                    <Edit3 className="w-4 h-4 ml-2" />
                                    تحرير
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteBank(bank.id);
                                  }}
                                  className="text-red-400 hover:bg-red-500/20 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 ml-2" />
                                  حذف
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
          <div className="glass-container p-12 text-center">
            <User className="w-24 h-24 text-white/40 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">لا توجد بنوك شخصية</h2>
            <p className="text-white/70 mb-6">لم يتم العثور على أي حسابات بنكية شخصية</p>
            <Link href="/bank-management">
              <Button className="glass-button-primary">
                <Plus className="w-5 h-5 ml-2" />
                إضافة بنك جديد
              </Button>
            </Link>
          </div>
        )}


      </div>
    </div>
    </TooltipProvider>
  );
}