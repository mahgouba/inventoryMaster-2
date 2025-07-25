import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Building2, CreditCard, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Bank } from "@shared/schema";

export default function CompanyBanksPage() {
  const { toast } = useToast();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const { data: banks = [], isLoading } = useQuery<Bank[]>({
    queryKey: ['/api/banks/type/شركة'],
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
      {/* Animated Mesh Background */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-80 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-60 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-40 right-20 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>
        <div className="absolute top-40 -right-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-8000"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="glass-header p-6 rounded-xl">
          <div className="flex items-center gap-4 mb-8">
            <Building2 className="w-8 h-8 text-white drop-shadow-lg" />
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                بنوك الشركة
              </h1>
              <p className="text-white/80 drop-shadow-lg">
                عرض الحسابات المصرفية لشركة البريمي للسيارات
              </p>
            </div>
          </div>
        </div>

        {/* Banks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banks.map((bank) => (
            <div key={bank.id} className="glass-card hover:glass-card-hover transition-all duration-300 rounded-xl p-6">
              <div className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-18 h-18 bg-white/20 rounded-full flex items-center justify-center shadow-lg border border-white/30">
                      {bank.logo ? (
                        <img 
                          src={bank.logo} 
                          alt={bank.bankName} 
                          className="w-16 h-16 object-contain"
                        />
                      ) : (
                        <CreditCard className="w-8 h-8 text-white drop-shadow-lg" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white drop-shadow-lg text-right">{bank.bankName}</h3>
                      <p className="text-sm text-white/80 drop-shadow-lg text-right">
                        حساب الشركة
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {/* Account Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90 drop-shadow-lg">
                    اسم الحساب
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-white">
                      {bank.accountName}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(bank.accountName, "اسم الحساب")}
                      className="shrink-0 bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      {copiedItem === "اسم الحساب" ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90 drop-shadow-lg">
                    رقم الحساب
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-mono text-white">
                      {bank.accountNumber}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(bank.accountNumber, "رقم الحساب")}
                      className="shrink-0 bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      {copiedItem === "رقم الحساب" ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* IBAN */}
                {bank.iban && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90 drop-shadow-lg">
                      رقم الآيبان
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-mono text-white">
                        {bank.iban}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(bank.iban!, "رقم الآيبان")}
                        className="shrink-0 bg-white/10 border-white/30 text-white hover:bg-white/20"
                      >
                        {copiedItem === "رقم الآيبان" ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="pt-2 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/80 drop-shadow-lg">
                      حالة الحساب
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      bank.isActive 
                        ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                        : 'bg-red-500/20 text-red-300 border border-red-400/30'
                    }`}>
                      {bank.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {banks.length === 0 && (
          <div className="text-center py-12 glass-container rounded-xl">
            <Building2 className="w-16 h-16 text-white/60 mx-auto mb-4 drop-shadow-lg" />
            <h3 className="text-lg font-medium text-white drop-shadow-lg mb-2">
              لا توجد بنوك للشركة
            </h3>
            <p className="text-white/80 drop-shadow-lg">
              لم يتم العثور على أي حسابات مصرفية للشركة
            </p>
          </div>
        )}
      </div>
    </div>
  );
}