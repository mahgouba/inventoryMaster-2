import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Building2 className="w-8 h-8 text-[#00627F]" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              بنوك الشركة
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              عرض الحسابات المصرفية لشركة البريمي للسيارات
            </p>
          </div>
        </div>

        {/* Banks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banks.map((bank) => (
            <Card key={bank.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#00627F] rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-right">{bank.name}</CardTitle>
                      <CardDescription className="text-sm text-right">
                        {bank.nameEn}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Account Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    اسم الحساب
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                      {bank.accountName}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(bank.accountName, "اسم الحساب")}
                      className="shrink-0"
                    >
                      {copiedItem === "اسم الحساب" ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    رقم الحساب
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono">
                      {bank.accountNumber}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(bank.accountNumber, "رقم الحساب")}
                      className="shrink-0"
                    >
                      {copiedItem === "رقم الحساب" ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* IBAN */}
                {bank.iban && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      رقم الآيبان
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono">
                        {bank.iban}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(bank.iban!, "رقم الآيبان")}
                        className="shrink-0"
                      >
                        {copiedItem === "رقم الآيبان" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      حالة الحساب
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bank.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {bank.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {banks.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لا توجد بنوك للشركة
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              لم يتم العثور على أي حسابات مصرفية للشركة
            </p>
          </div>
        )}
      </div>
    </div>
  );
}